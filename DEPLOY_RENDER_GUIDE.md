# 🚀 Guide de Déploiement Render - Web TV Platform

## Votre Configuration

```
App Name: webtv-rua
Email: rianalarabe13@gmail.com
URL Finale: https://webtv-rua.onrender.com
```

---

## ✨ Pourquoi Render ?

| Critère | Render | Heroku |
|---------|--------|--------|
| **Prix** | Gratuit | Gratuit (limité) |
| **Performance** | Excellent | Bon |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Veille** | ❌ Non | ✅ Oui |
| **BD PostgreSQL** | Gratuit | Gratuit (limité) |
| **Support** | Bon | Bon |
| **Interface** | Moderne | Ancienne |

---

## Étape 1: Créer un Compte Render

1. Aller sur https://render.com
2. Cliquer "Sign up"
3. Choisir "Sign up with GitHub" (recommandé)
4. Autoriser Render à accéder à GitHub
5. Confirmer votre email

---

## Étape 2: Préparer le Repository GitHub

### Option A: Créer un Repository GitHub (Recommandé)

1. **Créer un compte GitHub** (si pas déjà fait)
   - https://github.com/signup

2. **Créer un nouveau repository**
   - Cliquer "New repository"
   - Nom: `web-tv-platform`
   - Visibilité: Public (pour Render gratuit)
   - Cliquer "Create repository"

3. **Uploader le code**

   **Sur Windows (PowerShell):**
   ```powershell
   cd web-tv-platform
   git init
   git add .
   git commit -m "Initial commit: Web TV Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/web-tv-platform.git
   git push -u origin main
   ```

   **Sur macOS/Linux:**
   ```bash
   cd web-tv-platform
   git init
   git add .
   git commit -m "Initial commit: Web TV Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/web-tv-platform.git
   git push -u origin main
   ```

   **Remplacez `YOUR_USERNAME` par votre nom d'utilisateur GitHub**

### Option B: Utiliser Git CLI

```bash
# Installer Git si nécessaire
# Windows: https://git-scm.com/download/win
# macOS: brew install git
# Linux: sudo apt-get install git

# Configurer Git
git config --global user.email "rianalarabe13@gmail.com"
git config --global user.name "Rian Alarabe"

# Uploader sur GitHub
cd web-tv-platform
git init
git add .
git commit -m "Initial commit: Web TV Platform"
git remote add origin https://github.com/YOUR_USERNAME/web-tv-platform.git
git push -u origin main
```

---

## Étape 3: Créer la Base de Données PostgreSQL sur Render

1. **Aller sur Render Dashboard**
   - https://dashboard.render.com

2. **Créer une nouvelle PostgreSQL Database**
   - Cliquer "New +"
   - Choisir "PostgreSQL"
   - Remplir le formulaire:
     - **Name**: `webtv-db`
     - **Region**: Choisir la plus proche
     - **PostgreSQL Version**: 15
     - **Cliquer "Create Database"**

3. **Copier la Connection String**
   - Attendre que la BD soit créée (2-3 min)
   - Aller dans l'onglet "Connections"
   - Copier la "Internal Database URL"
   - **Garder cette URL, vous en aurez besoin**

---

## Étape 4: Créer le Service Backend

1. **Aller sur Render Dashboard**
   - https://dashboard.render.com

2. **Créer un nouveau Web Service**
   - Cliquer "New +"
   - Choisir "Web Service"
   - Sélectionner votre repository GitHub
   - Remplir le formulaire:

   | Champ | Valeur |
   |-------|--------|
   | **Name** | webtv-backend |
   | **Region** | Choisir la plus proche |
   | **Branch** | main |
   | **Runtime** | Node |
   | **Build Command** | `cd backend && npm install --legacy-peer-deps` |
   | **Start Command** | `cd backend && npm start` |

