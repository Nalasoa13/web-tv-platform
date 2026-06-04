# 🚀 Démarrage Rapide - Web TV Platform

## En 5 Minutes avec Docker

### 1. Prérequis

- Docker et Docker Compose installés
- Port 5173, 3000, 8080, 1935 disponibles

### 2. Démarrage

```bash
cd web-tv-platform
docker-compose up -d
```

### 3. Accès

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Nginx/HLS | http://localhost:8080 |
| Streaming RTMP | rtmp://localhost:1935 |

### 4. Connexion Admin

```
Email: admin@webtv.local
Mot de passe: admin123
```

Accédez à: http://localhost:5173/admin/login

---

## Installation Locale (15 Minutes)

### Prérequis

```bash
# Vérifier les versions
node --version      # v18+
npm --version       # 9+
psql --version      # 13+
nginx -v            # 1.24+
ffmpeg -version     # 5.1+
```

### Installation

```bash
# 1. Backend
cd backend
npm install
npm run migrate
npm start

# 2. Frontend (nouveau terminal)
cd frontend
npm install
npm run dev

# 3. Nginx (nouveau terminal)
sudo systemctl start nginx
```

---

## Tester le Streaming en Direct

### Générer un flux de test

```bash
ffmpeg -f lavfi -i testsrc=duration=300:size=1280x720:rate=30 \
        -f lavfi -i sine=frequency=1000:duration=300 \
        -c:v libx264 -preset fast -b:v 2000k \
        -c:a aac -b:a 128k \
        -f flv rtmp://localhost:1935/live/demo
```

### Regarder le flux

Ouvrez dans le navigateur:
```
http://localhost:8080/hls/demo.m3u8
```

---

## Ajouter une Vidéo VOD

1. Allez à http://localhost:5173/admin/login
2. Connectez-vous
3. Allez à l'onglet "Ajouter Vidéo"
4. Remplissez le formulaire:
   - **Titre**: Nom de la vidéo
   - **Description**: Description
   - **URL HLS**: `http://localhost:8080/hls/video.m3u8`
   - **Catégorie**: Film, Série, etc.

---

## Commandes Utiles

### Docker

```bash
# Voir les logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart
```

### Base de Données

```bash
# Connexion
psql -U postgres -d webtv -h localhost

# Voir les vidéos
SELECT * FROM vod;

# Voir les commentaires
SELECT * FROM comments;
```

### Nginx

```bash
# Vérifier la config
sudo nginx -t

# Redémarrer
sudo systemctl restart nginx

# Logs
sudo tail -f /var/log/nginx/error.log
```

---

## Dépannage Rapide

| Problème | Solution |
|----------|----------|
| Port déjà utilisé | `lsof -i :5173` et tuer le processus |
| PostgreSQL ne se connecte pas | `sudo systemctl restart postgresql` |
| Nginx ne démarre pas | `sudo nginx -t` pour voir l'erreur |
| Pas de flux HLS | Vérifier `/tmp/hls/` existe et a les permissions |
| CORS error | Vérifier `FRONTEND_URL` dans `.env` |

---

## Prochaines Étapes

1. **Lire la documentation**
   - [README.md](./README.md) - Vue d'ensemble
   - [docs/INSTALLATION.md](./docs/INSTALLATION.md) - Installation détaillée
   - [docs/API.md](./docs/API.md) - Documentation API

2. **Configurer en production**
   - [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Guide déploiement

3. **Personnaliser**
   - Changer les couleurs dans `frontend/src/index.css`
   - Modifier le logo dans `frontend/src/components/Header.jsx`
   - Ajouter vos propres catégories dans `backend/utils/validators.js`

---

## Support

- 📖 Voir la [documentation complète](./docs/INSTALLATION.md)
- 🐛 Signaler un bug sur GitHub
- 💬 Poser une question sur les discussions

---

**Prêt à commencer?** 🎬

```bash
docker-compose up -d
```

Visitez http://localhost:5173 !
