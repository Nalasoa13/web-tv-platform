# 📺 Web TV Platform - Plateforme de Streaming Vidéo Complète

Une plateforme de streaming vidéo professionnelle et complète avec support du **streaming en direct (RTMP/HLS)**, **vidéo à la demande (VOD)**, **commentaires en temps réel**, et **espace administrateur avancé**.

## ✨ Fonctionnalités

### 🎬 Fonctionnalités Publiques

- **Lecteur vidéo adaptatif** avec qualités multiples (SD, HD, Full HD)
- **Streaming en direct** avec RTMP/HLS
- **Vidéo à la demande (VOD)** avec classement par catégories
- **Grille TV** avec horaires de diffusion et descriptions
- **Système de likes** pour vidéos et émissions
- **Commentaires en temps réel** modérés automatiquement
- **Génération automatique de pseudonymes** (sans création de compte)
- **Recherche** de programmes et émissions
- **Partage sur réseaux sociaux** (Facebook, YouTube) sans téléchargement
- **Design responsive** pour desktop, tablette et mobile
- **Support multi-navigateur** (Chrome, Firefox, Safari, Edge)

### 🔐 Espace Administrateur

- **Gestion des émissions TV** (création, modification, suppression)
- **Gestion des vidéos VOD** et replays
- **Planification de la grille TV** (manuelle ou automatique)
- **Configuration des flux HLS**
- **Modération des commentaires** et espaces de discussion
- **Statistiques détaillées** (spectateurs, durée moyenne, audiences)
- **Authentification sécurisée** avec JWT

### 🛡️ Sécurité

- ✅ Aucun téléchargement de vidéos possible
- ✅ Protection des flux vidéo
- ✅ Rate limiting anti-spam
- ✅ Modération automatique des commentaires
- ✅ Authentification JWT sécurisée
- ✅ Respect des droits d'auteur

---

## 🏗️ Architecture Technique

### Stack Technologique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | React.js + Vite | 18.2.0 |
| **Styling** | Tailwind CSS | 3.3.0 |
| **Backend** | Node.js + Express.js | 18.x |
| **Base de données** | PostgreSQL | 15+ |
| **Streaming** | HLS (HTTP Live Streaming) | - |
| **RTMP** | Nginx RTMP Module | - |
| **Temps réel** | Socket.io | 4.6.1 |
| **Lecteur vidéo** | HLS.js | 1.4.10 |
| **Conteneurisation** | Docker & Docker Compose | - |

### Architecture Système

```
┌─────────────────────────────────────────────────────────┐
│                   Navigateur Client                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Nginx (Port 8080)                              │
│  • Serveur HLS  • Proxy API  • Frontend  • Socket.IO    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌─────────┐
    │Frontend│  │Backend │  │PostgreSQL
    │ React  │  │Node.js │  │Database
    │        │  │Express │  │
    └────────┘  └────────┘  └─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Nginx RTMP       │
            │ (Port 1935)      │
            │ • Réception RTMP │
            │ • Conversion HLS │
            └──────────────────┘
```

---

## 📦 Structure du Projet

```
web-tv-platform/
├── backend/                    # API Node.js + Express
│   ├── server.js              # Serveur principal
│   ├── migrations/
│   │   └── init.js            # Scripts de migration BD
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages principales
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
├── nginx-rtmp/                # Configuration Nginx RTMP
│   └── nginx.conf
├── config/                    # Fichiers de configuration
├── docs/                      # Documentation
│   └── INSTALLATION.md        # Guide complet d'installation
├── docker-compose.yml         # Configuration Docker Compose
└── README.md                  # Ce fichier
```

---

## 🚀 Démarrage Rapide

### Avec Docker Compose (Recommandé)

```bash
# Cloner le projet
git clone <repository-url>
cd web-tv-platform

# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

**Accès:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Nginx/HLS: http://localhost:8080

### Installation Locale

Voir le [Guide d'Installation Complet](./docs/INSTALLATION.md)

```bash
# 1. Installer les prérequis
# Node.js, PostgreSQL, Nginx RTMP, FFmpeg

# 2. Configuration Backend
cd backend
npm install
npm run migrate

# 3. Configuration Frontend
cd ../frontend
npm install

# 4. Démarrer les services
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev

# Terminal 3
sudo systemctl start nginx
```

---

## 🔑 Identifiants par Défaut

```
Email: admin@webtv.local
Mot de passe: admin123
```

⚠️ **Important**: Changez ces identifiants en production!

---

## 📖 Utilisation

### Ajouter une Vidéo VOD

1. Accédez à http://localhost:5173/admin/login
2. Connectez-vous avec les identifiants admin
3. Allez à l'onglet "Ajouter Vidéo"
4. Remplissez le formulaire avec:
   - Titre et description
   - URL du flux HLS (ex: `http://localhost:8080/hls/video.m3u8`)
   - Catégorie et miniature

### Tester le Streaming en Direct

```bash
# Générer un flux RTMP de test
ffmpeg -f lavfi -i testsrc=duration=300:size=1280x720:rate=30 \
        -f lavfi -i sine=frequency=1000:duration=300 \
        -c:v libx264 -preset fast -b:v 2000k \
        -c:a aac -b:a 128k \
        -f flv rtmp://localhost:1935/live/demo

# Le flux sera disponible à: http://localhost:8080/hls/demo.m3u8
```

