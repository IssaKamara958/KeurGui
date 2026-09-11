# 🏠 Application Immobilière Dynamique — Maison à Vendre (55 000 000 FCFA)

Application web immobilière Full-Stack moderne, ultra-rapide et **100 % dynamique** pour la vente d'une maison au Sénégal (Superficie : 600 m², Prix officiel : 55 000 000 FCFA).

---

## 📋 Spécifications Métier Clés

- **Titre du bien** : Maison à vendre
- **Prix officiel** : **55 000 000 FCFA** *(affichage sans abréviation)*
- **Superficie** : 600 m²
- **Localisation** : Thiès / Région de Thiès
- **Propriétaires légitimes** : Descendants de Fatou Ba
- **Mandataire** : Mr KAMARA
- **Contacts WhatsApp officiels** :
  - Ligne principale : `+221774125797`
  - Ligne secondaire : `+221776828441`
- **Développeur** : Chackor Organisation
- **Géolocalisation** : Carte Leaflet (OpenStreetMap) avec géocodage interactif et lien Google Maps dynamique
- **Vidéos** : Intégration et gestion des capsules vidéo TikTok
- **Analytics en temps réel** : Suivi des vues, clics WhatsApp, Maps, partages et galerie

---

## 🚀 Architecture Full-Stack

L'application a été conçue pour être **100 % dynamique** : aucune information métier n'est codée en dur dans le JSX. Si le vendeur ou l'administrateur modifie le prix, les numéros, les photos, le statut ou la localisation dans le tableau de bord, la page publique s'actualise immédiatement.

```
                  VISITEUR
                     │
                     ▼
          ┌──────────────────────┐
          │   FRONTEND REACT     │
          │ Tailwind CSS + Vite  │
          │ Leaflet + TypeScript │
          └──────────┬───────────┘
                     │
               REST API / JSON
                     │
                     ▼
          ┌──────────────────────┐
          │   BACKEND EXPRESS    │
          │   Node.js / tsx      │
          │  /api/property       │
          │  /api/analytics      │
          └──────────┬───────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
PostgreSQL      Supabase Storage  Analytics Events
/ Supabase      / Local Uploads
```

---

## 🗄️ Schéma PostgreSQL & Supabase

Les scripts complets avec **Row Level Security (RLS)** sont disponibles dans le dossier `/supabase` :
- `supabase/schema.sql` : Tables `properties`, `owners`, `sellers`, `contacts`, `property_media`, `property_features`, `analytics_events`, index et politiques de sécurité RLS.
- `supabase/seed.sql` : Données de démarrage officielles prêtes à l'emploi.

---

## 🔑 Accès à l'Administration

1. Cliquez sur le bouton **Administration** dans l'en-tête ou le pied de page du site.
2. Renseignez les identifiants administrateur stricts et exclusifs :
   - **Identifiant** : `AbdouKamara`
   - **Mot de passe** : `Bayesack01.`
3. Seul l'administrateur avec ces informations exactes peut se connecter pour :
   - **Modifier le prix** en direct (ex: 60 000 000 FCFA)
   - **Déplacer le marqueur GPS** sur la carte Leaflet et valider la position
   - **Uploader des vraies photos** depuis votre téléphone ou ordinateur
   - **Activer ou désactiver des lignes WhatsApp** (le bouton public se met à jour automatiquement)
   - **Ajouter des capsules vidéo TikTok**
   - **Consulter les statistiques** de clics et de vues en direct

---

## 🛠️ Commandes de Développement & Production

```bash
# Démarrer le serveur full-stack de développement (Port 3000)
npm run dev

# Compiler l'application pour la production
npm run build

# Démarrer en production
npm run start
```
