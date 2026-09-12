import React from 'react';
import { PartnershipContract, PartnershipApplication } from '../../types';
import { PartnershipService } from '../../services/partnershipService';
import { ContractPdfGenerator } from '../../services/contractPdfGenerator';
import { Printer, Download, CheckCircle2, Shield, FileText, X } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface PartnershipContractViewProps {
  contract: PartnershipContract;
  application?: PartnershipApplication;
  onClose?: () => void;
}

export const PartnershipContractView: React.FC<PartnershipContractViewProps> = ({
  contract,
  application,
  onClose,
}) => {
  const { showToast } = useToast();

  const handleDownloadPdf = () => {
    if (application) {
      try {
        ContractPdfGenerator.generatePdf(application, contract);
        showToast(`Contrat PDF officiel (12%) téléchargé !`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Erreur génération PDF, impression du document...', 'info');
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const text = `CONTRAT DE PARTENARIAT & MANDAT IMMOBILIER\nN°: ${contract.contract_number}\nPartenaire: ${contract.partner_name}\nBien: ${contract.property_title}\nPrix Net Vendeur: ${PartnershipService.formatPrice(contract.minimum_price, contract.currency)}\nCommission d'apport (vente via app): 12%\nMandataire App: Abdou KAMARA`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Résumé du contrat copié !', 'success');
    } catch {
      showToast('Impossible de copier', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden max-w-4xl mx-auto my-4 transition-colors">
      {/* Action Bar (hidden on print) */}
      <div className="print:hidden bg-neutral-900 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none">Contrat Officiel de Partenariat & Mandat</h3>
            <p className="text-2xs text-neutral-400 mt-1">Réf : {contract.contract_number} • Clause 12% conforme</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copier réf</span>
          </button>
          <button
            id="btn-contract-view-download-pdf"
            onClick={handleDownloadPdf}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95"
            title="Télécharger le modèle de contrat PDF avec clauses standard de 12%"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger PDF (12%)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Imprimer ou enregistrer en PDF via le navigateur"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Formal Legal Document Body */}
      <div className="p-6 sm:p-10 font-serif text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm leading-relaxed space-y-6 bg-white dark:bg-neutral-900 print:p-8 print:text-black">
        {/* Document Header */}
        <div className="border-b-2 border-neutral-800 dark:border-neutral-700 pb-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3.5">
            <img
              src="/keur-mame-fatou.png"
              alt="Keur Mame Fatou"
              className="w-14 h-14 rounded-2xl object-contain border border-emerald-500/30 p-1 bg-white shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-sans">
                  KEUR MAME FATOU
                </span>
                <span className="text-2xs font-sans text-neutral-500">RÉPUBLIQUE DU SÉNÉGAL / OHADA</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                CONTRAT DE PARTENARIAT & MANDAT D'INTERMÉDIATION (12%)
              </h1>
              <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400 mt-1">
                Réf Contractuelle : <strong className="font-mono">{contract.contract_number}</strong> • Émis le{' '}
                {new Date(contract.issued_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-2xs font-bold font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              DOSSIER VÉRIFIÉ & VALIDÉ 48H
            </div>
          </div>
        </div>

        {/* Parties Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 font-sans text-xs">
          <div className="space-y-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              D'UNE PART : LA PLATEFORME & MANDATAIRE
            </span>
            <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              M. Abdou KAMARA & Ayants droit
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Administrateur et Mandataire officiel de la plateforme Keur Mame Fatou
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 font-mono">
              Thiès, République du Sénégal • Contact vérifié
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-700 pt-3 md:pt-0 md:pl-4">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              D'AUTRE PART : LE CONTRACTANT / PARTENAIRE
            </span>
            <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{contract.partner_name}</div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Qualité : <strong>{contract.partner_role}</strong> • CNI/Passeport :{' '}
              <strong className="font-mono">{contract.partner_cni || 'Vérifiée'}</strong>
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              Téléphone : <strong className="font-mono">{contract.partner_phone}</strong>
              {contract.partner_email ? ` • ${contract.partner_email}` : ''}
            </p>
          </div>
        </div>

        {/* Property Designation */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 font-sans text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>DESIGNATION DU BIEN IMMOBILIER CONCERNÉ</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">Type de bien</span>
              <strong className="text-neutral-900 dark:text-neutral-100">{contract.property_type}</strong>
            </div>
            <div>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">Superficie</span>
              <strong className="text-neutral-900 dark:text-neutral-100">{contract.property_surface}</strong>
            </div>
            <div>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">Localisation</span>
              <strong className="text-neutral-900 dark:text-neutral-100">{contract.property_location}</strong>
            </div>
            <div>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 block">Prix Net Vendeur Minimum</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                {PartnershipService.formatPrice(contract.minimum_price, contract.currency)}
              </strong>
            </div>
          </div>
          {application?.title_deed_type && (
            <p className="text-2xs text-neutral-600 dark:text-neutral-400 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
              Titre justificatif : <strong>{application.title_deed_type.toUpperCase()}</strong>{' '}
              {application.title_deed_number ? `(N° ${application.title_deed_number})` : ''} • Pièces et plan géomètre
              annexés au dossier d'origine.
            </p>
          )}
        </div>

        {/* Standard Clauses Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider font-sans text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2">
            CLAUSES ET CONDITIONS PARTICULIÈRES DU MANDAT
          </h2>

          {/* Explicit 12% Commission Clause */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500/80 dark:border-emerald-500/50 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Clause Fondamentale de Rémunération : 12% de Commission
            </div>
            <p className="text-emerald-950 dark:text-emerald-100 font-medium text-xs sm:text-sm leading-relaxed">
              {contract.terms.commission_clause}
            </p>
            <div className="pt-2 flex items-center justify-between text-2xs text-emerald-800 dark:text-emerald-300 font-sans">
              <span>Commission calculée sur le prix minimum :</span>
              <strong className="font-mono text-sm text-emerald-900 dark:text-emerald-200">
                {PartnershipService.formatPrice(
                  PartnershipService.calculateCommission(contract.minimum_price),
                  contract.currency
                )}
              </strong>
            </div>
          </div>

          <div className="space-y-3 font-sans text-xs text-neutral-700 dark:text-neutral-300">
            <div>
              <strong className="text-neutral-900 dark:text-white block mb-0.5">
                Article 2 — Objet du mandat & Promotion numérique
              </strong>
              <p>{contract.terms.exclusivity_and_mandate}</p>
            </div>

            <div>
              <strong className="text-neutral-900 dark:text-white block mb-0.5">
                Article 3 — Garantie d'authenticité et intégrité des pièces
              </strong>
              <p>{contract.terms.authenticity_warranty}</p>
            </div>

            <div>
              <strong className="text-neutral-900 dark:text-white block mb-0.5">
                Article 4 — Seuil de prix net vendeur
              </strong>
              <p>{contract.terms.minimum_price_guarantee}</p>
            </div>

            <div>
              <strong className="text-neutral-900 dark:text-white block mb-0.5">
                Article 5 — Durée de validité
              </strong>
              <p>{contract.terms.duration_and_termination}</p>
            </div>

            <div>
              <strong className="text-neutral-900 dark:text-white block mb-0.5">
                Article 6 — Droit applicable et attribution de juridiction
              </strong>
              <p>{contract.terms.jurisdiction}</p>
            </div>
          </div>
        </div>

        {/* Signatures and Stamps Block */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
          {/* Admin Signature */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 space-y-3 text-center">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              POUR L'ADMINISTRATION DE L'APPLICATION
            </span>
            <div className="font-bold text-sm text-neutral-900 dark:text-white">
              {contract.admin_signature?.signed_by || 'Abdou KAMARA'}
            </div>
            <p className="text-2xs text-neutral-500">Mandataire Officiel & Direction des Partenariats</p>

            {/* Simulated Stamp / Visa */}
            <div className="inline-block border-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-mono text-2xs uppercase tracking-widest font-black rotate-[-2deg] my-2 bg-emerald-50/50 dark:bg-transparent">
              ✓ VISA & SCEAU OFFICIEL VALITÉ
            </div>
            <p className="text-3xs text-neutral-400">
              Certifié conforme • {new Date(contract.issued_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Partner Signature */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 space-y-3 text-center">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              POUR LE PARTENAIRE SOUSCRIPTEUR
            </span>
            <div className="font-bold text-sm text-neutral-900 dark:text-white">{contract.partner_name}</div>
            <p className="text-2xs text-neutral-500">Lu et approuvé • Bon pour mandat avec commission 12%</p>

            <div className="inline-block border border-neutral-400 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 px-3 py-2 rounded-xl font-mono text-2xs my-2">
              Signé électroniquement via la plateforme
            </div>
            <p className="text-3xs text-neutral-400">Authentifié par vérification CNI recto/verso</p>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="text-center text-3xs text-neutral-400 pt-4 border-t border-neutral-100 dark:border-neutral-800 font-sans">
          Ce contrat généré à la suite de la validation de souscription sous 48h engage les parties sous peine de
          poursuites judiciaires conformément aux dispositions du Code des Obligations Civiles et Commerciales (COCC) du
          Sénégal et de l'OHADA.
        </div>
      </div>
    </div>
  );
};
