import { INITIAL_PROPERTY_DATA } from '../data/initialData';
import { Property, PropertyMedia, Contact, PropertyFeature } from '../types';

const STORAGE_KEY = 'maison_a_vendre_property_v3';

function sanitizeProperty(property: Property): Property {
  if (property) {
    if (!property.title || property.title === 'Maison à vendre') {
      property.title = 'Keur Mame Fatou';
    }
    if (property.features) {
      property.features = property.features.map((feat) => {
        if ((feat.id === 'feat-01' || feat.label.toLowerCase() === 'superficie') && (feat.value === '25 m²' || feat.value === '25')) {
          return { ...feat, value: '600 m²' };
        }
        return feat;
      });
    }
  }
  return property;
}

export class PropertyService {
  private static localData: Property | null = null;

  // Format currency rigorously: "55 000 000 FCFA" (no abbreviation like 55M)
  public static formatPrice(amount: number, currency: string = 'FCFA'): string {
    if (!amount && amount !== 0) return 'Prix sur demande';
    const formatted = new Intl.NumberFormat('fr-FR').format(amount);
    return `${formatted} ${currency}`;
  }

  // Generate WhatsApp clean link without '+'
  public static cleanPhoneForWhatsApp(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  // Generate automated message as requested in specification
  public static buildWhatsAppMessage(property: Property, contactLabel?: string): string {
    const sellerGreeting = property.seller?.name ? `Bonjour ${property.seller.name}` : 'Bonjour';
    const formattedPrice = this.formatPrice(property.price, property.currency);
    const surfaceText = property.surface ? `${property.surface} ${property.unit || 'm²'}` : '';

    return `${sellerGreeting},

Je suis intéressé(e) par la maison à vendre : "${property.title}"
Prix affiché : ${formattedPrice}${surfaceText ? `\nSurface : ${surfaceText}` : ''}

J'ai consulté votre annonce et je souhaiterais avoir plus d'informations concernant le bien et éventuellement organiser une visite.

Merci.`;
  }

  // Build full wa.me link
  public static getWhatsAppUrl(phone: string, property: Property): string {
    const cleanNumber = this.cleanPhoneForWhatsApp(phone);
    const message = this.buildWhatsAppMessage(property);
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }

  // Build dynamic Google Maps URL (never hardcoded)
  public static getGoogleMapsUrl(latitude: number | null, longitude: number | null): string | null {
    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      return null;
    }
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  // Load property from API with local cache fallback
  public static async getProperty(): Promise<Property> {
    try {
      const response = await fetch('/api/property');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const sanitized = sanitizeProperty(json.data);
          this.localData = sanitized;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          } catch (e) {
            // ignore localStorage quota errors
          }
          return sanitized;
        }
      }
    } catch (err) {
      console.warn('API call failed, reading from storage or initial seed:', err);
    }

    // Fallback from localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = sanitizeProperty(JSON.parse(cached));
        this.localData = parsed;
        return parsed;
      }
    } catch (e) {
      // ignore
    }

    // Default fallback
    this.localData = sanitizeProperty(JSON.parse(JSON.stringify(INITIAL_PROPERTY_DATA.property)));
    return this.localData as Property;
  }

  // Update property
  public static async updateProperty(updates: Partial<Property>): Promise<Property> {
    try {
      const response = await fetch('/api/property', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          this.localData = json.data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          window.dispatchEvent(new CustomEvent('property_updated', { detail: json.data }));
          return json.data;
        }
      }
    } catch (err) {
      console.error('API update failed:', err);
    }

    // Fallback local update
    const current = this.localData || (await this.getProperty());
    const updated: Property = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.localData = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('property_updated', { detail: updated }));
    return updated;
  }

  // Media methods
  public static async addMedia(media: Partial<PropertyMedia>): Promise<PropertyMedia> {
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media),
      });
      if (response.ok) {
        const json = await response.json();
        await this.getProperty(); // refresh
        window.dispatchEvent(new CustomEvent('property_updated'));
        return json.data;
      }
    } catch (err) {
      console.error('Failed to add media:', err);
    }

    // Fallback local
    const prop = this.localData || (await this.getProperty());
    const newMedia: PropertyMedia = {
      id: `media-${Date.now()}`,
      property_id: prop.id,
      type: media.type || 'image',
      url: media.url || '',
      title: media.title || 'Photo du bien',
      alt_text: media.alt_text || 'Photo maison à vendre',
      display_order: prop.media.length + 1,
      featured: media.featured || false,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (newMedia.featured) {
      prop.media.forEach((m) => (m.featured = false));
      prop.og_image = newMedia.url;
    }
    prop.media.push(newMedia);
    await this.updateProperty({ media: prop.media, og_image: prop.og_image });
    return newMedia;
  }

  public static async deleteMedia(id: string): Promise<void> {
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    prop.media = prop.media.filter((m) => m.id !== id);
    await this.updateProperty({ media: prop.media });
  }

  public static async updateMedia(id: string, updates: Partial<PropertyMedia>): Promise<void> {
    try {
      await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    const idx = prop.media.findIndex((m) => m.id === id);
    if (idx !== -1) {
      prop.media[idx] = { ...prop.media[idx], ...updates };
      if (updates.featured) {
        prop.media.forEach((m, i) => {
          if (i !== idx) m.featured = false;
        });
        prop.og_image = prop.media[idx].url;
      }
      await this.updateProperty({ media: prop.media, og_image: prop.og_image });
    }
  }

  // Contact methods
  public static async addContact(contact: Partial<Contact>): Promise<Contact> {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        const json = await res.json();
        await this.getProperty();
        return json.data;
      }
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      seller_id: prop.seller?.id || 'seller-01',
      type: contact.type || 'whatsapp',
      value: contact.value || '',
      label: contact.label || 'Contact',
      is_primary: contact.is_primary || false,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    prop.contacts.push(newContact);
    await this.updateProperty({ contacts: prop.contacts });
    return newContact;
  }

  public static async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    try {
      await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    const idx = prop.contacts.findIndex((c) => c.id === id);
    if (idx !== -1) {
      prop.contacts[idx] = { ...prop.contacts[idx], ...updates };
      if (updates.is_primary) {
        prop.contacts.forEach((c, i) => {
          if (i !== idx) c.is_primary = false;
        });
      }
      await this.updateProperty({ contacts: prop.contacts });
    }
  }

  public static async deleteContact(id: string): Promise<void> {
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    prop.contacts = prop.contacts.filter((c) => c.id !== id);
    await this.updateProperty({ contacts: prop.contacts });
  }

  // Features methods
  public static async addFeature(feature: Partial<PropertyFeature>): Promise<PropertyFeature> {
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature),
      });
      if (res.ok) {
        const json = await res.json();
        await this.getProperty();
        return json.data;
      }
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    const newFeature: PropertyFeature = {
      id: `feat-${Date.now()}`,
      property_id: prop.id,
      label: feature.label || 'Caractéristique',
      value: feature.value || '',
      icon: feature.icon || 'shield-check',
      display_order: prop.features.length + 1,
      active: true,
    };
    prop.features.push(newFeature);
    await this.updateProperty({ features: prop.features });
    return newFeature;
  }

  public static async updateFeature(id: string, updates: Partial<PropertyFeature>): Promise<void> {
    try {
      await fetch(`/api/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    const idx = prop.features.findIndex((f) => f.id === id);
    if (idx !== -1) {
      prop.features[idx] = { ...prop.features[idx], ...updates };
      await this.updateProperty({ features: prop.features });
    }
  }

  public static async deleteFeature(id: string): Promise<void> {
    try {
      await fetch(`/api/features/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    const prop = this.localData || (await this.getProperty());
    prop.features = prop.features.filter((f) => f.id !== id);
    await this.updateProperty({ features: prop.features });
  }

  // Reset to initial seed
  public static async resetToSeed(): Promise<Property> {
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        this.localData = json.data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        window.dispatchEvent(new CustomEvent('property_updated', { detail: json.data }));
        return json.data;
      }
    } catch (err) {
      console.error(err);
    }
    this.localData = JSON.parse(JSON.stringify(INITIAL_PROPERTY_DATA.property));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localData));
    window.dispatchEvent(new CustomEvent('property_updated', { detail: this.localData }));
    return this.localData as Property;
  }
}