### Modérer les Commentaires

1. Allez au tableau de bord admin
2. Cliquez sur l'onglet "Modération"
3. Approuvez ou rejetez les commentaires en attente

---

## 🔧 Configuration

### Variables d'Environnement Backend

```env
# Base de données
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webtv

# Serveur
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production

# Frontend
FRONTEND_URL=http://localhost:5173

# Streaming
HLS_URL=http://localhost:8080/hls
```

### Configuration Nginx

Modifiez `nginx-rtmp/nginx.conf` pour:
- Changer les ports (1935 pour RTMP, 8080 pour HTTP)
- Configurer les qualités vidéo multiples
- Ajouter des certificats SSL/TLS

---

## 📊 API Endpoints

### Endpoints Publics

```
GET  /api/schedule              # Récupérer la grille TV
GET  /api/vod                   # Récupérer les vidéos VOD
GET  /api/video/:id             # Détails d'une vidéo
GET  /api/comments/:videoId     # Commentaires d'une vidéo
POST /api/comments/:videoId     # Ajouter un commentaire
POST /api/like/:videoId         # Aimer une vidéo
GET  /api/search?q=query        # Rechercher
GET  /api/generate-username     # Générer un pseudonyme
```

### Endpoints Admin

```
POST /api/admin/login                    # Connexion admin
POST /api/admin/schedule                 # Créer une émission
POST /api/admin/vod                      # Créer une vidéo VOD
PUT  /api/admin/vod/:id/publish          # Publier une vidéo
GET  /api/admin/comments/pending         # Commentaires en attente
PUT  /api/admin/comments/:id/approve     # Approuver un commentaire
DELETE /api/admin/comments/:id           # Rejeter un commentaire
GET  /api/admin/stats                    # Statistiques
```

---

## 🎯 Cas d'Usage

### Chaîne TV Numérique
- Diffusion en direct de programmes TV
- Catalogue VOD avec archives
- Grille de programmation

### Plateforme de Formation
- Cours vidéo à la demande
- Webinaires en direct
- Commentaires et interactions

### Plateforme de Divertissement
- Films et séries à la demande
- Événements en direct
- Système de likes et commentaires

### Streaming d'Événements
- Conférences en direct
- Concerts et spectacles
- Retransmissions sportives

---

## 🔒 Sécurité

### Mesures Implémentées

- ✅ **JWT Authentication** pour l'espace admin
- ✅ **Rate Limiting** anti-spam (100 req/15min)
- ✅ **CORS** configuré
- ✅ **Modération des commentaires** automatique
- ✅ **Protection contre téléchargement** (`controlsList="nodownload"`)
- ✅ **Validation des entrées** côté serveur
- ✅ **Hachage des mots de passe** avec bcryptjs

### Recommandations Production

1. Changez `JWT_SECRET` par une clé complexe
2. Configurez HTTPS/SSL
3. Utilisez une base de données sécurisée
4. Activez les backups automatiques
5. Configurez un firewall
6. Utilisez un CDN pour les vidéos

---

## 📈 Performance

### Optimisations Implémentées

- **Compression Gzip** des réponses HTTP
- **Cache côté client** pour les vidéos HLS
- **Streaming adaptatif** avec qualités multiples
- **Lazy loading** des images
- **Pagination** des résultats
- **Indexation** des bases de données

### Recommandations

- Utilisez un CDN pour les vidéos
- Configurez la compression vidéo (H.264)
- Optimisez les miniatures (WebP)
- Activez le cache navigateur

---

## 🐛 Dépannage

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| Nginx ne démarre pas | Vérifiez la configuration: `sudo nginx -t` |
| Pas de flux HLS | Vérifiez les permissions: `ls -la /tmp/hls/` |
| PostgreSQL ne se connecte pas | Redémarrez: `sudo systemctl restart postgresql` |
| Erreur CORS | Vérifiez `FRONTEND_URL` dans `.env` |
| Commentaires non visibles | Vérifiez la modération dans le tableau de bord |

Voir le [Guide d'Installation](./docs/INSTALLATION.md#dépannage) pour plus de détails.

---

## 📚 Documentation

- [Guide d'Installation Complet](./docs/INSTALLATION.md)
- [Documentation API](./docs/API.md)
- [Guide de Déploiement](./docs/DEPLOYMENT.md)

---

## 🤝 Contribution

Les contributions sont bienvenues! Veuillez:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

Pour toute question ou problème:

1. Consultez la [documentation](./docs/INSTALLATION.md)
2. Vérifiez les [issues existantes](../../issues)
3. Créez une nouvelle issue avec:
   - Description du problème
   - Étapes pour reproduire
   - Logs d'erreur
   - Configuration système

---

## 🎉 Remerciements

- [Express.js](https://expressjs.com/) - Framework backend
- [React](https://react.dev/) - Framework frontend
- [Nginx RTMP](https://github.com/arut/nginx-rtmp-module) - Module RTMP
- [HLS.js](https://github.com/video-dev/hls.js) - Lecteur HLS
- [Socket.io](https://socket.io/) - Communication temps réel

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2024  
**Statut**: Production Ready ✅
