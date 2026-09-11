import { PartnershipApplication, PartnershipStatus, PartnershipContract } from '../types';
import { INITIAL_PARTNERSHIP_APPLICATIONS } from '../data/initialPartnerships';

const STORAGE_KEY = 'maison_a_vendre_partnerships_v1';

export class PartnershipService {
  private static localApplications: PartnershipApplication[] | null = null;

  /**
   * Calculate 12% commission precisely
   */
  public static calculateCommission(price: number): number {
    if (!price || isNaN(price) || price <= 0) return 0;
    return Math.round(price * 0.12);
  }

  /**
   * Format prices nicely in FCFA
   */
  public static formatPrice(amount: number, currency = 'FCFA'): string {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  }

  /**
   * Load all applications (from server API with localStorage fallback)
   */
  public static async getApplications(): Promise<PartnershipApplication[]> {
    try {
      const res = await fetch('/api/partnerships', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.localApplications = json.data;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          } catch (e) {
            // ignore localStorage quota errors
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Unable to reach /api/partnerships, falling back to cache/seed:', err);
    }

    // Try localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.localApplications = parsed;
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }

    // Fallback to seed data
    this.localApplications = JSON.parse(JSON.stringify(INITIAL_PARTNERSHIP_APPLICATIONS));
    return this.localApplications as PartnershipApplication[];
  }

