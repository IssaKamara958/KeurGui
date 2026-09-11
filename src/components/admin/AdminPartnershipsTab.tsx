import React, { useState, useEffect } from 'react';
import { PartnershipApplication, PartnershipStatus } from '../../types';
import { PartnershipService } from '../../services/partnershipService';
import { PartnershipContractView } from '../partnership/PartnershipContractView';
import { useToast } from '../ui/Toast';
import { ContractPdfGenerator } from '../../services/contractPdfGenerator';
import {
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  AlertTriangle,
  Download,
  Trash2,
  Search,
  Building,
  User,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const AdminPartnershipsTab: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<PartnershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected dossier for deep inspection modal
  const [inspectedApp, setInspectedApp] = useState<PartnershipApplication | null>(null);

  // Rejection feedback state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Approval notes state
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('Dossier complet, CNI recto-verso vérifiées, titre foncier et plan conformes. Contrat de mandat avec 12% émis.');

  // Viewing contract in modal
  const [viewingContractApp, setViewingContractApp] = useState<PartnershipApplication | null>(null);

  const handleGeneratePdf = (app: PartnershipApplication) => {
    try {
      ContractPdfGenerator.generatePdf(app);
      showToast(`Modèle de contrat PDF (12% commission) généré avec succès pour ${app.owner_full_name} !`, 'success');
    } catch (err) {
      console.error('Erreur génération contrat PDF:', err);
      showToast('Erreur lors de la génération du contrat PDF', 'error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PartnershipService.getApplications();
      setApplications(data);
    } catch (e) {
      showToast('Erreur lors du chargement des partenariats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('partnerships_updated', handleUpdate);
    return () => window.removeEventListener('partnerships_updated', handleUpdate);
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const updated = await PartnershipService.updateStatus(id, 'approved', approvalNotes);
      setInspectedApp(updated);
      setIsApproving(false);
      showToast(`Partenariat ${id} validé avec succès ! Contrat de 12% généré.`, 'success');
      loadData();
    } catch (err) {
      showToast('Erreur lors de la validation', 'error');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      showToast('Veuillez indiquer le motif du rejet (renseignements ou pièces manquantes).', 'error');
      return;
    }
    try {
      const updated = await PartnershipService.updateStatus(
        id,
        'rejected',
        'Dossier rejeté par l’administration',
        rejectionReason.trim()
      );
      setInspectedApp(updated);
      setIsRejecting(false);
      showToast(`Dossier ${id} rejeté pour informations incomplètes.`, 'info');
      loadData();
    } catch (err) {
      showToast('Erreur lors du rejet', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive du dossier ${id} ?`)) return;
    try {
      await PartnershipService.deleteApplication(id);
      if (inspectedApp?.id === id) setInspectedApp(null);
      showToast(`Dossier ${id} supprimé`, 'info');
      loadData();
    } catch (e) {
      showToast('Erreur suppression', 'error');
    }
  };

  // Filter and search
  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' ? true : app.status === filterStatus;
    const matchesQuery =
      searchQuery.trim() === '' ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.owner_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.mandatary_name && app.mandatary_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending_review').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs">
          <span className="text-2xs font-bold uppercase text-neutral-500 block">Total Dossiers Reçus</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{applications.length}</div>
          <span className="text-3xs text-neutral-400">Demandes de partenariat</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <span className="text-2xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
            Étude 48h en Cours
          </span>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">{pendingCount}</div>
          <span className="text-3xs text-amber-700/80 dark:text-amber-400">À instruire sous 48h</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <span className="text-2xs font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
            Partenariats Validés
          </span>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{approvedCount}</div>
          <span className="text-3xs text-emerald-700/80 dark:text-emerald-400">Contrats 12% actifs</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-xs">
          <span className="text-2xs font-bold uppercase text-rose-800 dark:text-rose-300 block">
            Dossiers Rejetés
          </span>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-1">{rejectedCount}</div>
          <span className="text-3xs text-rose-700/80 dark:text-rose-400">Pièces/données incomplètes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, nom, ville..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {approvedCount > 0 && (
            <button
              id="btn-admin-generate-pdf-quick"
              onClick={() => {
                const approvedApp = applications.find((a) => a.status === 'approved');
                if (approvedApp) {
                  handleGeneratePdf(approvedApp);
                } else {
                  showToast('Aucun souscripteur validé trouvé.', 'info');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 hover:scale-[1.02] active:scale-95"
              title="Générer le modèle de contrat PDF (12% commission) pour le souscripteur validé"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Générer Contrat PDF (12%)</span>
            </button>
          )}

          {[
            { id: 'all', label: 'Tous' },
            { id: 'pending_review', label: `En étude (${pendingCount})` },
            { id: 'approved', label: `Validés (${approvedCount})` },
            { id: 'rejected', label: `Rejetés (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === tab.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/70 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 text-2xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3">Réf & Date</th>
                <th className="px-4 py-3">Propriétaire / Mandataire</th>
                <th className="px-4 py-3">Bien Immobilier</th>
                <th className="px-4 py-3">Prix Requis</th>
                <th className="px-4 py-3">Commission (12%)</th>
                <th className="px-4 py-3">Pièces</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                    Aucun dossier de partenariat trouvé.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const hasCniR = app.documents.some((d) => d.type === 'cni_recto');
                  const hasCniV = app.documents.some((d) => d.type === 'cni_verso');
                  const hasBothCni = hasCniR && hasCniV;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-750/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-neutral-900 dark:text-white">{app.id}</div>
                        <span className="text-3xs text-neutral-400">
                          {new Date(app.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {app.owner_full_name}
                        </div>
                        {app.is_mandated && (
                          <div className="text-3xs text-emerald-600 dark:text-emerald-400 font-mono">
                            Mandataire: {app.mandatary_name}
                          </div>
                        )}
                        <div className="text-3xs text-neutral-400 font-mono">{app.owner_phone}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[160px]">
                          {app.title}
                        </div>
                        <span className="text-3xs text-neutral-500">
                          {app.property_type.toUpperCase()} • {app.surface} {app.surface_unit} • {app.city}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-neutral-900 dark:text-white">
                        {PartnershipService.formatPrice(app.minimum_price, app.currency)}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {PartnershipService.formatPrice(app.estimated_commission, app.currency)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-3xs font-mono font-bold ${
                              hasBothCni
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            CNI: {hasBothCni ? 'R+V OK' : 'INCOMPLET'}
                          </span>
                          <span className="text-3xs text-neutral-400 font-mono">({app.documents.length} docs)</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-bold ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {app.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {app.status === 'pending_review' && <Clock className="w-3 h-3" />}
                          <span>
                            {app.status === 'approved'
                              ? 'Validé'
                              : app.status === 'rejected'
                              ? 'Rejeté'
                              : 'Étude 48h'}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Dedicated PDF Contract generation button for validated subscribers */}
                          {app.status === 'approved' && (
                            <button
                              id={`btn-generate-pdf-${app.id}`}
                              onClick={() => handleGeneratePdf(app)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-3xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              title="Générer et télécharger le modèle officiel de contrat de partenariat PDF (12% commission)"
                            >
                              <Download className="w-3 h-3" />
                              <span>Contrat PDF (12%)</span>
                            </button>
                          )}

                          <button
                            onClick={() => setInspectedApp(app)}
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                            title="Examiner le dossier complet"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {app.contract && (
                            <button
                              onClick={() => setViewingContractApp(app)}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                              title="Voir le contrat de mandat émis"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Dossier Modal */}
      {inspectedApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-3xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <span>Dossier de Partenariat {inspectedApp.id}</span>
                    <span
                      className={`text-2xs px-2 py-0.5 rounded-full font-mono ${
                        inspectedApp.status === 'approved'
                          ? 'bg-emerald-600'
                          : inspectedApp.status === 'rejected'
                          ? 'bg-rose-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      {inspectedApp.status.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-2xs text-neutral-400">
                    Déposé le {new Date(inspectedApp.created_at).toLocaleString('fr-FR')} • SLA d'étude : 48h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {inspectedApp.status === 'approved' && (
                  <button
                    id="modal-header-btn-pdf"
                    onClick={() => handleGeneratePdf(inspectedApp)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Générer et télécharger le modèle de contrat de partenariat PDF (12%)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Générer Contrat PDF (12%)</span>
                  </button>
                )}
                <button
                  onClick={() => setInspectedApp(null)}
                  className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
              {/* Highlight Banner for Approved Partner */}
              {inspectedApp.status === 'approved' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                        <span>Souscripteur Validé • Mandat Actif (12% Commission)</span>
                      </h5>
                      <p className="text-2xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Dossier complet (CNI vérifiée, acte ou titre foncier validé). Le modèle de contrat de mandat standardisé intégrant la clause des 12% est disponible.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-inspect-banner-generate-pdf"
                    onClick={() => handleGeneratePdf(inspectedApp)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 hover:scale-[1.02] active:scale-95"
                    title="Générer et télécharger le contrat de partenariat PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Générer Contrat PDF (12%)</span>
                  </button>
                </div>
              )}
              {/* Identities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <div className="space-y-1">
                  <span className="text-2xs uppercase font-bold text-neutral-500">Propriétaire / Titulaire</span>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white">
                    {inspectedApp.owner_full_name}
                  </div>
                  <p className="font-mono text-neutral-600 dark:text-neutral-300">
                    Tél : {inspectedApp.owner_phone}
                  </p>
                  {inspectedApp.owner_email && (
                    <p className="text-neutral-500">{inspectedApp.owner_email}</p>
                  )}
                  <p className="text-2xs text-neutral-500">
                    Rôle : <strong>{inspectedApp.applicant_role}</strong>
                  </p>
                </div>

                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-700 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-2xs uppercase font-bold text-neutral-500">Mandataire Désigné</span>
                  {inspectedApp.is_mandated ? (
                    <>
                      <div className="font-bold text-sm text-neutral-900 dark:text-white">
                        {inspectedApp.mandatary_name}
                      </div>
                      <p className="font-mono text-neutral-600 dark:text-neutral-300">
                        Tél : {inspectedApp.mandatary_phone}
                      </p>
                      <p className="font-mono text-2xs text-neutral-500">
                        CNI : {inspectedApp.mandatary_cin}
                      </p>
                    </>
                  ) : (
                    <p className="text-neutral-500 italic">Aucun mandataire tiers. Souscription directe du titulaire.</p>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-neutral-500">Caractéristiques du Bien</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-bold uppercase text-2xs">
                    {inspectedApp.property_type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{inspectedApp.title}</h4>
                <p className="text-neutral-600 dark:text-neutral-400">{inspectedApp.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <div>
                    <span className="text-3xs text-neutral-400 block">Superficie</span>
                    <strong className="font-mono">{inspectedApp.surface} {inspectedApp.surface_unit}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-neutral-400 block">Titre de propriété</span>
                    <strong>{inspectedApp.title_deed_type.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-neutral-400 block">Localisation</span>
                    <strong>{inspectedApp.city}, {inspectedApp.neighborhood}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-neutral-400 block">Prix Net Vendeur</span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      {PartnershipService.formatPrice(inspectedApp.minimum_price, inspectedApp.currency)}
                    </strong>
                  </div>
                </div>

                {inspectedApp.google_maps_url && (
                  <div className="pt-2">
                    <a
                      href={inspectedApp.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono text-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Ouvrir la position Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* 12% Commission Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Clause de rémunération : 12% de Commission
                  </span>
                  <p className="text-3xs text-neutral-600 dark:text-neutral-400">
                    Calculée sur le prix net vendeur garanti ({PartnershipService.formatPrice(inspectedApp.minimum_price, inspectedApp.currency)})
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-base text-emerald-800 dark:text-emerald-300">
                    {PartnershipService.formatPrice(inspectedApp.estimated_commission, inspectedApp.currency)}
                  </span>
                  <span className="block text-3xs text-emerald-600">Exigible si vente conclue via l'app</span>
                </div>
              </div>

              {/* Uploaded Documents Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-neutral-700 dark:text-neutral-300">
                    Pièces Justificatives Téléversées ({inspectedApp.documents.length})
                  </span>
                  <span className="text-2xs text-neutral-400">Contrôler CNI Recto ET Verso</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectedApp.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-start gap-3"
                    >
                      {doc.type === 'photo_bien' || doc.url.startsWith('data:image') || doc.url.includes('images.unsplash.com') ? (
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-300 dark:border-neutral-600 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-neutral-900 dark:text-white truncate text-xs">
                          {doc.name}
                        </div>
                        <span className="text-3xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono inline-block mt-0.5 uppercase">
                          {doc.type}
                        </span>
                        <p className="text-3xs text-neutral-400 mt-0.5">{doc.file_size || 'Fichier certifié'}</p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 cursor-pointer"
                        title="Ouvrir le document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status specific notices */}
              {inspectedApp.status === 'rejected' && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200">
                  <strong className="block text-xs font-bold mb-1">Motif de rejet notifié :</strong>
                  <p>{inspectedApp.rejection_reason}</p>
                </div>
              )}

              {inspectedApp.status === 'approved' && inspectedApp.contract && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Contrat {inspectedApp.contract.contract_number} émis
                    </strong>
                    <p className="text-3xs text-neutral-600 dark:text-neutral-400">
                      Clauses de mandat et commission 12% scellées par Abdou KAMARA.
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingContractApp(inspectedApp)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Afficher Contrat</span>
                  </button>
                </div>
              )}

              {/* Approval or Rejection interactive triggers */}
              {isApproving && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-3">
                  <strong className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Validation du partenariat & Génération du Contrat de Mandat (12%)
                  </strong>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-neutral-900 text-xs"
                    placeholder="Notes de validation administratives..."
                  ></textarea>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsApproving(false)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleApprove(inspectedApp.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmer la validation & signer le contrat</span>
                    </button>
                  </div>
                </div>
              )}

              {isRejecting && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 space-y-3">
                  <strong className="block text-xs font-bold text-rose-900 dark:text-rose-200">
                    Rejet du dossier (Pièces ou renseignements manquants)
                  </strong>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-neutral-900 text-xs"
                    placeholder="Ex: Copie de la pièce d'identité manquante (verso introuvable), titre de propriété illisible ou prix minimum non conforme..."
                  ></textarea>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleReject(inspectedApp.id)}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirmer le rejet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800/80 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDelete(inspectedApp.id)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer le dossier</span>
              </button>

              <div className="flex items-center gap-2">
                {inspectedApp.status === 'approved' && (
                  <>
                    <button
                      id="btn-modal-footer-view-contract"
                      onClick={() => setViewingContractApp(inspectedApp)}
                      className="px-3.5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Consulter le contrat officiel à l'écran"
                    >
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Consulter Contrat</span>
                    </button>
                    <button
                      id="btn-modal-footer-generate-pdf"
                      onClick={() => handleGeneratePdf(inspectedApp)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-95"
                      title="Générer et télécharger le modèle de contrat de partenariat PDF (12% de commission)"
                    >
                      <Download className="w-4 h-4" />
                      <span>Générer Contrat PDF (12%)</span>
                    </button>
                  </>
                )}

                {inspectedApp.status !== 'approved' && !isApproving && (
                  <button
                    onClick={() => {
                      setIsApproving(true);
                      setIsRejecting(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valider & Générer Contrat (12%)</span>
                  </button>
                )}

                {inspectedApp.status !== 'rejected' && !isRejecting && (
                  <button
                    onClick={() => {
                      setIsRejecting(true);
                      setIsApproving(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejeter (Dossier Incomplet)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {viewingContractApp && viewingContractApp.contract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl my-auto">
            <PartnershipContractView
              contract={viewingContractApp.contract}
              application={viewingContractApp}
              onClose={() => setViewingContractApp(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
