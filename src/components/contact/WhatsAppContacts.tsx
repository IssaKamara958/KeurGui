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
            <h2 className="text-xl font-bold text-neutral-900">Contact Vendeur & Prise de Rendez-vous</h2>
            <p className="text-xs text-neutral-500">
              Échange direct avec le mandataire officiel sans intermédiaire
            </p>
          </div>
        </div>

        {onOpenContactAdmin && (
          <button
            onClick={onOpenContactAdmin}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            Gérer les numéros
          </button>
        )}
      </div>

      {/* Main Seller Card & Contacts */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Profile identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900">{property.seller?.name || 'Abdou KAMARA'}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-bold uppercase bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Mandataire vérifié
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Vendeur agréé pour la succession :{' '}
                <strong className="text-neutral-700">{property.owners[0]?.name || 'Descendants de Fatou Ba'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200/60">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Réponse rapide en quelques minutes</span>
          </div>
        </div>

        {/* Dynamic WhatsApp Buttons (As required: WhatsApp 1, WhatsApp 2, etc.) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
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
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200'
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
                      💬 Contacter Abdou — WhatsApp {idx + 1}
                    </span>
                    <span className={`text-xs block font-mono ${contact.is_primary ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      {contact.value} {contact.is_primary ? '• Ligne prioritaire' : ''}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    contact.is_primary ? 'bg-white text-emerald-800' : 'bg-emerald-200 text-emerald-900'
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
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-neutral-600" />
                  <span>Appel téléphonique standard : {phone.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Automatique Preview (Cahier des charges section 11) */}
        <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200 text-xs text-neutral-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Message WhatsApp pré-rempli automatiquement :</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-neutral-200/80 font-mono text-neutral-700 leading-relaxed whitespace-pre-line text-2xs sm:text-xs">
            {autoMessagePreview}
          </div>
          <p className="text-2xs text-neutral-500 italic">
            Ce texte sera déjà écrit dans votre discussion WhatsApp dès l'ouverture du lien.
          </p>
        </div>
      </div>
    </section>
  );
};
