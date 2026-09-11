export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'unpublished';
export type MediaType = 'image' | 'video' | 'tiktok';
export type ContactType = 'whatsapp' | 'phone' | 'email';
export type AnalyticsEventType =
  | 'page_view'
  | 'whatsapp_click'
  | 'phone_click'
  | 'map_click'
  | 'share_click'
  | 'tiktok_click'
  | 'gallery_view';

export interface Owner {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  seller_id?: string;
  type: ContactType;
  value: string; // international format with +, e.g. +221774125797
  label: string;
  is_primary: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  type: MediaType;
  url: string;
  storage_path?: string;
  title: string;
  alt_text: string;
  display_order: number;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyFeature {
  id: string;
  property_id: string;
  label: string;
  value: string;
  icon: string;
  display_order: number;
  active: boolean;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  surface: number;
  unit: string;
  property_type: string;
  status: PropertyStatus;
  country: string;
  city: string;
  neighborhood: string;
  address: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  location_verified: boolean;
  is_published: boolean;
  published_at: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
  created_at: string;
  updated_at: string;

  // Joined relations for dynamic public view
  owners: Owner[];
  seller: Seller;
  contacts: Contact[];
  media: PropertyMedia[];
  features: PropertyFeature[];
}

export interface AnalyticsEvent {
  id: string;
  property_id: string;
  event_type: AnalyticsEventType;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsSummary {
  page_views: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  map_clicks: number;
  share_clicks: number;
  tiktok_clicks: number;
  gallery_views: number;
  total_interactions: number;
  recent_events: AnalyticsEvent[];
  timeline: { date: string; views: number; contacts: number }[];
}

export interface FullPropertyData {
  property: Property;
  analytics: AnalyticsSummary;
  partnerships?: PartnershipApplication[];
}

// ----------------------------------------------------
// Partnership Module Types (Vente Maisons & Terrains)
// ----------------------------------------------------

export type PartnershipPropertyType = 'maison' | 'terrain' | 'villa' | 'immeuble' | 'parcelle' | 'autre';
export type PartnershipRole = 'proprietaire' | 'mandataire' | 'ayant_droit' | 'promoteur';
export type PartnershipStatus = 'pending_review' | 'approved' | 'rejected' | 'more_info_needed';

export type DocumentType =
  | 'cni_recto'
  | 'cni_verso'
  | 'titre_foncier'
  | 'acte_notarie'
  | 'plan_cadastral'
  | 'photo_bien'
  | 'procuration'
  | 'autre';

export interface PartnershipDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string; // Base64 Data URL or public link
  uploaded_at: string;
  file_size?: string;
}

export interface PartnershipContract {
  contract_number: string;
  issued_at: string;
  status: 'draft' | 'validated' | 'active';
  commission_percentage: number; // Exactly 12%
  minimum_price: number;
  currency: string;
  partner_name: string;
  partner_role: string;
  partner_phone: string;
  partner_email?: string;
  partner_cni?: string;
  property_title: string;
  property_type: string;
  property_surface: string;
  property_location: string;
  terms: {
    commission_clause: string;
    exclusivity_and_mandate: string;
    authenticity_warranty: string;
    minimum_price_guarantee: string;
    duration_and_termination: string;
    jurisdiction: string;
  };
  admin_signature?: {
    signed_by: string;
    signed_at: string;
    role: string;
  };
}

export interface PartnershipApplication {
  id: string; // e.g. "PART-2026-1042"
  created_at: string;
  updated_at: string;
  status: PartnershipStatus;
  review_deadline_hours: number; // 48 hours
  reviewed_at?: string;
  review_notes?: string;
  rejection_reason?: string;

  // Applicant info
  applicant_role: PartnershipRole;
  owner_full_name: string;
  owner_phone: string;
  owner_email?: string;
  is_mandated: boolean;
  mandatary_name?: string;
  mandatary_phone?: string;
  mandatary_cin?: string;

  // Property info
  property_type: PartnershipPropertyType;
  title: string;
  description: string;
  surface: number;
  surface_unit: string; // 'm²' | 'ha'
  minimum_price: number; // Prix net vendeur requis par le mandataire/propriétaire
  estimated_commission: number; // 12% du prix minimum
  currency: string; // 'FCFA'

  // Location & GPS
  city: string;
  neighborhood: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;

  // Legal documentation details
  title_deed_type: 'titre_foncier' | 'bail' | 'deliberation' | 'acte_notarie' | 'jugement_succession' | 'autre';
  title_deed_number?: string;

  // Uploaded files & proofs (CNI recto/verso, plan, actes, photos propres)
  documents: PartnershipDocument[];

  // Generated official contract (when validated)
  contract?: PartnershipContract;
}
