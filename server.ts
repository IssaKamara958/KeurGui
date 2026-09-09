import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PROPERTY_DATA } from './src/data/initialData';
import { FullPropertyData, PropertyMedia, Contact, PropertyFeature, AnalyticsEvent } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'property.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory / persisted storage
let dbData: FullPropertyData;

function loadDatabase(): FullPropertyData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (parsed && parsed.property) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read from db file, falling back to initial data:', err);
  }
  // Initialize with seed data and write to file
  dbData = JSON.parse(JSON.stringify(INITIAL_PROPERTY_DATA));
  saveDatabase(dbData);
  return dbData;
}

function saveDatabase(data: FullPropertyData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save to database file:', err);
  }
}

dbData = loadDatabase();

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS and Cache-control for APIs
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  });

  // 1. Health check endpoint (as specified in the architecture guide)
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'maison-a-vendre-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Main property endpoint: GET
  app.get('/api/property', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: dbData.property,
      analyticsSummary: {
        page_views: dbData.analytics.page_views,
        whatsapp_clicks: dbData.analytics.whatsapp_clicks,
        phone_clicks: dbData.analytics.phone_clicks,
        map_clicks: dbData.analytics.map_clicks,
        share_clicks: dbData.analytics.share_clicks,
        tiktok_clicks: dbData.analytics.tiktok_clicks,
        gallery_views: dbData.analytics.gallery_views,
        total_interactions: dbData.analytics.total_interactions,
      },
    });
  });

  // 3. Property update endpoint: PUT
  app.put('/api/property', (req: Request, res: Response) => {
    const updates = req.body;
    dbData.property = {
      ...dbData.property,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(dbData);
    res.json({
      success: true,
      message: 'Propriété mise à jour avec succès',
      data: dbData.property,
    });
  });

  // 4. Media endpoints
  app.post('/api/media', (req: Request, res: Response) => {
    const newMedia: PropertyMedia = {
      id: `media-${Date.now()}`,
      property_id: dbData.property.id,
      type: req.body.type || 'image',
      url: req.body.url || '',
      title: req.body.title || 'Photo du bien',
      alt_text: req.body.alt_text || 'Photo maison à vendre',
      display_order: dbData.property.media.length + 1,
      featured: req.body.featured || false,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (newMedia.featured) {
      dbData.property.media.forEach((m) => (m.featured = false));
      dbData.property.og_image = newMedia.url;
    }

    dbData.property.media.push(newMedia);
    saveDatabase(dbData);
    res.status(201).json({ success: true, data: newMedia });
  });

  app.put('/api/media/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dbData.property.media.findIndex((m) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Média introuvable' });
    }

    const updated = {
      ...dbData.property.media[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    if (updated.featured) {
      dbData.property.media.forEach((m) => (m.featured = false));
      dbData.property.og_image = updated.url;
    }

    dbData.property.media[index] = updated;
    saveDatabase(dbData);
    res.json({ success: true, data: updated });
  });

  app.delete('/api/media/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    dbData.property.media = dbData.property.media.filter((m) => m.id !== id);
    saveDatabase(dbData);
    res.json({ success: true, message: 'Média supprimé' });
  });

  // 5. Contacts endpoints
  app.post('/api/contacts', (req: Request, res: Response) => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      seller_id: dbData.property.seller.id,
      type: req.body.type || 'whatsapp',
      value: req.body.value,
      label: req.body.label || 'Contact',
      is_primary: req.body.is_primary || false,
      active: req.body.active !== undefined ? req.body.active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (newContact.is_primary) {
      dbData.property.contacts.forEach((c) => (c.is_primary = false));
    }

    dbData.property.contacts.push(newContact);
    saveDatabase(dbData);
    res.status(201).json({ success: true, data: newContact });
  });

  app.put('/api/contacts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dbData.property.contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Contact introuvable' });
    }

    const updated = {
      ...dbData.property.contacts[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    if (updated.is_primary) {
      dbData.property.contacts.forEach((c) => (c.is_primary = false));
      updated.is_primary = true;
    }

    dbData.property.contacts[index] = updated;
    saveDatabase(dbData);
    res.json({ success: true, data: updated });
  });

  app.delete('/api/contacts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    dbData.property.contacts = dbData.property.contacts.filter((c) => c.id !== id);
    saveDatabase(dbData);
    res.json({ success: true, message: 'Contact supprimé' });
  });

  // 6. Features endpoints
  app.post('/api/features', (req: Request, res: Response) => {
    const newFeature: PropertyFeature = {
      id: `feat-${Date.now()}`,
      property_id: dbData.property.id,
      label: req.body.label,
      value: req.body.value,
      icon: req.body.icon || 'shield-check',
      display_order: dbData.property.features.length + 1,
      active: req.body.active !== undefined ? req.body.active : true,
    };
    dbData.property.features.push(newFeature);
    saveDatabase(dbData);
    res.status(201).json({ success: true, data: newFeature });
  });

  app.put('/api/features/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dbData.property.features.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Caractéristique introuvable' });
    }
    dbData.property.features[index] = {
      ...dbData.property.features[index],
      ...req.body,
    };
    saveDatabase(dbData);
    res.json({ success: true, data: dbData.property.features[index] });
  });

  app.delete('/api/features/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    dbData.property.features = dbData.property.features.filter((f) => f.id !== id);
    saveDatabase(dbData);
    res.json({ success: true, message: 'Caractéristique supprimée' });
  });

  // 7. Analytics event tracking endpoint
  app.post('/api/analytics', (req: Request, res: Response) => {
    const { event_type, metadata } = req.body;
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}`,
      property_id: dbData.property.id,
      event_type,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    // Increment corresponding counter
    switch (event_type) {
      case 'page_view':
        dbData.analytics.page_views += 1;
        break;
      case 'whatsapp_click':
        dbData.analytics.whatsapp_clicks += 1;
        dbData.analytics.total_interactions += 1;
        break;
      case 'phone_click':
        dbData.analytics.phone_clicks += 1;
        dbData.analytics.total_interactions += 1;
        break;
      case 'map_click':
        dbData.analytics.map_clicks += 1;
        dbData.analytics.total_interactions += 1;
        break;
      case 'share_click':
        dbData.analytics.share_clicks += 1;
        dbData.analytics.total_interactions += 1;
        break;
      case 'tiktok_click':
        dbData.analytics.tiktok_clicks += 1;
        dbData.analytics.total_interactions += 1;
        break;
      case 'gallery_view':
        dbData.analytics.gallery_views += 1;
        break;
    }

    dbData.analytics.recent_events.unshift(event);
    if (dbData.analytics.recent_events.length > 50) {
      dbData.analytics.recent_events.pop();
    }

    saveDatabase(dbData);
    res.status(201).json({ success: true, event });
  });

  app.get('/api/analytics', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: dbData.analytics,
    });
  });

  // 8. Admin login validation (Strict exact credentials)
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === 'AbdouKamara' && password === 'Bayesack01.') {
      res.json({
        success: true,
        token: `adm_${Date.now()}_auth_token`,
        user: { name: 'Abdou KAMARA', role: 'admin' },
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Identifiant ou mot de passe incorrect. Accès strictement réservé à l’administrateur.',
      });
    }
  });

  // 9. Reset to default initial seed
  app.post('/api/admin/reset', (req: Request, res: Response) => {
    dbData = JSON.parse(JSON.stringify(INITIAL_PROPERTY_DATA));
    saveDatabase(dbData);
    res.json({ success: true, message: 'Données réinitialisées avec succès', data: dbData.property });
  });

  // Vite middleware for development or Static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
