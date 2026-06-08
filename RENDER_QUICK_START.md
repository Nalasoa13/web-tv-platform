# 🚀 Render - Démarrage Rapide

## En 5 Minutes sur Render

### 1. Créer un Compte Render

```
https://render.com → Sign up with GitHub
```

### 2. Uploader sur GitHub

```bash
cd web-tv-platform
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/web-tv-platform.git
git push -u origin main
```

### 3. Créer la Base de Données

1. Render Dashboard → New + → PostgreSQL
2. Name: `webtv-db`
3. Create Database
4. Copier la Connection String

### 4. Créer le Backend

1. Render Dashboard → New + → Web Service
2. Sélectionner votre repository
3. Name: `webtv-backend`
4. Build Command: `cd backend && npm install --legacy-peer-deps`
5. Start Command: `cd backend && npm start`
6. Ajouter les variables d'environnement:
   ```
   NODE_ENV=production
   DATABASE_URL=<votre-connection-string>
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=https://webtv-rua.onrender.com
   HLS_URL=https://webtv-rua.onrender.com/hls
   ```
7. Create Web Service

### 5. Créer le Frontend

1. Render Dashboard → New + → Static Site
2. Sélectionner votre repository
3. Name: `webtv-frontend`
4. Build Command: `cd frontend && npm install --legacy-peer-deps && npm run build`
5. Publish Directory: `frontend/dist`
6. Create Static Site

### 6. Exécuter les Migrations

1. Aller sur le Backend Service
2. Onglet "Shell"
3. Exécuter:
   ```bash
   cd backend
   npm run migrate
   ```

### 7. C'est Déployé ! 🎉

```
Frontend: https://webtv-rua.onrender.com
Backend: https://webtv-backend.onrender.com
```

---

## Identifiants Admin

```
Email: admin@webtv.local
Mot de passe: admin123
```

⚠️ Changez-les après le premier accès !

---

## Commandes Utiles

```bash
# Voir les logs
Dashboard → Service → Logs

# Redémarrer
Dashboard → Service → Manual Deploy

# Accéder à la BD
Dashboard → Backend → Shell
psql $DATABASE_URL
```

---

## Avantages Render vs Heroku

✅ Pas de veille (app toujours active)  
✅ Interface plus moderne  
✅ Gratuit sans limitations  
✅ Déploiement automatique depuis GitHub  
✅ Meilleure performance  

---

**Besoin d'aide ?** Consultez `DEPLOY_RENDER_GUIDE.md` pour le guide complet.
