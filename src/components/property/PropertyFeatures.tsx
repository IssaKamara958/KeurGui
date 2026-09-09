import React from 'react';
import { Property, PropertyFeature } from '../../types';
import {
  Ruler,
  Home,
  ShieldCheck,
  UserCheck,
  Zap,
  MapPin,
  FileText,
  Droplet,
  CheckCircle,
  Building,
  KeyRound,
  Users,
} from 'lucide-react';

interface PropertyFeaturesProps {
  property: Property;
}

export const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({ property }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ruler':
        return <Ruler className="w-5 h-5 text-emerald-600" />;
      case 'home':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'user-check':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'droplets':
      case 'droplet':
        return <Droplet className="w-5 h-5 text-sky-500" />;
      case 'file-text':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'map-pin':
        return <MapPin className="w-5 h-5 text-rose-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  const activeFeatures = property.features.filter((f) => f.active);

  return (
    <div className="space-y-8">
      {/* Distinction Propriétaires vs Vendeur (exigence clé du cahier des charges) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Propriétaires */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Propriétaires légitimes
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">
                {property.owners[0]?.name || 'Descendants de Fatou Ba'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                {property.owners[0]?.description || 'Propriété familiale et succession légale en règle.'}
              </p>
            </div>
          </div>
        </div>

        {/* Vendeur Mandataire */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Vendeur officiel mandaté
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">
                {property.seller?.name || 'Abdou KAMARA'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                {property.seller?.description || 'Interlocuteur direct pour toute visite et négociation.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description du bien */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>Description détaillée du bien</span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
          {property.description ||
            "Opportunité immobilière rare : maison à vendre d'une superficie de 25 m², vendue par la succession des Descendants de Fatou Ba au prix de 55 000 000 FCFA. Contactez directement Abdou KAMARA pour organiser une visite."}
        </p>
      </div>

      {/* Caractéristiques dynamiques */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-600" />
          <span>Caractéristiques & équipements ({activeFeatures.length})</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeFeatures.map((feat) => (
            <div
              key={feat.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 font-medium">{feat.label}</span>
                <div className="p-1.5 rounded-lg bg-neutral-50">{getIcon(feat.icon)}</div>
              </div>
              <p className="text-sm sm:text-base font-bold text-neutral-900">{feat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
