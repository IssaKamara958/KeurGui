import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyMedia, Contact, PropertyFeature, AnalyticsSummary } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { useToast } from '../ui/Toast';
import {
  X,
  Lock,
  LogOut,
  LayoutDashboard,
  Home,
  Camera,
  MessageSquare,
  MapPin,
  Film,
  Sparkles,
  BarChart3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Upload,
  Star,
  ExternalLink,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertTriangle,
  Handshake,
  FileText,
  Download,
} from 'lucide-react';
import L from 'leaflet';
import { AdminPartnershipsTab } from './AdminPartnershipsTab';

interface AdminDashboardProps {
  property: Property;
  onClose: () => void;
  onPropertyUpdated: (updated: Property) => void;
}

type AdminTab = 'dashboard' | 'partnerships' | 'general' | 'location' | 'media' | 'contacts' | 'features';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  property,
  onClose,
  onPropertyUpdated,
}) => {
  const { showToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('maison_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Form states for Property
  const [formData, setFormData] = useState<Property>(property);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New Media form state
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaAlt, setNewMediaAlt] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'tiktok'>('image');

  // New Contact form state
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactLabel, setNewContactLabel] = useState('');
  const [newContactType, setNewContactType] = useState<'whatsapp' | 'phone'>('whatsapp');
  const [newContactPrimary, setNewContactPrimary] = useState(false);

  // New Feature form state
  const [newFeatureLabel, setNewFeatureLabel] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [newFeatureIcon, setNewFeatureIcon] = useState('shield-check');

  // Leaflet map ref for interactive coordinate picker
  const adminMapContainerRef = useRef<HTMLDivElement>(null);
  const adminMapInstanceRef = useRef<L.Map | null>(null);
  const adminMarkerRef = useRef<L.Marker | null>(null);

  // Load analytics when opening
  useEffect(() => {
    if (isAuthenticated) {
      AnalyticsService.getSummary().then(setAnalyticsData);
    }
  }, [isAuthenticated]);

  // Keep form in sync if external updates occur
  useEffect(() => {
    setFormData(property);
  }, [property]);

  // Interactive Map Picker logic
  useEffect(() => {
    if (activeTab !== 'location' || !isAuthenticated) return;

    const timer = setTimeout(() => {
      if (!adminMapContainerRef.current) return;

      const lat = formData.latitude || 14.7932;
      const lng = formData.longitude || -16.9265;

      if (!adminMapInstanceRef.current) {
        const map = L.map(adminMapContainerRef.current).setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.bindPopup('Cliquez ou glissez pour positionner la maison').openPopup();

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6)),
          }));
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setFormData((prev) => ({
            ...prev,
            latitude: Number(e.latlng.lat.toFixed(6)),
            longitude: Number(e.latlng.lng.toFixed(6)),
          }));
        });

        adminMapInstanceRef.current = map;
        adminMarkerRef.current = marker;
      } else {
        adminMapInstanceRef.current.invalidateSize();
        adminMapInstanceRef.current.setView([lat, lng]);
        if (adminMarkerRef.current) {
          adminMarkerRef.current.setLatLng([lat, lng]);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeTab, isAuthenticated, formData.latitude, formData.longitude]);

  // Handle Login: only admin with Identifiant "AbdouKamara" and Mot de passe "Bayesack01."
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const trimmedUser = usernameInput.trim();
    const enteredPass = passwordInput;

    // Strict validation: must exactly match "AbdouKamara" and "Bayesack01."
    if (trimmedUser === 'AbdouKamara' && enteredPass === 'Bayesack01.') {
      try {
        await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUser, password: enteredPass }),
        });
      } catch (err) {
        // network or local fallback
      }
      setIsAuthenticated(true);
      localStorage.setItem('maison_admin_auth', 'true');
      setAuthError('');
      showToast('Connexion réussie ! Bienvenue dans l’espace administrateur.', 'success');
    } else {
      setAuthError('Identifiant ou mot de passe incorrect. Seul l’administrateur autorisé peut se connecter.');
      showToast('Accès refusé : identifiants incorrects.', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('maison_admin_auth');
    showToast('Déconnexion effectuée', 'info');
  };

  // Save General Property Form
  const handleSaveProperty = async () => {
    setIsSaving(true);
    try {
      const updated = await PropertyService.updateProperty(formData);
      onPropertyUpdated(updated);
      showToast('Modifications enregistrées ! Le site public est à jour.', 'success');
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Photo / File upload (converts file to base64 or stores URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          const newMedia = await PropertyService.addMedia({
            url: base64Url,
            title: file.name.replace(/\.[^/.]+$/, ''),
            alt_text: `Photo réelle : ${file.name}`,
            type: 'image',
            featured: formData.media.length === 0,
          });
          setFormData((prev) => ({
            ...prev,
            media: [...prev.media, newMedia],
          }));
          showToast(`Photo "${file.name}" ajoutée avec succès !`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Media by URL
  const handleAddMediaByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) {
      showToast('Veuillez entrer une URL valide', 'error');
      return;
    }

    const added = await PropertyService.addMedia({
      type: newMediaType,
      url: newMediaUrl,
      title: newMediaTitle || (newMediaType === 'tiktok' ? 'Vidéo TikTok' : 'Photo de la maison'),
      alt_text: newMediaAlt || 'Photo maison à vendre',
      featured: false,
    });

    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, added],
    }));

    setNewMediaUrl('');
    setNewMediaTitle('');
    setNewMediaAlt('');
    showToast('Média ajouté avec succès', 'success');
  };

  // Toggle Media Featured
  const handleToggleFeaturedMedia = async (mediaId: string) => {
    await PropertyService.updateMedia(mediaId, { featured: true });
    setFormData((prev) => ({
      ...prev,
      media: prev.media.map((m) => ({
        ...m,
        featured: m.id === mediaId,
      })),
      og_image: prev.media.find((m) => m.id === mediaId)?.url || prev.og_image,
    }));
    showToast('Photo principale mise à jour', 'success');
  };

  // Toggle Media Active
  const handleToggleMediaActive = async (mediaId: string, currentActive: boolean) => {
    await PropertyService.updateMedia(mediaId, { active: !currentActive });
    setFormData((prev) => ({
      ...prev,
      media: prev.media.map((m) => (m.id === mediaId ? { ...m, active: !currentActive } : m)),
    }));
    showToast(`Média ${!currentActive ? 'activé' : 'désactivé'}`, 'info');
  };

  // Delete Media
  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Supprimer ce média ?')) return;
    await PropertyService.deleteMedia(mediaId);
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== mediaId),
    }));
    showToast('Média supprimé', 'info');
  };

  // Update Media Title
  const handleUpdateMediaTitle = async (mediaId: string, title: string) => {
    await PropertyService.updateMedia(mediaId, { title });
    setFormData((prev) => ({
      ...prev,
      media: prev.media.map((m) => (m.id === mediaId ? { ...m, title } : m)),
    }));
    showToast('Titre de la photo mis à jour', 'success');
  };

  // Add Contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactPhone) {
      showToast('Numéro de téléphone requis', 'error');
      return;
    }

    const added = await PropertyService.addContact({
      value: newContactPhone,
      label: newContactLabel || 'WhatsApp',
      type: newContactType,
      is_primary: newContactPrimary,
    });

    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, added],
    }));

    setNewContactPhone('');
    setNewContactLabel('');
    setNewContactPrimary(false);
    showToast('Nouveau contact enregistré', 'success');
  };

  // Delete Contact
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Supprimer ce contact ?')) return;
    await PropertyService.deleteContact(contactId);
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== contactId),
    }));
    showToast('Contact supprimé', 'info');
  };

  // Toggle Contact Active
  const handleToggleContactActive = async (contactId: string, current: boolean) => {
    await PropertyService.updateContact(contactId, { active: !current });
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) => (c.id === contactId ? { ...c, active: !current } : c)),
    }));
  };

  // Add Feature
  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureLabel || !newFeatureValue) return;

    const added = await PropertyService.addFeature({
      label: newFeatureLabel,
      value: newFeatureValue,
      icon: newFeatureIcon,
    });

    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, added],
    }));

    setNewFeatureLabel('');
    setNewFeatureValue('');
    showToast('Caractéristique ajoutée', 'success');
  };

  // Delete Feature
  const handleDeleteFeature = async (featId: string) => {
    await PropertyService.deleteFeature(featId);
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featId),
    }));
    showToast('Caractéristique supprimée', 'info');
  };

  // Update Feature
  const handleUpdateFeature = async (featId: string, updates: Partial<PropertyFeature>) => {
    await PropertyService.updateFeature(featId, updates);
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === featId ? { ...f, ...updates } : f)),
    }));
    showToast('Caractéristique mise à jour', 'success');
  };

  // Reset to seed
  const handleResetToSeed = async () => {
    if (confirm('Attention : réinitialiser toutes les données à leur état officiel initial ?')) {
      const resetData = await PropertyService.resetToSeed();
      setFormData(resetData);
      onPropertyUpdated(resetData);
      showToast('Données réinitialisées au seed officiel initial', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-5xl my-auto overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Header */}
        <div className="bg-neutral-900 dark:bg-neutral-950 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Administration Dynamique du Bien
              </h2>
              <p className="text-2xs text-neutral-400">
                Gestionnaire de vente • {property.title} ({PropertyService.formatPrice(property.price, property.currency)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Login View */
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Espace Vendeur & Administrateur</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Accès réservé à Abdou KAMARA et aux ayants droit de Fatou Ba.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifiant Input */}
              <div>
                <label className="block text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Identifiant administrateur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Entrez votre identifiant"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Mot de passe Input */}
              <div>
                <label className="block text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Se connecter à l'administration</span>
              </button>

              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-2xs text-neutral-600 dark:text-neutral-400 text-center">
                🔒 Accès strictement sécurisé réservé à l'administrateur mandataire.
              </div>
            </form>
          </div>
        ) : (
          /* Admin Navigation & Tabs */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 transition-colors">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Statistiques</span>
              </button>

              <button
                onClick={() => setActiveTab('partnerships')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'partnerships'
                    ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                <Handshake className="w-4 h-4 text-emerald-400" />
                <span>Partenariats Vendeurs (12%)</span>
              </button>

              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'general'
                    ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Prix & Informations</span>
              </button>

              <button
                onClick={() => setActiveTab('location')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'location'
                    ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>GPS & Localisation</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Photos & TikTok ({formData.media.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'contacts'
                    ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp & Vendeur</span>
              </button>

              <button
                onClick={() => setActiveTab('features')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'features'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-200/70'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Caractéristiques ({formData.features.length})</span>
              </button>

              <div className="hidden md:block mt-auto pt-4 border-t border-neutral-200">
                <button
                  onClick={handleResetToSeed}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-2xs font-semibold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Restaurer données initiales"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser seed</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* TAB 1: ANALYTICS DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tableau de bord de performance</h3>
                    <p className="text-xs text-neutral-500">
                      Suivi en temps réel des consultations et conversions WhatsApp du bien.
                    </p>
                  </div>

                  {/* Quick Partnership & PDF Contracts Action Banner */}
                  <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Handshake className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                          <span>Partenariats Vendeurs & Contrats de Mandat (12%)</span>
                        </h4>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300 mt-0.5">
                          Consultez les dossiers reçus sous 48h et générez les contrats officiels PDF avec commission standard de 12%.
                        </p>
                      </div>
                    </div>
                    <button
                      id="btn-overview-manage-partnerships"
                      onClick={() => setActiveTab('partnerships')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shrink-0 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Gérer & Générer Contrats PDF</span>
                    </button>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                      <span className="text-xs font-semibold text-neutral-500">👁️ Vues de la page</span>
                      <p className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                        {analyticsData?.page_views || 1245}
                      </p>
                      <span className="text-2xs text-emerald-600 font-medium">Trafic direct & partagé</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <span className="text-xs font-semibold text-emerald-800">💬 Clics WhatsApp</span>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
                        {analyticsData?.whatsapp_clicks || 87}
                      </p>
                      <span className="text-2xs text-emerald-700 font-medium">Prises de contact directes</span>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                      <span className="text-xs font-semibold text-neutral-500">🗺️ Clics Google Maps</span>
                      <p className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                        {analyticsData?.map_clicks || 42}
                      </p>
                      <span className="text-2xs text-neutral-500 font-medium">Recherches d'itinéraire</span>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                      <span className="text-xs font-semibold text-neutral-500">🎥 Clics TikTok</span>
                      <p className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                        {analyticsData?.tiktok_clicks || 63}
                      </p>
                      <span className="text-2xs text-neutral-500 font-medium">Vidéos consultées</span>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                      <span className="text-xs font-semibold text-neutral-500">🖼️ Vues Galerie</span>
                      <p className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                        {analyticsData?.gallery_views || 310}
                      </p>
                      <span className="text-2xs text-neutral-500 font-medium">Photos ouvertes en grand</span>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                      <span className="text-xs font-semibold text-neutral-500">🔗 Partages du lien</span>
                      <p className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                        {analyticsData?.share_clicks || 18}
                      </p>
                      <span className="text-2xs text-neutral-500 font-medium">Recommandations</span>
                    </div>
                  </div>

                  {/* Recent Activity Log */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Dernières interactions enregistrées (temps réel)
                    </h4>
                    <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto text-xs">
                      {analyticsData?.recent_events.map((evt) => (
                        <div key={evt.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-semibold text-neutral-800">
                              {evt.event_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-neutral-400 font-mono text-2xs">
                            {new Date(evt.created_at).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1.5: PARTNERSHIP APPLICATIONS REVIEW & 12% CONTRACTS */}
              {activeTab === 'partnerships' && (
                <AdminPartnershipsTab />
              )}

              {/* TAB 2: GENERAL PROPERTY EDIT */}
              {activeTab === 'general' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        Informations générales & Prix
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Chaque modification sera immédiatement visible sur la page publique.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveProperty}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Titre du bien
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Statut commercial
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as any })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold"
                      >
                        <option value="available">🟢 À vendre (Disponible)</option>
                        <option value="reserved">🟠 Réservée</option>
                        <option value="sold">🔴 Vendue</option>
                        <option value="unpublished">⚪ Non publié (Brouillon)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Prix (en FCFA) — Ex: 55000000
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold text-emerald-700"
                      />
                      <p className="text-2xs text-neutral-500 mt-1">
                        Affichage public :{' '}
                        <strong>{PropertyService.formatPrice(formData.price, formData.currency)}</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Superficie (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.surface}
                        onChange={(e) =>
                          setFormData({ ...formData, surface: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Description détaillée du bien
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm leading-relaxed"
                    />
                  </div>

                  {/* Distinction Propriétaires vs Vendeur */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                    <div>
                      <label className="block text-xs font-bold text-amber-800 mb-1">
                        Propriétaires (Succession / Titre)
                      </label>
                      <input
                        type="text"
                        value={formData.owners[0]?.name || ''}
                        onChange={(e) => {
                          const updatedOwners = [...formData.owners];
                          if (updatedOwners[0]) {
                            updatedOwners[0].name = e.target.value;
                          } else {
                            updatedOwners[0] = {
                              id: 'owner-01',
                              name: e.target.value,
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString(),
                            };
                          }
                          setFormData({ ...formData, owners: updatedOwners });
                        }}
                        placeholder="Ex: Descendants de Fatou Ba"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-800 mb-1">
                        Mandataire officiel
                      </label>
                      <input
                        type="text"
                        value={formData.seller.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seller: { ...formData.seller, name: e.target.value },
                          })
                        }
                        placeholder="Ex: Mr KAMARA"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOCATION & GPS PICKER */}
              {activeTab === 'location' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        Géolocalisation & Carte Interactive
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Cliquez sur la carte ou déplacez le marqueur pour définir les coordonnées GPS exactes.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveProperty}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Ville / Région
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Quartier / Repère
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        placeholder="Ex: Près de la grande voie"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Latitude GPS
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            latitude: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Longitude GPS
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Verification Checkbox */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.location_verified}
                      onChange={(e) =>
                        setFormData({ ...formData, location_verified: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-neutral-900">
                        Position GPS validée et vérifiée
                      </span>
                      <p className="text-neutral-500">
                        Si décoché, un badge d'avertissement "Position géographique à confirmer" apparaîtra sur la page publique.
                      </p>
                    </div>
                  </label>

                  {/* Interactive Leaflet Picker Map */}
                  <div className="rounded-2xl overflow-hidden border border-neutral-300 shadow-inner h-64 sm:h-72">
                    <div ref={adminMapContainerRef} className="w-full h-full" />
                  </div>
                </div>
              )}

              {/* TAB 4: PHOTOS & MEDIA */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Gestion des Photos & Vidéos</h3>
                    <p className="text-xs text-neutral-500">
                      Uploadez les vraies photos de la maison ou ajoutez des vidéos TikTok.
                    </p>
                  </div>

                  {/* Upload Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Direct File Upload */}
                    <div className="bg-emerald-50/60 border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                      <h4 className="text-xs font-bold text-emerald-950">
                        Uploader des photos depuis votre appareil
                      </h4>
                      <p className="text-2xs text-emerald-700 mt-1 mb-3">
                        Sélectionnez une ou plusieurs photos (JPG, PNG, WebP)
                      </p>
                      <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors">
                        <span>Choisir les fichiers...</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Add URL (Image or TikTok) */}
                    <form
                      onSubmit={handleAddMediaByUrl}
                      className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-neutral-800">Ajouter via une URL</h4>
                        <div className="flex gap-2 text-2xs">
                          <button
                            type="button"
                            onClick={() => setNewMediaType('image')}
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              newMediaType === 'image'
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewMediaType('tiktok')}
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              newMediaType === 'tiktok'
                                ? 'bg-rose-600 text-white'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            TikTok
                          </button>
                        </div>
                      </div>

                      <input
                        type="url"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        placeholder={
                          newMediaType === 'tiktok'
                            ? 'https://www.tiktok.com/@.../video/...'
                            : 'https://images.unsplash.com/...'
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300"
                      />

                      <input
                        type="text"
                        value={newMediaTitle}
                        onChange={(e) => setNewMediaTitle(e.target.value)}
                        placeholder="Titre (ex: Façade, Intérieur, Chambre)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300"
                      />

                      <button
                        type="submit"
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Ajouter à la liste
                      </button>
                    </form>
                  </div>

                  {/* List of current media */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Médias actuels ({formData.media.length})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formData.media.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs group"
                        >
                          <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                            {item.type === 'image' ? (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-900 text-white flex flex-col items-center justify-center p-4 text-center">
                                <Film className="w-8 h-8 text-rose-500 mb-1" />
                                <span className="text-xs font-bold">Vidéo TikTok</span>
                              </div>
                            )}

                            {item.featured && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-500 text-white shadow-xs">
                                Principale
                              </span>
                            )}

                            {!item.active && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-2xs font-bold bg-neutral-800/80 text-white backdrop-blur-xs">
                                Désactivé
                              </span>
                            )}
                          </div>

                          <div className="p-3 space-y-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  media: prev.media.map((m) =>
                                    m.id === item.id ? { ...m, title: newTitle } : m
                                  ),
                                }));
                              }}
                              onBlur={(e) => handleUpdateMediaTitle(item.id, e.target.value)}
                              placeholder="Titre de la photo (ex: Façade, Salon...)"
                              className="w-full text-xs font-bold text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden py-0.5"
                              title="Cliquez pour modifier le titre"
                            />

                            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-2xs">
                              {item.type === 'image' && (
                                <button
                                  onClick={() => handleToggleFeaturedMedia(item.id)}
                                  className={`flex items-center gap-1 font-semibold ${
                                    item.featured ? 'text-emerald-600' : 'text-neutral-500 hover:text-neutral-800'
                                  }`}
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{item.featured ? 'Photo clé' : 'Définir clé'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleMediaActive(item.id, item.active)}
                                className="text-neutral-600 hover:text-neutral-900 font-medium"
                              >
                                {item.active ? 'Masquer' : 'Afficher'}
                              </button>

                              <button
                                onClick={() => handleDeleteMedia(item.id)}
                                className="text-rose-600 hover:text-rose-800"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CONTACTS & WHATSAPP */}
              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Gestion des Lignes WhatsApp & Contacts
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Activez, désactivez ou ajoutez des numéros pour le mandataire Mr KAMARA.
                    </p>
                  </div>

                  {/* Add Contact Form */}
                  <form
                    onSubmit={handleAddContact}
                    className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Numéro (avec code +221)
                      </label>
                      <input
                        type="text"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="+221774125797"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Libellé
                      </label>
                      <input
                        type="text"
                        value={newContactLabel}
                        onChange={(e) => setNewContactLabel(e.target.value)}
                        placeholder="WhatsApp Mr KAMARA Ligne 3"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Type
                      </label>
                      <select
                        value={newContactType}
                        onChange={(e) => setNewContactType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                      >
                        <option value="whatsapp">💬 WhatsApp</option>
                        <option value="phone">📞 Téléphone Appel</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      + Ajouter le contact
                    </button>
                  </form>

                  {/* Contacts List */}
                  <div className="space-y-3">
                    {formData.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5 fill-current" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-neutral-900">
                                {contact.label}
                              </span>
                              {contact.is_primary && (
                                <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-emerald-100 text-emerald-800">
                                  Prioritaire
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-neutral-500">{contact.value}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleContactActive(contact.id, contact.active)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              contact.active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {contact.active ? '🟢 Actif (affiché)' : '⚪ Inactif (masqué)'}
                          </button>

                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: DYNAMIC FEATURES */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Caractéristiques Dynamiques</h3>
                    <p className="text-xs text-neutral-500">
                      Ajoutez des éléments clés (Eau, Électricité, Chambres, Titre foncier...).
                    </p>
                  </div>

                  <form
                    onSubmit={handleAddFeature}
                    className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Intitulé
                      </label>
                      <input
                        type="text"
                        value={newFeatureLabel}
                        onChange={(e) => setNewFeatureLabel(e.target.value)}
                        placeholder="Ex: Titre foncier"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Valeur
                      </label>
                      <input
                        type="text"
                        value={newFeatureValue}
                        onChange={(e) => setNewFeatureValue(e.target.value)}
                        placeholder="Ex: En cours / Succession"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Icône
                      </label>
                      <select
                        value={newFeatureIcon}
                        onChange={(e) => setNewFeatureIcon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                      >
                        <option value="shield-check">Bouclier (Vérification)</option>
                        <option value="ruler">Règle (Mesure)</option>
                        <option value="home">Maison</option>
                        <option value="zap">Électricité (Zap)</option>
                        <option value="droplet">Eau (Goutte)</option>
                        <option value="map-pin">Localisation</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      + Ajouter
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.features.map((feat) => (
                      <div
                        key={feat.id}
                        className="bg-white border border-neutral-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-neutral-300 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={feat.label}
                            onChange={(e) => {
                              const newLabel = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                features: prev.features.map((f) =>
                                  f.id === feat.id ? { ...f, label: newLabel } : f
                                ),
                              }));
                            }}
                            onBlur={(e) => handleUpdateFeature(feat.id, { label: e.target.value })}
                            className="text-2xs text-neutral-500 uppercase font-bold border-b border-transparent hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden w-full py-0.5"
                            placeholder="Libellé"
                            title="Modifier le libellé"
                          />
                          <input
                            type="text"
                            value={feat.value}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                features: prev.features.map((f) =>
                                  f.id === feat.id ? { ...f, value: newVal } : f
                                ),
                              }));
                            }}
                            onBlur={(e) => handleUpdateFeature(feat.id, { value: e.target.value })}
                            className="text-sm font-bold text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden w-full py-0.5"
                            placeholder="Valeur"
                            title="Modifier la valeur"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteFeature(feat.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
                          title="Supprimer cette caractéristique"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
