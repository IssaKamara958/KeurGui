import React, { useState } from 'react';
import { Property } from '../../types';
import {
  CheckCircle2,
  Clock,
  Circle,
  BellRing,
  ShieldCheck,
  FileText,
  Key,
  Users,
  Building,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { PushNotificationModal } from '../pwa/PushNotificationModal';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface PurchaseMilestonesTrackerProps {
  property: Property;
}

export const PurchaseMilestonesTracker: React.FC<PurchaseMilestonesTrackerProps> = ({ property }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings, sendTestStepAlert } = usePushNotifications();

  const steps = [
    {
      id: 1,
      title: 'Audit Foncier & Bornage 600 m²',
      description: 'Délibération cadastrale, vérification de mitoyenneté et mandat légal 12% certifiés.',
      status: 'completed',
      date: 'Validé & Certifié',
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      id: 2,
      title: 'Visites sur site & Dépôt d\'Intention',
      description: 'Accès sur place en 10 min avec le mandataire officiel M. Abdou KAMARA (+221 77 412 57 97).',
      status: 'current',
      date: 'Étape en cours',
      icon: Users,
      color: 'blue',
    },
    {
      id: 3,
      title: 'Offre d\'Achat & Compromis Sécurisé',
      description: 'Protocole d\'accord sous seing privé et séquestre d\'acompte sur compte notarié agréé.',
      status: 'upcoming',
      date: 'Prochaine étape',
      icon: FileText,
      color: 'amber',
    },
    {
      id: 4,
      title: 'Acte Authentique & Quitus Notarial',
      description: 'Signature de l\'acte authentique de vente et enregistrement auprès des services fiscaux.',
      status: 'upcoming',
      date: 'À venir',
      icon: Building,
      color: 'purple',
    },
    {
      id: 5,
      title: 'Paiement Final & Remise Immédiate des Clés',
      description: 'Transfert effectif de jouissance sur la maison et la parcelle de 600 m² à Thiès.',
      status: 'upcoming',
      date: 'Clôture de la vente',
      icon: Key,
      color: 'emerald',
    },
  ];

  return (
    <section id="processus-achat-section" className="py-10 sm:py-14 bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header with Title & Push Alert Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparence & Sécurité Juridique</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Étapes du Processus d'Acquisition
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
              Suivez l'avancement de la transaction de <strong className="font-semibold text-neutral-900 dark:text-neutral-200">Keur Mame Fatou</strong>. Les abonnés PWA reçoivent une notification instantanée à chaque changement d'état ou modification du prix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
              title="Configurer les notifications PWA"
            >
              <BellRing className="w-4 h-4 fill-current" />
              <span>{settings.isSubscribed ? 'Alertes PWA Activées' : 'M\'alerter par Notification PWA'}</span>
            </button>
          </div>
        </div>

        {/* Milestones Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div
                key={step.id}
                className={`relative p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-white dark:bg-neutral-800/90 border-emerald-300 dark:border-emerald-700/60 shadow-xs'
                    : isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/60 dark:bg-neutral-850/40 border-neutral-200 dark:border-neutral-800 opacity-80'
                }`}
              >
                {/* Step badge number */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    0{step.id}
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-3xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Validé
                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-3xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                      <Clock className="w-2.5 h-2.5" />
                      En cours
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      <Circle className="w-2 h-2" />
                      À venir
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-3xs sm:text-2xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PWA Alert Banner Callout */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 dark:border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                Notification push PWA pour les acheteurs enregistrés
              </span>
              <p className="text-2xs text-neutral-600 dark:text-neutral-400">
                Recevez directement une alerte sur votre écran en cas de signature d'un compromis, d'une offre validée ou d'une modification du prix officiel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              {settings.isSubscribed ? 'Gérer mes alertes' : 'Activer en 1 clic'}
            </button>
          </div>
        </div>
      </div>

      <PushNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};
