import React, { useState } from 'react';
import { Property } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { useToast } from '../ui/Toast';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Mail,
  Smartphone,
  X,
  ExternalLink,
} from 'lucide-react';

interface QuickShareModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickShareModal: React.FC<QuickShareModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const priceFormatted = PropertyService.formatPrice(property.price, property.currency);
  const shareTitle = `Keur Mame Fatou — Maison de ${property.surface} ${property.unit}`;
  const shareText = `🏡 *Keur Mame Fatou* (Votre confort, notre priorité)\n` +
    `Maison de ${property.surface} ${property.unit} à ${property.city || property.country} au prix de ${priceFormatted}.\n` +
    `Dossier vérifié à 100% (Titre & Délibération, Bornage 600m²).\n` +
    `Mandataire officiel : ${property.seller.name} (${property.seller.phone}).\n\n` +
    `👉 Voir l'annonce complète avec photos HD & localisation :`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setHasCopied(true);
      showToast('Lien de l\'annonce copié dans le presse-papiers !', 'success');
      await AnalyticsService.trackEvent('share_click', { action: 'copy_link', url: currentUrl });
      setTimeout(() => setHasCopied(false), 2500);
    } catch (err) {
      showToast('Erreur lors de la copie du lien', 'error');
    }
  };

  const handlePlatformShare = async (platform: string, shareUrl: string) => {
    await AnalyticsService.trackEvent('share_click', { platform, url: currentUrl });
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await AnalyticsService.trackEvent('share_click', { action: 'native_trigger', url: currentUrl });
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
        showToast('Annonce partagée avec succès !', 'success');
        onClose();
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Partager avec vos contacts ou groupes WhatsApp',
      icon: MessageCircle,
      bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accent: 'border-emerald-500/30',
      action: () =>
        handlePlatformShare(
          'whatsapp',
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`
        ),
      featured: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Publier sur votre journal ou dans un groupe',
      icon: Share2,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      accent: 'border-blue-500/30',
      action: () =>
        handlePlatformShare(
          'facebook',
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        ),
      featured: false,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      description: 'Partager en tweet avec le hashtag #ImmobilierSenegal',
      icon: ExternalLink,
      bg: 'bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white',
      accent: 'border-neutral-500/30',
      action: () =>
        handlePlatformShare(
          'twitter',
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Keur Mame Fatou — Maison de ${property.surface} ${property.unit} à ${property.city} (${priceFormatted}). Mandataire : ${property.seller.name}`
          )}&url=${encodeURIComponent(currentUrl)}`
        ),
      featured: false,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Envoyer sur un canal ou une discussion Telegram',
      icon: Send,
      bg: 'bg-[#229ED9] hover:bg-[#1e8ec3] text-white',
      accent: 'border-sky-500/30',
      action: () =>
        handlePlatformShare(
          'telegram',
          `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
        ),
      featured: false,
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Envoyer la fiche complète par courriel',
      icon: Mail,
      bg: 'bg-neutral-700 hover:bg-neutral-800 text-white',
      accent: 'border-neutral-500/30',
      action: () =>
        handlePlatformShare(
          'email',
          `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(
            `${shareText}\n\nLien de l'annonce : ${currentUrl}`
          )}`
        ),
      featured: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Partager l'Annonce
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Keur Mame Fatou • {property.surface} {property.unit} • {priceFormatted}
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

        {/* Featured WhatsApp Quick Button */}
        <button
          onClick={shareOptions[0].action}
          className="w-full p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-between gap-3 shadow-md shadow-emerald-600/20 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <span className="font-bold text-sm block">
                Partager directement sur WhatsApp
              </span>
              <span className="text-2xs text-emerald-100 block">
                Recommandé pour contacts & groupes au Sénégal
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/20 text-3xs uppercase font-bold tracking-wider">
            1 clic
          </span>
        </button>

        {/* Other Social Networks Grid */}
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2.5">
            Autres réseaux sociaux
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shareOptions.slice(1).map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={opt.action}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${opt.bg} active:scale-95 shadow-xs`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Native Mobile Share (if available) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ouvrir les options de partage de mon appareil</span>
          </button>
        )}

        {/* Direct Link Copy Bar */}
        <div className="space-y-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
            Ou copiez le lien direct
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
                hasCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
              }`}
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
