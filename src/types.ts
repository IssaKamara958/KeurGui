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
}
