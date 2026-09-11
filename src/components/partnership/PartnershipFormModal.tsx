import React, { useState } from 'react';
import {
  PartnershipApplication,
  PartnershipPropertyType,
  PartnershipRole,
  PartnershipDocument,
  DocumentType,
} from '../../types';
import { PartnershipService } from '../../services/partnershipService';
import { useToast } from '../ui/Toast';
import {
  X,
  Building,
  User,
  Shield,
  FileText,
  Upload,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Percent,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface PartnershipFormModalProps {
  onClose: () => void;
  onSuccess: (application: PartnershipApplication) => void;
}

export const PartnershipFormModal: React.FC<PartnershipFormModalProps> = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();

  // Current Step: 1 = Rôle & Identité, 2 = Caractéristiques & Localisation, 3 = Prix & Commission 12%, 4 = Pièces justificatives, 5 = Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [applicantRole, setApplicantRole] = useState<PartnershipRole>('proprietaire');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+221 ');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isMandated, setIsMandated] = useState<boolean>(false);
  const [mandataryName, setMandataryName] = useState('');
  const [mandataryPhone, setMandataryPhone] = useState('+221 ');
  const [mandataryCin, setMandataryCin] = useState('');

  // Property Details
  const [propertyType, setPropertyType] = useState<PartnershipPropertyType>('maison');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [surface, setSurface] = useState<number>(500);
  const [surfaceUnit, setSurfaceUnit] = useState<string>('m²');

  // Location
  const [city, setCity] = useState('Thiès');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<string>('14.7891');
  const [longitude, setLongitude] = useState<string>('-16.9247');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Pricing & 12% commission
  const [minimumPrice, setMinimumPrice] = useState<number>(35000000);
  const currency = 'FCFA';

  // Legal documentation
  const [titleDeedType, setTitleDeedType] = useState<
    'titre_foncier' | 'bail' | 'deliberation' | 'acte_notarie' | 'jugement_succession' | 'autre'
  >('titre_foncier');
  const [titleDeedNumber, setTitleDeedNumber] = useState('');

  // Uploaded documents
  const [documents, setDocuments] = useState<PartnershipDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  // Agreement
  const [acceptedCommissionClause, setAcceptedCommissionClause] = useState<boolean>(false);
  const [acceptedTermsAndRisk, setAcceptedTermsAndRisk] = useState<boolean>(false);

  // Calculate live 12% commission
  const commissionAmount = PartnershipService.calculateCommission(minimumPrice);

  // File upload handler (supporting drag and drop and click)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType, docLabel: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newDoc: PartnershipDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: docType,
          url: dataUrl,
          uploaded_at: new Date().toISOString(),
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} Mo`,
        };
        setDocuments((prev) => [...prev.filter((d) => !(d.type === docType && (docType === 'cni_recto' || docType === 'cni_verso'))), newDoc]);
        showToast(`${docLabel} chargé avec succès`, 'success');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Helper check for required documents
  const hasCniRecto = documents.some((d) => d.type === 'cni_recto');
  const hasCniVerso = documents.some((d) => d.type === 'cni_verso');
  const hasTitreOrActe = documents.some((d) => d.type === 'titre_foncier' || d.type === 'acte_notarie');
  const hasPlan = documents.some((d) => d.type === 'plan_cadastral');
  const hasPhoto = documents.some((d) => d.type === 'photo_bien');

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerFullName.trim()) {
      showToast('Veuillez renseigner le nom complet du propriétaire ou ayant droit.', 'error');
      setCurrentStep(1);
      return;
    }

    if (isMandated && !mandataryName.trim()) {
      showToast('Veuillez renseigner le nom complet du mandataire.', 'error');
      setCurrentStep(1);
      return;
    }

    if (!minimumPrice || minimumPrice <= 0) {
      showToast('Veuillez renseigner le prix minimum requis par le mandataire.', 'error');
      setCurrentStep(3);
      return;
    }

    if (!hasCniRecto || !hasCniVerso) {
      showToast("Attention : La copie de la pièce d'identité (Recto ET Verso) est impérative pour éviter le rejet immédiat du dossier.", 'error');
      setCurrentStep(4);
      return;
    }

    if (!acceptedCommissionClause || !acceptedTermsAndRisk) {
      showToast("Veuillez approuver la clause de commission de 12% et les conditions d'étude.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdApp = await PartnershipService.submitApplication({
        applicant_role: applicantRole,
        owner_full_name: ownerFullName.trim(),
        owner_phone: ownerPhone.trim(),
        owner_email: ownerEmail.trim() || undefined,
        is_mandated: isMandated,
        mandatary_name: isMandated ? mandataryName.trim() : undefined,
        mandatary_phone: isMandated ? mandataryPhone.trim() : undefined,
        mandatary_cin: isMandated ? mandataryCin.trim() : undefined,
        property_type: propertyType,
        title: title.trim() || `${propertyType === 'terrain' ? 'Terrain' : 'Maison'} à vendre - ${city}`,
        description: description.trim(),
        surface: Number(surface) || 0,
        surface_unit: surfaceUnit,
        minimum_price: Number(minimumPrice),
        currency,
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        google_maps_url: googleMapsUrl.trim(),
        title_deed_type: titleDeedType,
        title_deed_number: titleDeedNumber.trim(),
        documents,
      });

      showToast(`Dossier ${createdApp.id} transmis avec succès ! Étude sous 48h.`, 'success');
      onSuccess(createdApp);
    } catch (err) {
      showToast('Une erreur est survenue lors de la souscription. Veuillez réessayer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="bg-neutral-900 dark:bg-neutral-950 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Souscription Partenariat Vendeur</h2>
              <p className="text-2xs sm:text-xs text-neutral-400">
                Mise en vente de maison ou terrain • Commission de 12% • Étude de dossier sous 48h
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-neutral-100 dark:bg-neutral-800/80 px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center justify-between gap-1 overflow-x-auto text-2xs sm:text-xs font-semibold">
            {[
              { num: 1, label: 'Identités' },
              { num: 2, label: 'Le Bien' },
              { num: 3, label: 'Prix & 12%' },
              { num: 4, label: 'Pièces (CNI/Actes)' },
              { num: 5, label: 'Engagement' },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  currentStep === step.num
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : currentStep > step.num
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/40'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-3xs font-mono">
                  {step.num}
                </span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6 text-neutral-800 dark:text-neutral-200">
          {/* STEP 1: Applicant Role & Identities */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <strong>Transparence légale :</strong> L'administration d'Abdou KAMARA exige la déclaration sincère du
                  propriétaire et/ou de son mandataire mandaté. Tout renseignement manquant entraîne le rejet du dossier.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Qualité du souscripteur *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'proprietaire', label: 'Propriétaire Direct' },
                    { id: 'mandataire', label: 'Mandataire Officiel' },
                    { id: 'ayant_droit', label: 'Ayant Droit / Succession' },
                    { id: 'promoteur', label: 'Promoteur Immobilier' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setApplicantRole(role.id as PartnershipRole);
                        setIsMandated(role.id === 'mandataire');
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        applicantRole === role.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Owner Information */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Informations du Propriétaire / Famille Titulaire</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold mb-1">Nom complet ou Succession *</label>
                    <input
                      type="text"
                      value={ownerFullName}
                      onChange={(e) => setOwnerFullName(e.target.value)}
                      placeholder="Ex: Abdoulaye Ndiaye / Famille Fatou Ba"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold mb-1">Téléphone de contact (WhatsApp) *</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-2xs font-semibold mb-1">Email de correspondance (Optionnel)</label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="contact@exemple.sn"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatary section if applicable */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMandated}
                      onChange={(e) => setIsMandated(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold">Le bien est représenté par un Mandataire désigné</span>
                  </label>
                </div>

                {isMandated && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-2xs font-semibold mb-1">Nom du mandataire *</label>
                      <input
                        type="text"
                        value={mandataryName}
                        onChange={(e) => setMandataryName(e.target.value)}
                        placeholder="Ex: Moussa Ndiaye"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold mb-1">Téléphone WhatsApp Mandataire *</label>
                      <input
                        type="tel"
                        value={mandataryPhone}
                        onChange={(e) => setMandataryPhone(e.target.value)}
                        placeholder="+221 77 ..."
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold mb-1">N° CNI du mandataire *</label>
                      <input
                        type="text"
                        value={mandataryCin}
                        onChange={(e) => setMandataryCin(e.target.value)}
                        placeholder="Ex: 1 254 1985 00982"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: The Property & Geographic Position */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">Type de bien *</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PartnershipPropertyType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="maison">Maison individuelle</option>
                    <option value="terrain">Terrain nu / Parcelle</option>
                    <option value="villa">Villa de standing</option>
                    <option value="immeuble">Immeuble de rapport</option>
                    <option value="autre">Autre propriété</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Superficie exacte *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={surface}
                      onChange={(e) => setSurface(Number(e.target.value))}
                      placeholder="Ex: 600"
                      required
                      min="1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <select
                      value={surfaceUnit}
                      onChange={(e) => setSurfaceUnit(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold"
                    >
                      <option value="m²">m²</option>
                      <option value="ha">ha</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1.5">Titre de l'annonce / Désignation *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Belle Maison 600 m² à Thiès ou Terrain d’angle à Saly"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1.5">Description concise du domicile / terrain</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Précisez les commodités : accès eau, électricité, voie carrossable, clôture, pièces..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Position Géographique & Adresse du Bien</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-2xs font-semibold mb-1">Ville / Commune *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Thiès / Saly / Dakar"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold mb-1">Quartier *</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Randoulène / Mbour"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold mb-1">Point de repère notoire</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Ex: Près de la mosquée, école"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-2xs font-semibold mb-1">Adresse ou itinéraire précis</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Rue 14 angle Avenue Malick Sy"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold mb-1">Latitude GPS</label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="14.7891"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold mb-1">Longitude GPS</label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="-16.9247"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold mb-1">Lien Google Maps (Optionnel)</label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Minimum Price & 12% Commission Clause */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm uppercase">
                  <Percent className="w-5 h-5 text-emerald-600" />
                  <span>Règle d'Or du Partenariat : 12% sur la vente effective</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed">
                  Une commission d'apport d'affaires de <strong>12% du prix de vente effectif</strong> sera perçue si et
                  seulement si la vente du bien est conclue par l'intermédiaire de cette application. En contrepartie,
                  notre plateforme assure l'étude de votre dossier, la diffusion multi-canale, la mise en relation avec
                  des acheteurs vérifiés et la rédaction du contrat de mandat.
                </p>
              </div>

              {/* Minimum Required Price Input */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xs space-y-4">
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Prix de vente minimum requis par le mandataire / propriétaire (Net Vendeur en FCFA) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={minimumPrice}
                    onChange={(e) => setMinimumPrice(Math.max(0, Number(e.target.value)))}
                    step="500000"
                    min="1000000"
                    required
                    className="w-full pl-4 pr-20 py-3.5 rounded-xl border-2 border-emerald-500/80 bg-white dark:bg-neutral-900 text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-neutral-500">
                    FCFA
                  </span>
                </div>

                {/* Calculation breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-2xs text-neutral-500 block">Commission partenaire (12%) :</span>
                    <strong className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {PartnershipService.formatPrice(commissionAmount, currency)}
                    </strong>
                    <span className="text-3xs text-neutral-400 block mt-0.5">Payable uniquement à la conclusion de la vente</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-2xs text-neutral-500 block">Prix affiché public suggéré :</span>
                    <strong className="text-base font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {PartnershipService.formatPrice(minimumPrice + commissionAmount, currency)}
                    </strong>
                    <span className="text-3xs text-neutral-400 block mt-0.5">Permet de préserver votre net vendeur</span>
                  </div>
                </div>
              </div>

              {/* Title Deed Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Nature de l'acte / Titre de propriété *</label>
                  <select
                    value={titleDeedType}
                    onChange={(e) => setTitleDeedType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="titre_foncier">Titre Foncier (TF individuel)</option>
                    <option value="bail">Bail emphytéotique ou administratif</option>
                    <option value="deliberation">Délibération municipale / Acte de cession</option>
                    <option value="acte_notarie">Acte notarié de vente</option>
                    <option value="jugement_succession">Jugement d'hérédité / Succession</option>
                    <option value="autre">Autre acte légal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Numéro du titre ou de l'acte</label>
                  <input
                    type="text"
                    value={titleDeedNumber}
                    onChange={(e) => setTitleDeedNumber(e.target.value)}
                    placeholder="Ex: TF 14.892/TH ou Bail N° 451"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Mandatory Uploads (CNI Recto/Verso, Deed, Plan, Photos) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                  <strong>Clause d'exigence documentaire :</strong> Pour que votre dossier soit recevable et examiné
                  dans le délai contractuel de 48h, vous <strong>DEVEZ impérativement</strong> téléverser les copies de
                  vos pièces justificatives, notamment la <strong>pièce d'identité RECTO et VERSO</strong> du
                  contractant, le titre/acte, et le plan. À défaut, le partenariat sera <strong>automatiquement rejeté</strong>.
                </div>
              </div>

              {/* Upload Grid with Usability (Click & Drag-and-Drop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. CNI Recto */}
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                    hasCniRecto
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {hasCniRecto ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                      1. Pièce d'Identité — RECTO *
                    </span>
                    <span className="text-3xs text-rose-600 font-bold uppercase">Obligatoire</span>
                  </div>
                  <label className="block text-center py-4 px-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                      Cliquer ou glisser le fichier (Recto)
                    </span>
                    <span className="text-3xs text-neutral-400">JPG, PNG ou PDF</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'cni_recto', 'CNI Recto')}
                    />
                  </label>
                  {documents
                    .filter((d) => d.type === 'cni_recto')
                    .map((d) => (
                      <div
                        key={d.id}
                        className="mt-2 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-xs flex items-center justify-between"
                      >
                        <span className="truncate font-mono text-2xs">{d.name} ({d.file_size})</span>
                        <button
                          type="button"
                          onClick={() => removeDoc(d.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* 2. CNI Verso */}
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                    hasCniVerso
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {hasCniVerso ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                      2. Pièce d'Identité — VERSO *
                    </span>
                    <span className="text-3xs text-rose-600 font-bold uppercase">Obligatoire</span>
                  </div>
                  <label className="block text-center py-4 px-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                      Cliquer ou glisser le fichier (Verso)
                    </span>
                    <span className="text-3xs text-neutral-400">JPG, PNG ou PDF</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'cni_verso', 'CNI Verso')}
                    />
                  </label>
                  {documents
                    .filter((d) => d.type === 'cni_verso')
                    .map((d) => (
                      <div
                        key={d.id}
                        className="mt-2 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-xs flex items-center justify-between"
                      >
                        <span className="truncate font-mono text-2xs">{d.name} ({d.file_size})</span>
                        <button
                          type="button"
                          onClick={() => removeDoc(d.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* 3. Titre / Acte de propriété */}
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                    hasTitreOrActe
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {hasTitreOrActe ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                      3. Copie Titre Foncier, Bail ou Acte notarié *
                    </span>
                    <span className="text-3xs text-amber-600 font-bold uppercase">Recommandé</span>
                  </div>
                  <label className="block text-center py-4 px-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
                    <FileText className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                      Téléverser le titre de propriété
                    </span>
                    <span className="text-3xs text-neutral-400">PDF ou photos des feuillets</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'titre_foncier', 'Titre de propriété')}
                    />
                  </label>
                  {documents
                    .filter((d) => d.type === 'titre_foncier' || d.type === 'acte_notarie')
                    .map((d) => (
                      <div
                        key={d.id}
                        className="mt-2 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-xs flex items-center justify-between"
                      >
                        <span className="truncate font-mono text-2xs">{d.name} ({d.file_size})</span>
                        <button
                          type="button"
                          onClick={() => removeDoc(d.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* 4. Plan cadastral ou plan de bornage géomètre */}
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                    hasPlan
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {hasPlan ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                      4. Plan cadastral / Plan de bornage géomètre
                    </span>
                    <span className="text-3xs text-neutral-500 font-bold uppercase">Plan géomètre</span>
                  </div>
                  <label className="block text-center py-4 px-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
                    <FileCheck className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                      Téléverser le plan de masse / bornage
                    </span>
                    <span className="text-3xs text-neutral-400">Format PDF ou image nette</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'plan_cadastral', 'Plan cadastral')}
                    />
                  </label>
                  {documents
                    .filter((d) => d.type === 'plan_cadastral')
                    .map((d) => (
                      <div
                        key={d.id}
                        className="mt-2 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-xs flex items-center justify-between"
                      >
                        <span className="truncate font-mono text-2xs">{d.name} ({d.file_size})</span>
                        <button
                          type="button"
                          onClick={() => removeDoc(d.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* 5. Photos propres du bien */}
                <div className="md:col-span-2 p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      5. Images propres et récentes du bien immobilier
                    </span>
                    <span className="text-3xs text-emerald-600 font-bold uppercase">Photos nettes requises</span>
                  </div>
                  <label className="block text-center py-4 px-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
                    <Camera className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                      Cliquer pour ajouter des photos de la maison / du terrain
                    </span>
                    <span className="text-3xs text-neutral-400">Façade, intérieur, terrain, voies d'accès</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'photo_bien', 'Photo du bien')}
                    />
                  </label>

                  {/* Document chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {documents
                      .filter((d) => d.type === 'photo_bien')
                      .map((d) => (
                        <div
                          key={d.id}
                          className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center gap-2"
                        >
                          <img
                            src={d.url}
                            alt="preview"
                            className="w-8 h-8 rounded object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="truncate max-w-[120px] font-mono text-3xs">{d.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDoc(d.id)}
                            className="text-rose-600 hover:text-rose-800 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Clauses, Legal Commitments & Final Submission */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-neutral-50 dark:bg-neutral-800/80 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Récapitulatif de votre souscription</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-2xs text-neutral-500 block">Souscripteur</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{ownerFullName}</strong>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Type de bien</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{propertyType} ({surface} {surfaceUnit})</strong>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Localisation</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{city}, {neighborhood}</strong>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Prix Net Vendeur</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {PartnershipService.formatPrice(minimumPrice, currency)}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-2xs font-semibold">Pièces jointes fournies ({documents.length}) :</span>
                  <div className="flex gap-2 text-3xs font-mono">
                    <span className={hasCniRecto && hasCniVerso ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      CNI Recto/Verso: {hasCniRecto && hasCniVerso ? '✓ OUI' : '✗ MANQUANT'}
                    </span>
                    <span>•</span>
                    <span className={hasTitreOrActe ? 'text-emerald-600' : 'text-amber-600'}>
                      Titre/Acte: {hasTitreOrActe ? '✓' : 'Non fourni'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Checkboxes Required by Prompt */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedCommissionClause}
                    onChange={(e) => setAcceptedCommissionClause(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 shrink-0 mt-0.5"
                    required
                  />
                  <div className="text-xs text-emerald-950 dark:text-emerald-100">
                    <strong className="block text-emerald-900 dark:text-emerald-200 mb-1">
                      Approbation expresse de la commission de 12% sur la vente effective *
                    </strong>
                    J'accepte sans réserve qu'une commission d'intermédiation de <strong>12% du prix de vente effectif</strong>{' '}
                    soit demandée et due si la vente du bien est réalisée par le canal de cette application. En cas de
                    conclusion sans intermédiaire de l'application, aucun frais n'est réclamé.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTermsAndRisk}
                    onChange={(e) => setAcceptedTermsAndRisk(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 shrink-0 mt-0.5"
                    required
                  />
                  <div className="text-xs text-amber-950 dark:text-amber-100">
                    <strong className="block text-amber-900 dark:text-amber-200 mb-1">
                      Étude du dossier sous 48h & Risque de rejet en cas de pièces manquantes *
                    </strong>
                    Je reconnais qu'après soumission, mon dossier fera l'objet d'une étude rigoureuse de <strong>48 heures</strong> par
                    l'administrateur. Au cas où l'administration ne reçoit pas l'intégralité des renseignements et pièces
                    (notamment identité recto-verso et actes), le partenariat <strong>risque le rejet pur et simple</strong>.
                    Une fois le dossier validé, je recevrai directement dans l'application mon contrat de partenariat officiel.
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls inside modal */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <span>Étape suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !acceptedCommissionClause || !acceptedTermsAndRisk}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Transmission du dossier...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Soumettre mon dossier (Étude 48h)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
