import React from 'react';
import { Property } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { Home, ShieldCheck, Lock, Heart, MessageSquare } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ThemeToggle } from '../ui/ThemeToggle';

interface FooterProps {
  property: Property;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ property, onOpenAdmin }) => {
  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-300 border-t border-neutral-800 pt-12 pb-24 sm:pb-14 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-neutral-800">
          {/* Brand & summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">{property.title}</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Annonce officielle pour la vente de la maison de {property.surface} {property.unit} au prix de{' '}
              {PropertyService.formatPrice(property.price, property.currency)}.
            </p>
            <div className="text-2xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Dossier successoral vérifié & mandataire officiel</span>
            </div>
          </div>

          {/* Lineage and actors */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white font-bold text-sm">Parties prenantes</h4>
            <div className="bg-neutral-800/60 dark:bg-neutral-900/60 p-3 rounded-xl space-y-2 border border-neutral-700/60 dark:border-neutral-800/60">
              <div>
                <span className="text-neutral-400 block text-2xs uppercase">Propriétaires légitimes :</span>
                <strong className="text-white font-semibold">
                  {property.owners[0]?.name || 'Descendants de Fatou Ba'}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400 block text-2xs uppercase">Mandataire :</span>
                <strong className="text-emerald-400 font-semibold">
                  {property.seller?.name || 'Mr KAMARA'}
                </strong>
              </div>
            </div>
          </div>

          {/* Administration link and reassurance */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold text-sm">Espace Vendeur</h4>
            <p className="text-neutral-400">
              Accès réservé pour la mise à jour des prix, photos réelles, vidéos TikTok et coordonnées GPS.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Accéder à l'Administration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright & developer notice & PWA */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-neutral-500">
          <p>© {new Date().getFullYear()} — {property.title}. Tous droits réservés.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <ThemeToggle variant="compact" />
            <PWAInstallButton variant="footer" />
            <span className="text-emerald-400 font-medium">Développé par Chackor Organisation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
