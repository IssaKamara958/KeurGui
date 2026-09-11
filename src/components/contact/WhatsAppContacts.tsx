import React from 'react';
import { Property, Contact } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { MessageSquare, Phone, UserCheck, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface WhatsAppContactsProps {
  property: Property;
  onOpenContactAdmin?: () => void;
}

export const WhatsAppContacts: React.FC<WhatsAppContactsProps> = ({
  property,
  onOpenContactAdmin,
}) => {
  const activeContacts = property.contacts.filter((c) => c.active);
  const whatsappContacts = activeContacts.filter((c) => c.type === 'whatsapp');
  const phoneContacts = activeContacts.filter((c) => c.type === 'phone');

  const handleWhatsAppClick = async (contact: Contact, index: number) => {
    await AnalyticsService.trackEvent('whatsapp_click', {
      contact: contact.value,
      label: contact.label,
      index,
    });
    const url = PropertyService.getWhatsAppUrl(contact.value, property);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = async (contact: Contact) => {
    await AnalyticsService.trackEvent('phone_click', {
      contact: contact.value,
      label: contact.label,
    });
    window.location.href = `tel:${contact.value}`;
  };

  const autoMessagePreview = PropertyService.buildWhatsAppMessage(property);

  return (
    <section id="whatsapp-contact-section" className="space-y-6">
      {/* Contact Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Contact Vendeur & Prise de Rendez-vous</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Échange direct avec le mandataire officiel sans intermédiaire
            </p>
          </div>
        </div>

        {onOpenContactAdmin && (
          <button
            onClick={onOpenContactAdmin}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 transition-colors cursor-pointer"
          >
            Gérer les numéros
          </button>
        )}
      </div>

      {/* Main Seller Card & Contacts */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
        {/* Profile identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              MK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{property.seller?.name || 'Mr KAMARA'}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-bold uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Mandataire vérifié
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Mandataire agréé pour la succession :{' '}
                <strong className="text-neutral-700 dark:text-neutral-300">{property.owners[0]?.name || 'Descendants de Fatou Ba'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Réponse rapide en quelques minutes</span>
          </div>
        </div>

        {/* Dynamic WhatsApp Buttons (As required: WhatsApp 1, WhatsApp 2, etc.) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Choisissez votre ligne WhatsApp préférée :
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {whatsappContacts.map((contact, idx) => (
              <button
                key={contact.id || idx}
                onClick={() => handleWhatsAppClick(contact, idx + 1)}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm ${
                  contact.is_primary
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/70'
                }`}
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      contact.is_primary ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">
                      💬 Contacter Mr KAMARA — WhatsApp {idx + 1}
                    </span>
                    <span className={`text-xs block font-mono ${contact.is_primary ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-300'}`}>
                      {contact.value} {contact.is_primary ? '• Ligne prioritaire' : ''}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    contact.is_primary ? 'bg-white text-emerald-800' : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  Ouvrir →
                </span>
              </button>
            ))}
          </div>

          {/* Optional Direct Phone Calls */}
          {phoneContacts.length > 0 && (
            <div className="pt-2">
              {phoneContacts.map((phone, idx) => (
                <button
                  key={phone.id || idx}
                  onClick={() => handlePhoneClick(phone)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  <span>Appel téléphonique standard : {phone.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Automatique Preview (Cahier des charges section 11) */}
        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-800 dark:text-neutral-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Message WhatsApp pré-rempli automatiquement :</span>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 font-mono text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line text-2xs sm:text-xs">
            {autoMessagePreview}
          </div>
          <p className="text-2xs text-neutral-500 dark:text-neutral-400 italic">
            Ce texte sera déjà écrit dans votre discussion WhatsApp dès l'ouverture du lien.
          </p>
        </div>
      </div>
    </section>
  );
};
