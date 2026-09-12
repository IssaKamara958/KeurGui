import React, { useState, useEffect } from 'react';
import { PartnershipApplication } from '../../types';
import { PartnershipService } from '../../services/partnershipService';
import { PartnershipFormModal } from './PartnershipFormModal';
import { PartnershipContractView } from './PartnershipContractView';
import {
  Handshake,
  ShieldCheck,
  Clock,
  Percent,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  Upload,
  ArrowRight,
  Building,
  MapPin,
  ExternalLink,
  Info,
} from 'lucide-react';

interface PartnershipSectionProps {
  onOpenFormDirectly?: () => void;
}

export const PartnershipSection: React.FC<PartnershipSectionProps> = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedApplication, setTrackedApplication] = useState<PartnershipApplication | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedContractApp, setSelectedContractApp] = useState<PartnershipApplication | null>(null);
  const [recentApplications, setRecentApplications] = useState<PartnershipApplication[]>([]);

  // Load recent applications
  const loadRecent = async () => {
    try {
      const apps = await PartnershipService.getApplications();
      setRecentApplications(apps.slice(0, 3));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadRecent();
    const handleUpdate = () => loadRecent();
    window.addEventListener('partnerships_updated', handleUpdate);
    return () => window.removeEventListener('partnerships_updated', handleUpdate);
  }, []);

  const handleSearchDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setTrackedApplication(null);

    try {
      const app = await PartnershipService.getApplicationById(searchTrackingId.trim());
      if (app) {
        setTrackedApplication(app);
      } else {
        setSearchError('Aucun dossier trouvé pour cette référence. Vérifiez votre code (ex: PART-2026-1042).');
      }
    } catch (err) {
      setSearchError('Erreur lors de la recherche du dossier.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section
      id="partenariat-vendeurs"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors"
    >
      {/* Banner / Section Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950 text-white p-6 sm:p-12 shadow-2xl border border-emerald-900/30">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Handshake className="w-3.5 h-3.5" />
              <span>KEUR MAME FATOU • PARTENARIAT & MANDAT (12%)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Vendez votre maison ou terrain avec Keur Mame Fatou
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Vous êtes propriétaire, héritier ou mandataire d'un bien immobilier au Sénégal ? Confiez votre bien à
              l'administration officielle de Keur Mame Fatou (Abdou KAMARA). Bénéficiez d'une étude rigoureuse de votre dossier sous 48
              heures, d'une diffusion de premier ordre et d'un contrat de mandat standardisé (commission de 12%) garantissant votre prix net vendeur.
            </p>

            {/* Quick CTA and Key Value Proposition */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-sm flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Déposer un dossier de partenariat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#suivi-dossier"
                className="px-5 py-3.5 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-white font-semibold text-sm border border-neutral-700/80 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Suivre un dossier existant</span>
              </a>
            </div>
          </div>

          {/* Official Brand Badge */}
          <div className="shrink-0 flex items-center justify-center lg:justify-end">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/10 p-2.5 backdrop-blur-md border border-emerald-400/30 shadow-2xl flex items-center justify-center">
              <img
                src="/keur-mame-fatou.png"
                alt="Logo officiel Keur Mame Fatou"
                className="w-full h-full object-contain rounded-2xl drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-neutral-800/80">
          <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/40 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Étude sous 48 Heures</h3>
            <p className="text-xs text-neutral-400">
              Vérification approfondie de votre dossier par l'administrateur avec confirmation sous 48h.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/40 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Commission Fixe de 12%</h3>
            <p className="text-xs text-neutral-400">
              Aucun frais d'avance. 12% exigible uniquement si la vente est conclue via cette application.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/40 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Contrat Standard Émis</h3>
            <p className="text-xs text-neutral-400">
              Dès validation du dossier, un contrat officiel conforme au droit sénégalais/OHADA vous est remis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/40 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Rigueur & Transparence</h3>
            <p className="text-xs text-neutral-400">
              Copie CNI recto/verso et actes requis. Tout dossier incomplet est rejeté pour la sécurité de tous.
            </p>
          </div>
        </div>
      </div>

      {/* Tracking & Contract Lookup Section */}
      <div id="suivi-dossier" className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Search & Demo Quick Links */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Search className="w-4 h-4" />
              <span>Suivi & Validation en ligne</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-1">
              Consulter l'état de votre souscription
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Saisissez votre référence de dossier (ex: <span className="font-mono font-semibold">PART-2026-1042</span>)
              pour vérifier la validation sous 48h ou télécharger votre contrat.
            </p>
          </div>

          <form onSubmit={handleSearchDossier} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                placeholder="Ex: PART-2026-1042"
                className="w-full pl-4 pr-11 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-mono text-neutral-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {searchError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{searchError}</span>
              </p>
            )}
          </form>

          {/* Quick Examples */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block">
              Exemples de dossiers actifs pour test :
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  setSearchTrackingId('PART-2026-1042');
                  const app = await PartnershipService.getApplicationById('PART-2026-1042');
                  if (app) setTrackedApplication(app);
                }}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">PART-2026-1042</span>
                  <span className="text-3xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    Étude 48h en cours
                  </span>
                </div>
                <p className="text-3xs text-neutral-500 mt-0.5">Terrain 500 m² Saly (Mandataire Moussa Ndiaye)</p>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setSearchTrackingId('PART-2026-0815');
                  const app = await PartnershipService.getApplicationById('PART-2026-0815');
                  if (app) setTrackedApplication(app);
                }}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">PART-2026-0815</span>
                  <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    Contrat Validé
                  </span>
                </div>
                <p className="text-3xs text-neutral-500 mt-0.5">Villa 350 m² Thiès (Propriétaire Ousmane Diop)</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Dossier Viewer / Tracked Details */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm min-h-[360px] flex flex-col justify-center">
          {trackedApplication ? (
            <div className="space-y-6">
              {/* Header with status badge */}
              <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                      {trackedApplication.id}
                    </span>
                    <span
                      className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                        trackedApplication.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : trackedApplication.status === 'rejected'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {trackedApplication.status === 'approved'
                        ? 'PARTENARIAT VALIDÉ'
                        : trackedApplication.status === 'rejected'
                        ? 'SOUSCRIPTION REJETÉE'
                        : "ÉTUDE EN COURS (DÉLAI 48H)"}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-1">
                    {trackedApplication.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Déposé le{' '}
                    {new Date(trackedApplication.created_at).toLocaleDateString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* If approved, show button to see contract */}
                {trackedApplication.contract && (
                  <button
                    onClick={() => setSelectedContractApp(trackedApplication)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Consulter le contrat officiel (12%)</span>
                  </button>
                )}
              </div>

              {/* Status Alert Banner */}
              {trackedApplication.status === 'approved' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Félicitations, votre dossier a été validé avec succès par l'administrateur !</strong>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
                      {trackedApplication.review_notes ||
                        'Toutes les pièces (CNI recto/verso, acte et plan) ont été déclarées conformes. Votre contrat officiel est téléchargeable ci-dessus.'}
                    </p>
                  </div>
                </div>
              ) : trackedApplication.status === 'rejected' ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Dossier non retenu par l'administration :</strong>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
                      {trackedApplication.rejection_reason ||
                        "L'administration n'a pas reçu l'intégralité des renseignements et pièces obligatoires (notamment CNI recto/verso ou acte probant). Vous pouvez déposer un nouveau dossier complet."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Dossier actuellement sous instruction (Délai légal de 48 heures) :</strong>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
                      L'administrateur Abdou KAMARA procède aux vérifications de conformité cadastrale et d'identité. Si
                      votre dossier est complet, vous recevrez la notification de validation et le contrat généré ici même.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60">
                <div>
                  <span className="text-2xs text-neutral-500 block">Titulaire / Mandataire</span>
                  <strong className="text-neutral-900 dark:text-neutral-100">
                    {trackedApplication.is_mandated
                      ? `${trackedApplication.mandatary_name} (Mandataire)`
                      : trackedApplication.owner_full_name}
                  </strong>
                </div>
                <div>
                  <span className="text-2xs text-neutral-500 block">Localisation</span>
                  <strong className="text-neutral-900 dark:text-neutral-100">
                    {trackedApplication.city} ({trackedApplication.neighborhood})
                  </strong>
                </div>
                <div>
                  <span className="text-2xs text-neutral-500 block">Prix Net Vendeur</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {PartnershipService.formatPrice(trackedApplication.minimum_price, trackedApplication.currency)}
                  </strong>
                </div>
                <div>
                  <span className="text-2xs text-neutral-500 block">Commission Prévue (12%)</span>
                  <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                    {PartnershipService.formatPrice(trackedApplication.estimated_commission, trackedApplication.currency)}
                  </strong>
                </div>
              </div>

              {/* Documents attached */}
              <div>
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                  Pièces justificatives fournies ({trackedApplication.documents.length}) :
                </span>
                <div className="flex flex-wrap gap-2">
                  {trackedApplication.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-2xs flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="font-mono">{doc.name}</span>
                      <span className="text-3xs text-neutral-400">({doc.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <Handshake className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                Entrez une référence ou soumettez votre dossier
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Recherchez votre dossier ci-contre avec votre numéro d'enregistrement ou créez votre première demande de
                partenariat pour mettre votre maison ou terrain en vente.
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 mt-2"
              >
                <span>Remplir le formulaire de souscription</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isFormOpen && (
        <PartnershipFormModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={(newApp) => {
            setIsFormOpen(false);
            setTrackedApplication(newApp);
            setSearchTrackingId(newApp.id);
          }}
        />
      )}

      {selectedContractApp && selectedContractApp.contract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl my-auto">
            <PartnershipContractView
              contract={selectedContractApp.contract}
              application={selectedContractApp}
              onClose={() => setSelectedContractApp(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
};
