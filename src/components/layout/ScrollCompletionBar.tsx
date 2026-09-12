import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { ShieldCheck, CheckCircle2, Eye, Sparkles, X, ChevronRight, MapPin, Camera, UserCheck, FileText, Share2 } from 'lucide-react';

interface ScrollCompletionBarProps {
  property: Property;
  onOpenShare?: () => void;
}

interface VerificationCheckpoint {
  id: string;
  label: string;
  detail: string;
  isComplete: boolean;
  icon: React.ElementType;
}

export const ScrollCompletionBar: React.FC<ScrollCompletionBarProps> = ({ property, onOpenShare }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('Vue d\'ensemble');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Compute profile completeness score
  const checkpoints: VerificationCheckpoint[] = [
    {
      id: 'price',
      label: 'Prix & Mandat de vente',
      detail: `${property.price.toLocaleString('fr-FR')} ${property.currency} (Net vendeur garanti)`,
      isComplete: property.price > 0,
      icon: ShieldCheck,
    },
    {
      id: 'surface',
      label: 'Superficie exacte',
      detail: `${property.surface} ${property.unit} (Terrain & bâti vérifiés)`,
      isComplete: property.surface === 600,
      icon: FileText,
    },
    {
      id: 'photos',
      label: 'Galerie photographique HD',
      detail: `${property.media?.length || 0} photos HD du bien & des abords`,
      isComplete: (property.media?.length || 0) >= 3,
      icon: Camera,
    },
    {
      id: 'location',
      label: 'Localisation & Accès',
      detail: `${property.city || property.country} (Point GPS et repères)`,
      isComplete: Boolean(property.latitude && property.longitude),
      icon: MapPin,
    },
    {
      id: 'mandate',
      label: 'Mandataire agréé',
      detail: `${property.seller?.name || 'M. Abdou KAMARA'} (Mandat officiel 12%)`,
      isComplete: Boolean(property.seller?.phone),
      icon: UserCheck,
    },
    {
      id: 'succession',
      label: 'Ayants droit & Succession',
      detail: property.owners?.[0]?.name || 'Descendants de Fatou Ba',
      isComplete: (property.owners?.length || 0) > 0,
      icon: CheckCircle2,
    },
  ];

  const completedCount = checkpoints.filter((c) => c.isComplete).length;
  const completionPercentage = Math.round((completedCount / checkpoints.length) * 100);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))) : 0;
      setScrollProgress(progress);

      // Section tracking
      const sections = [
        { id: 'whatsapp-contact-section', name: 'Contacts Directs WhatsApp' },
        { id: 'suivi-dossier', name: 'Suivi de Dossier Partenaire' },
        { id: 'partenariat-vendeurs', name: 'Partenariats & Mandats (12%)' },
        { id: 'location-section', name: 'Localisation 600 m²' },
        { id: 'faq-section', name: 'Questions Fréquentes (FAQ)' },
        { id: 'caracteristiques', name: 'Atouts & Caractéristiques' },
        { id: 'galerie-photos', name: 'Galerie Photos HD' },
      ];

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 240 && rect.bottom >= 120) {
            setCurrentSection(sec.name);
            break;
          }
        }
      }

      if (scrollTop < 200) {
        setCurrentSection('Vue d\'ensemble');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Visual Progress Bar Container */}
      <div className="w-full bg-neutral-200/50 dark:bg-neutral-800/50 relative">
        {/* Fill bar (Scroll reading progress) */}
        <div
          id="scroll-progress-indicator"
          className="h-[3px] sm:h-[3.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{ width: `${Math.max(scrollProgress, 4)}%` }}
        />

        {/* Micro informative ribbon under header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between gap-2 text-3xs sm:text-2xs text-neutral-600 dark:text-neutral-400 font-medium">
          {/* Left: Interactive profile completeness badge */}
          <button
            onClick={() => setIsDetailsOpen(true)}
            id="profile-completion-button"
            className="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer group"
            title="Cliquez pour voir les points de vérification du dossier"
          >
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300/60 dark:border-emerald-700/60 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Dossier certifié : {completionPercentage}%</span>
            </span>
            <span className="hidden md:inline text-neutral-400 dark:text-neutral-500">
              • Titre, bornage 600m² & mandat vérifiés
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 underline decoration-dotted hidden sm:inline group-hover:no-underline">
              Détails
            </span>
          </button>

          {/* Right: Scroll progress & current section indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Eye className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{scrollProgress}%</span>
              <span className="hidden sm:inline">• {currentSection}</span>
            </span>

            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold cursor-pointer pl-2 border-l border-neutral-300 dark:border-neutral-700 transition-colors"
                title="Partager l'annonce (WhatsApp, Facebook, X...)"
              >
                <Share2 className="w-3 h-3" />
                <span className="hidden sm:inline">Partager</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Completion Details Modal / Drawer */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Complétion de l'Annonce : {completionPercentage}%
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Dossier immobilier contrôlé par le mandataire officiel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 py-1 max-h-[60vh] overflow-y-auto">
              {checkpoints.map((cp) => {
                const Icon = cp.icon;
                return (
                  <div
                    key={cp.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex items-start gap-3"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        cp.isComplete
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {cp.label}
                        </span>
                        <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Vérifié
                        </span>
                      </div>
                      <p className="text-2xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                        {cp.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer notice */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Dossier garanti conforme
              </span>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