  /**
   * Get single application by ID
   */
  public static async getApplicationById(id: string): Promise<PartnershipApplication | null> {
    const cleanId = id.trim().toUpperCase();
    try {
      const res = await fetch(`/api/partnerships/${cleanId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn(`Error fetching application ${cleanId}:`, err);
    }

    // Lookup in local cache
    const apps = await this.getApplications();
    const found = apps.find((a) => a.id.toUpperCase() === cleanId);
    return found || null;
  }

  /**
   * Submit new partnership application
   */
  public static async submitApplication(
    payload: Omit<PartnershipApplication, 'id' | 'created_at' | 'updated_at' | 'status' | 'review_deadline_hours' | 'estimated_commission'>
  ): Promise<PartnershipApplication> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `PART-${new Date().getFullYear()}-${randomSuffix}`;
    const calculatedCommission = this.calculateCommission(payload.minimum_price || 0);

    const newApplication: PartnershipApplication = {
      ...payload,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending_review',
      review_deadline_hours: 48,
      estimated_commission: calculatedCommission,
      currency: payload.currency || 'FCFA',
    };

    try {
      const res = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          await this.getApplications(); // refresh cache
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not post to /api/partnerships, saving locally:', err);
    }

    // Local fallback save
    const current = await this.getApplications();
    const updated = [newApplication, ...current];
    this.localApplications = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('partnerships_updated', { detail: newApplication }));
    return newApplication;
  }

  /**
   * Admin: update status (approve with generated contract or reject with reasons)
   */
  public static async updateStatus(
    id: string,
    status: PartnershipStatus,
    reviewNotes?: string,
    rejectionReason?: string
  ): Promise<PartnershipApplication> {
    const apps = await this.getApplications();
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Dossier introuvable');
    }

    const app = apps[index];
    const now = new Date().toISOString();

    let contract: PartnershipContract | undefined = app.contract;

    // If approving, generate or activate contract
    if (status === 'approved') {
      contract = this.generateContract(app);
    }

    const updated: PartnershipApplication = {
      ...app,
      status,
      reviewed_at: now,
      updated_at: now,
      review_notes: reviewNotes || app.review_notes,
      rejection_reason: status === 'rejected' || status === 'more_info_needed' ? rejectionReason : undefined,
      contract: status === 'approved' ? contract : app.contract,
    };

    try {
      const res = await fetch(`/api/partnerships/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          review_notes: reviewNotes,
          rejection_reason: rejectionReason,
          contract,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          await this.getApplications();
          window.dispatchEvent(new CustomEvent('partnerships_updated', { detail: json.data }));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API update failed, updating local state:', err);
    }

    // Local update
    apps[index] = updated;
    this.localApplications = [...apps];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localApplications));
    } catch (e) {
      // ignore
    }

    window.dispatchEvent(new CustomEvent('partnerships_updated', { detail: updated }));
    return updated;
  }

  /**
   * Delete an application
   */
  public static async deleteApplication(id: string): Promise<boolean> {
    try {
      await fetch(`/api/partnerships/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API delete error:', err);
    }

    const apps = await this.getApplications();
    const filtered = apps.filter((a) => a.id !== id);
    this.localApplications = filtered;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('partnerships_updated'));
    return true;
  }

  /**
   * Generate formal standard partnership contract
   */
  public static generateContract(application: PartnershipApplication): PartnershipContract {
    const formattedPrice = this.formatPrice(application.minimum_price, application.currency);
    const partnerDisplayName = application.is_mandated
      ? `${application.mandatary_name} (Mandataire légal pour ${application.owner_full_name})`
      : application.owner_full_name;

    return {
      contract_number: `CTR-${application.id.replace('PART-', '')}-12PCT`,
      issued_at: new Date().toISOString(),
      status: 'validated',
      commission_percentage: 12,
      minimum_price: application.minimum_price,
      currency: application.currency,
      partner_name: partnerDisplayName,
      partner_role: application.applicant_role,
      partner_phone: application.is_mandated ? (application.mandatary_phone || application.owner_phone) : application.owner_phone,
      partner_email: application.owner_email,
      partner_cni: application.mandatary_cin || 'CNI vérifiée au dossier',
      property_title: application.title,
      property_type: application.property_type.toUpperCase(),
      property_surface: `${application.surface} ${application.surface_unit}`,
      property_location: `${application.city}, ${application.neighborhood} (${application.address})`,
      terms: {
        commission_clause:
          `ARTICLE 1 — COMMISSION D'INTERMÉDIATION ET D'APPORT D'AFFAIRES (12%) : Il est expressément convenu entre les parties qu'une commission ferme et irrévocable de douze pour cent (12%) calculée sur le montant total effectif de la vente sera perçue et due de plein droit à l'administration de l'application si et seulement si la vente du bien immobilier désigné est réalisée à travers, ou initiée par le canal de la présente application.`,
        exclusivity_and_mandate:
          `ARTICLE 2 — MANDAT DE PROMOTION ET DIFFUSION : Le partenaire confère à la plateforme le mandat non exclusif de diffuser les caractéristiques, photographies et éléments descriptifs du bien sur ses canaux digitaux, réseaux sociaux et auprès de son réseau d'acquéreurs certifiés.`,
        authenticity_warranty:
          `ARTICLE 3 — GARANTIE D'AUTHENTICITÉ ET PIÈCES LÉGALES : Le partenaire garantit sur l'honneur l'exactitude de toutes les pièces fournies (Titre foncier, bail, délibération, actes de succession et copies recto-verso des pièces d'identité). Tout dol, omission ou fausse déclaration entraînera la caducité immédiate du présent contrat.`,
        minimum_price_guarantee:
          `ARTICLE 4 — PRIX NET VENDEUR MINIMUM REQUIS : Le prix minimum d'acceptation requis par le contractant est fixé à la somme de ${formattedPrice}. Aucune transaction en deçà de ce montant ne pourra être actée sans avenant écrit du mandataire ou propriétaire.`,
        duration_and_termination:
          `ARTICLE 5 — DURÉE : Le présent contrat est conclu pour une durée initiale de six (6) mois à compter de sa validation, renouvelable d'accord parties.`,
        jurisdiction:
          `ARTICLE 6 — DROIT APPLICABLE & LITIGES : Le présent contrat est soumis au droit de la République du Sénégal et aux règles de l'OHADA. En cas de différend non résolu à l'amiable, attribution de compétence est faite aux tribunaux compétents du ressort du lieu de situation de l'immeuble.`,
      },
      admin_signature: {
        signed_by: 'Abdou KAMARA',
        signed_at: new Date().toISOString(),
        role: 'Administrateur Général & Mandataire Immobilier',
      },
    };
  }
}
