-- ==============================================================================
-- INITIAL SEED DATA : MAISON À VENDRE (55 000 000 FCFA)
-- ==============================================================================

DO $$
DECLARE
    v_owner_id UUID;
    v_seller_id UUID;
    v_property_id UUID;
BEGIN
    -- 1. Insert Owner
    INSERT INTO public.owners (name, description)
    VALUES ('Descendants de Fatou Ba', 'Ayants droit et propriétaires légitimes de la parcelle et maison')
    RETURNING id INTO v_owner_id;

    -- 2. Insert Seller
    INSERT INTO public.sellers (name, email, phone, description)
    VALUES ('Abdou KAMARA', 'contact@kamara-immobilier.sn', '+221774125797', 'Vendeur mandataire officiel')
    RETURNING id INTO v_seller_id;

    -- 3. Insert Property
    INSERT INTO public.properties (
        title,
        slug,
        description,
        price,
        currency,
        surface,
        unit,
        property_type,
        status,
        country,
        city,
        neighborhood,
        address,
        landmark,
        latitude,
        longitude,
        location_verified,
        is_published,
        seo_title,
        seo_description,
        og_image
    )
    VALUES (
        'Maison à vendre',
        'maison-a-vendre',
        'Opportunité immobilière exceptionnelle au Sénégal. Maison à vendre d''une superficie de 25 m², issue de la succession des Descendants de Fatou Ba, proposée au prix officiel de 55 000 000 FCFA. Emplacement stratégique à fort potentiel. Vendeur officiel : Abdou KAMARA. Contact et visites directes via WhatsApp.',
        55000000,
        'FCFA',
        25,
        'm²',
        'Maison individuelle',
        'available',
        'Sénégal',
        'Thiès / Région de Dakar',
        'Quartier résidentiel',
        'Adresse exacte communiquée après premier échange téléphonique ou WhatsApp',
        'Axes principaux et commerces à proximité immédiate',
        14.7932,
        -16.9265,
        false,
        true,
        'Maison à vendre — 55 000 000 FCFA | Sénégal',
        'Maison à vendre au prix de 55 000 000 FCFA (25 m²). Propriétaires : Descendants de Fatou Ba. Vendeur : Abdou KAMARA. Contact WhatsApp direct.',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80'
    )
    RETURNING id INTO v_property_id;

    -- 4. Link Property & Owner
    INSERT INTO public.property_owners (property_id, owner_id)
    VALUES (v_property_id, v_owner_id);

    -- 5. Link Property & Seller
    INSERT INTO public.property_sellers (property_id, seller_id)
    VALUES (v_property_id, v_seller_id);

    -- 6. Insert Contacts
    INSERT INTO public.contacts (seller_id, type, value, label, is_primary, active)
    VALUES
        (v_seller_id, 'whatsapp', '+221774125797', 'WhatsApp principal (Abdou)', true, true),
        (v_seller_id, 'whatsapp', '+221776828441', 'WhatsApp secondaire', false, true),
        (v_seller_id, 'phone', '+221774125797', 'Appel direct', false, true);

    -- 7. Insert Initial Photos
    INSERT INTO public.property_media (property_id, type, url, title, alt_text, display_order, featured, active)
    VALUES
        (v_property_id, 'image', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', 'Façade extérieure', 'Façade de la maison à vendre', 1, true, true),
        (v_property_id, 'image', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'Vue d''ensemble', 'Vue générale de l''édifice', 2, false, true),
        (v_property_id, 'image', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Intérieur & potentiel', 'Potentiel d''aménagement', 3, false, true),
        (v_property_id, 'image', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'Environnement', 'Environnement immédiat', 4, false, true),
        (v_property_id, 'tiktok', 'https://www.tiktok.com/@senegal.immobilier/video/7345678901234567890', 'Visite vidéo de la maison', 'Présentation TikTok du bien', 5, false, true);

    -- 8. Insert Features
    INSERT INTO public.property_features (property_id, label, value, icon, display_order, active)
    VALUES
        (v_property_id, 'Superficie', '25 m²', 'ruler', 1, true),
        (v_property_id, 'Type de bien', 'Maison', 'home', 2, true),
        (v_property_id, 'Propriété successorale', 'Descendants de Fatou Ba', 'shield-check', 3, true),
        (v_property_id, 'Vendeur officiel', 'Abdou KAMARA', 'user-check', 4, true),
        (v_property_id, 'Viabilisation', 'Eau & Électricité accessibles', 'zap', 5, true),
        (v_property_id, 'Accès', 'Voie carrossable & commodités', 'map-pin', 6, true);

END $$;
