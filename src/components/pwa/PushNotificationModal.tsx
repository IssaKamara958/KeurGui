import React, { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useToast } from '../ui/Toast';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Check,
  TrendingDown,
  Layers,
  FileCheck,
  X,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { PushNotificationCategory } from '../../types';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'settings' | 'history';
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'settings',
}) => {
  const { showToast } = useToast();
  const {
    isSupported,
    settings,
    notifications,
    unreadCount,
    subscribe,
    unsubscribe,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestPriceAlert,
    sendTestStepAlert,
  } = usePushNotifications();

  const [activeTab, setActiveTab] = useState<'settings' | 'history'>(initialTab);
  const [subscriberName, setSubscriberName] = useState(settings.subscriberName || '');
  const [subscriberPhone, setSubscriberPhone] = useState(settings.subscriberPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<PushNotificationCategory | 'all'>('all');

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupported) {
      showToast('Les notifications ne sont pas supportées par votre navigateur actuel.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await subscribe({
        name: subscriberName.trim() || undefined,
        phone: subscriberPhone.trim() || undefined,
      });

      if (result.success) {
        showToast('Notifications PWA activées avec succès !', 'success');
        setActiveTab('history');
      } else if (result.status === 'denied') {
        showToast('Permission refusée dans les paramètres de votre navigateur.', 'error');
      } else {
        showToast('L\'autorisation des notifications n\'a pas été accordée.', 'info');
      }
    } catch {
      showToast('Erreur lors de l\'activation des notifications.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    showToast('Vous êtes désabonné des notifications.', 'info');
  };

  const handleTestPrice = async () => {
    await sendTestPriceAlert(52500000, 55000000);
    showToast('Alerte de baisse de prix envoyée !', 'success');
  };

  const handleTestStep = async () => {
    await sendTestStepAlert(
      'Compromis de vente & Consignation notariée',
      'Le dossier de Keur Mame Fatou avance vers l\'étape d\'enregistrement officiel chez le notaire.',
      'compromis'
    );
    showToast('Alerte de nouvelle étape d\'achat envoyée !', 'success');
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const getCategoryBadge = (category: PushNotificationCategory) => {
    switch (category) {
      case 'price_change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            <TrendingDown className="w-3 h-3" />
            Prix
          </span>
        );
      case 'purchase_step':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <Layers className="w-3 h-3" />
            Étape Achat
          </span>
        );
      case 'legal_document':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
            <FileCheck className="w-3 h-3" />
            Cadastre / Titre
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
            Système
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Alertes PWA en Direct
                </h3>
                {settings.isSubscribed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Abonné
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Changement de prix & nouvelles étapes d'achat pour Keur Mame Fatou
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Abonnement & Préférences
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>Historique des alertes</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-3xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'settings' ? (
            <div className="space-y-4">
              {!isSupported ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Notifications non supportées sur ce navigateur</span>
                    <p className="mt-1">
                      Pour recevoir des alertes push PWA, ouvrez cette application sur Chrome, Edge, Safari (iOS 16.4+) ou installez l'application sur votre écran d'accueil.
                    </p>
                  </div>
                </div>
              ) : settings.permissionStatus === 'denied' ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
                  <BellOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Notifications bloquées par votre navigateur</span>
                    <p className="mt-1">
                      Vous avez précédemment refusé les notifications. Pour les réactiver, cliquez sur l'icône de cadenas ou de réglages à gauche de la barre d'adresse de votre navigateur et autorisez les notifications.
                    </p>
                  </div>
                </div>
              ) : !settings.isSubscribed ? (
                /* Registration Form */
                <form onSubmit={handleSubscribe} className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Avantages de l'alerte PWA Keur Mame Fatou
                    </span>
                    <ul className="text-2xs text-emerald-800 dark:text-emerald-300 space-y-1 pl-4 list-disc">
                      <li>Notification instantanée si le prix de la maison (55 000 000 FCFA) est revu</li>
                      <li>Suivi transparent des étapes de la transaction (Visites, Offres, Acte notarié)</li>
                      <li>Fonctionne même lorsque l'application est fermée sur smartphone et ordinateur</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                        Votre Prénom / Nom (optionnel)
                      </label>
                      <input
                        type="text"
                        value={subscriberName}
                        onChange={(e) => setSubscriberName(e.target.value)}
                        placeholder="Ex: Cheikh Diop"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                        Téléphone WhatsApp (optionnel)
                      </label>
                      <input
                        type="tel"
                        value={subscriberPhone}
                        onChange={(e) => setSubscriberPhone(e.target.value)}
                        placeholder="Ex: +221 77 123 45 67"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4 fill-current" />
                    <span>{isSubmitting ? 'Activation en cours...' : 'Activer les alertes Push PWA'}</span>
                  </button>
                </form>
              ) : (
                /* Subscribed Controls & Preferences */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 block">
                          Service PWA actif sur cet appareil
                        </span>
                        <span className="text-2xs text-emerald-700 dark:text-emerald-300 block">
                          {settings.subscriberName
                            ? `Inscrit en tant que ${settings.subscriberName}`
                            : 'Abonnement direct activé'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleUnsubscribe}
                      className="px-2.5 py-1 text-2xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    >
                      Se désabonner
                    </button>
                  </div>

                  {/* Preferences Toggles */}
                  <div className="space-y-2.5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Catégories d'alertes souhaitées
                    </span>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                            Changements de prix
                          </span>
                          <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">
                            Alerte immédiate en cas de baisse ou révision du tarif
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifyPriceChange}
                        onChange={(e) => updatePreferences({ notifyPriceChange: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                            Étapes du processus d'achat
                          </span>
                          <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">
                            Offres, compromis, actes notariés et remise des clés
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifyPurchaseStep}
                        onChange={(e) => updatePreferences({ notifyPurchaseStep: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                            Mise à jour cadastre & documents juridiques
                          </span>
                          <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">
                            Certificats notariés, plans 600m² et conformité
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifyLegalDocuments}
                        onChange={(e) => updatePreferences({ notifyLegalDocuments: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Immediate Test Action Buttons */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Vérifier la réception sur votre appareil
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={handleTestPrice}
                        className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tester alerte Prix</span>
                      </button>
                      <button
                        onClick={handleTestStep}
                        className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tester alerte Étape</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {/* Category Filter & Mark All Read */}
              <div className="flex items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-1 overflow-x-auto text-2xs">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      filterCategory === 'all'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Toutes ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilterCategory('price_change')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      filterCategory === 'price_change'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Prix
                  </button>
                  <button
                    onClick={() => setFilterCategory('purchase_step')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      filterCategory === 'purchase_step'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Étapes
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-2 py-1 rounded-lg text-2xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
                      title="Tout marquer comme lu"
                    >
                      Tout lire
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 cursor-pointer"
                      title="Vider l'historique"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Items List */}
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs space-y-1">
                  <BellOff className="w-6 h-6 mx-auto stroke-1" />
                  <p>Aucune notification enregistrée dans cette catégorie.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        notif.read
                          ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800'
                          : 'bg-white dark:bg-neutral-800 border-amber-300 dark:border-amber-600/60 shadow-xs ring-1 ring-amber-400/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          {getCategoryBadge(notif.category)}
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                        <span className="text-3xs text-neutral-400">
                          {new Date(notif.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {notif.title}
                      </h4>
                      <p className="text-2xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                        {notif.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