3. **Ajouter les Variables d'Environnement**
   - Aller à l'onglet "Environment"
   - Ajouter les variables:

   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-very-long-secret-key-here-change-this
   DATABASE_URL=<votre-connection-string-postgresql>
   FRONTEND_URL=https://webtv-rua.onrender.com
   HLS_URL=https://webtv-rua.onrender.com/hls
   ```

4. **Cliquer "Create Web Service"**
   - Attendre le déploiement (5-10 min)

---

## Étape 5: Créer le Service Frontend

1. **Aller sur Render Dashboard**

2. **Créer un nouveau Static Site**
   - Cliquer "New +"
   - Choisir "Static Site"
   - Sélectionner votre repository GitHub
   - Remplir le formulaire:

   | Champ | Valeur |
   |-------|--------|
   | **Name** | webtv-frontend |
   | **Region** | Choisir la plus proche |
   | **Branch** | main |
   | **Build Command** | `cd frontend && npm install --legacy-peer-deps && npm run build` |
   | **Publish Directory** | `frontend/dist` |

3. **Cliquer "Create Static Site"**
   - Attendre le déploiement (3-5 min)

---

## Étape 6: Exécuter les Migrations

1. **Aller sur le Backend Service**
   - Cliquer sur "webtv-backend"

2. **Ouvrir le Shell**
   - Cliquer sur l'onglet "Shell"

3. **Exécuter les migrations**
   ```bash
   cd backend
   npm run migrate
   ```

---

## 🎉 Accès à Votre Application

Une fois déployée, accédez à:

```
Frontend: https://webtv-rua.onrender.com
Backend API: https://webtv-backend.onrender.com
```

### Identifiants Admin

```
Email: admin@webtv.local
Mot de passe: admin123
```

⚠️ **Important**: Changez ces identifiants après le premier accès !

---

## Commandes Utiles

### Voir les Logs

1. Aller sur le service (Backend ou Frontend)
2. Onglet "Logs"
3. Voir les logs en direct

### Redémarrer le Service

1. Cliquer sur le service
2. Cliquer "Manual Deploy"
3. Choisir "Deploy latest commit"

### Accéder à la Base de Données

```bash
# Depuis le Shell du Backend
psql $DATABASE_URL

# Voir les tables
\dt

# Quitter
\q
```

---

## Dépannage

### Le service ne démarre pas

1. Aller sur le service
2. Onglet "Logs"
3. Voir l'erreur
4. Vérifier les variables d'environnement

### Erreur de base de données

```bash
# Dans le Shell du Backend
cd backend
npm run migrate
```

### Erreur de déploiement

1. Vérifier le "Build Command"
2. Vérifier les variables d'environnement
3. Cliquer "Manual Deploy"

---

## Mise à Jour de l'Application

Pour déployer une nouvelle version:

```bash
# Faire les changements
# ...

# Committer
git add .
git commit -m "Description des changements"

# Pousser vers GitHub
git push origin main
```

Render va automatiquement redéployer !

---

## Ajouter un Domaine Personnalisé

Si vous avez un domaine (ex: webtv.com) :

1. **Sur Render Dashboard**
   - Cliquer sur le service Frontend
   - Onglet "Settings"
   - Section "Custom Domain"
   - Ajouter votre domaine

2. **Configurer le DNS**
   - Chez votre registraire (GoDaddy, Namecheap, etc.)
   - Créer un CNAME record:
     - **Name**: www
     - **Value**: webtv-rua.onrender.com

---

## Upgrade vers Plan Payant

Pour éviter les limitations:

1. **Aller sur Render Dashboard**
2. **Cliquer sur le service**
3. **Onglet "Settings"**
4. **Cliquer "Upgrade to Pro"**

**Coûts:**
- Backend: $7/mois minimum
- Frontend: Gratuit
- PostgreSQL: $15/mois minimum

---

## Comparaison Render vs Heroku

| Critère | Render | Heroku |
|---------|--------|--------|
| **Gratuit** | ✅ Oui | ✅ Oui (limité) |
| **Veille** | ❌ Non | ✅ Oui |
| **Interface** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | Excellent | Bon |
| **Support** | Bon | Bon |
| **CLI** | ❌ Non | ✅ Oui |
| **GitHub Integration** | ✅ Oui | ✅ Oui |

---

## Alternatives

- **Railway**: https://railway.app (aussi simple que Render)
- **Vercel**: https://vercel.com (frontend seulement)
- **Netlify**: https://netlify.com (frontend seulement)
- **AWS**: https://aws.amazon.com (plus complexe)

---

## Support

- 📖 Documentation Render: https://render.com/docs
- 🆘 Support Render: https://render.com/support
- 💬 Community: https://render.com/community

---

**Prêt à déployer sur Render ?** Suivez les étapes ci-dessus et votre site sera en ligne en 15-20 minutes ! 🚀
