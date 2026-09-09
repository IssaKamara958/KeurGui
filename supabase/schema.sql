-- ==============================================================================
-- APPLICATION IMMOBILIÈRE DYNAMIQUE : MAISON À VENDRE (55 000 000 FCFA)
-- SCHÉMA POSTGRESQL AVEC ROW LEVEL SECURITY (RLS) & STORAGE
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: OWNERS (Propriétaires légitimes / Ayants droit)
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: SELLERS (Vendeurs mandataires)
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: PROPERTIES (Biens immobiliers)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'XOF',
    surface NUMERIC NOT NULL,
    unit VARCHAR(10) DEFAULT 'm²',
    property_type VARCHAR(50) DEFAULT 'house',
    status VARCHAR(30) DEFAULT 'available', -- 'available', 'reserved', 'sold', 'unpublished'
    country TEXT DEFAULT 'Sénégal',
    city TEXT DEFAULT 'Thiès',
    neighborhood TEXT,
    address TEXT,
    landmark TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Relations: PROPERTY_OWNERS
CREATE TABLE IF NOT EXISTS public.property_owners (
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, owner_id)
);

-- 5. Relations: PROPERTY_SELLERS
CREATE TABLE IF NOT EXISTS public.property_sellers (
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, seller_id)
);

-- 6. Table: CONTACTS (Lignes WhatsApp et téléphone direct)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'whatsapp', -- 'whatsapp', 'phone', 'email'
    value TEXT NOT NULL, -- Format international: +221774125797
    label TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: PROPERTY_MEDIA (Photos, Vidéos, Liens TikTok)
CREATE TABLE IF NOT EXISTS public.property_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'image', -- 'image', 'video', 'tiktok'
    url TEXT NOT NULL,
    storage_path TEXT,
    title TEXT,
    alt_text TEXT,
    display_order INT DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: PROPERTY_FEATURES (Caractéristiques dynamiques du bien)
CREATE TABLE IF NOT EXISTS public.property_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'check',
    display_order INT DEFAULT 1,
    active BOOLEAN DEFAULT TRUE
);

-- 9. Table: ANALYTICS_EVENTS (Traçabilité des interactions sans données privées)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'whatsapp_click', 'phone_click', 'map_click', 'share_click', 'tiktok_click', 'gallery_view'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_property_media_property_id ON public.property_media(property_id);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON public.contacts(active);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Politiques Publiques (Lecture seule pour visiteurs)
CREATE POLICY "Public can read published properties"
    ON public.properties FOR SELECT
    USING (is_published = true);

CREATE POLICY "Public can read active media"
    ON public.property_media FOR SELECT
    USING (active = true);

CREATE POLICY "Public can read active contacts"
    ON public.contacts FOR SELECT
    USING (active = true);

CREATE POLICY "Public can read active features"
    ON public.property_features FOR SELECT
    USING (active = true);

CREATE POLICY "Public can read owners"
    ON public.owners FOR SELECT
    USING (true);

CREATE POLICY "Public can read sellers"
    ON public.sellers FOR SELECT
    USING (true);

-- Insertion anonyme autorisée pour les analytics
CREATE POLICY "Public can insert analytics events"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- Politiques Administrateurs (CRUD complet pour utilisateurs authentifiés)
CREATE POLICY "Admins have full access to properties"
    ON public.properties FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins have full access to media"
    ON public.property_media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins have full access to contacts"
    ON public.contacts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins have full access to features"
    ON public.property_features FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins have full access to analytics"
    ON public.analytics_events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-media', 'property-media', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'property-media');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-media');
