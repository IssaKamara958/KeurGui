import React from 'react';
import { Property } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { useToast } from '../ui/Toast';
import { Share2, Lock, Home, Sparkles } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  property: Property;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ property, onOpenAdmin }) => {
  const { showToast } = useToast();

  const handleShare = async () => {
    await AnalyticsService.trackEvent('share_click', { url: window.location.href });
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Maison à vendre à ${property.city} au prix de ${PropertyService.formatPrice(
            property.price,
            property.currency
          )}. Contact vendeur : ${property.seller.name}`,
          url: window.location.href,
        });
        showToast('Lien partagé avec succès !', 'success');
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Lien de la maison copié dans le presse-papiers !', 'success');
      } catch (err) {
        showToast('Impossible de copier le lien', 'error');
      }
    }
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            À vendre
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Réservée
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Vendue
          </span>
        );
      case 'unpublished':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
            Brouillon
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center shadow-xs shrink-0 border border-neutral-800 dark:border-neutral-700">
            <Home className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none truncate">
                {property.title}
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 hidden sm:block truncate">
              {property.city || property.country} • Dossier : {property.owners[0]?.name || 'Succession'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Global Dark Mode Switch */}
          <ThemeToggle variant="compact" />

          {/* PWA In-App Install Button */}
          <PWAInstallButton variant="compact" />

          <button
            id="share-button"
            onClick={handleShare}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-transparent dark:border-neutral-700 rounded-xl transition-colors active:scale-95 cursor-pointer shadow-xs"
            title="Partager cette annonce"
          >
            <Share2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="hidden sm:inline">Partager</span>
          </button>

          <button
            id="admin-login-button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-800/80 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Accès Administrateur / Vendeur"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800 dark:text-amber-400" />
            <span className="hidden sm:inline">Administration</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
