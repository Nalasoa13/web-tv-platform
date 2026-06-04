# Guide d'Installation - Web TV Platform

Ce guide vous explique comment configurer et exécuter la plateforme Web TV en local.

## Table des matières

1. [Prérequis](#prérequis)
2. [Architecture système](#architecture-système)
3. [Installation locale sans Docker](#installation-locale-sans-docker)
4. [Installation avec Docker](#installation-avec-docker)
5. [Configuration du streaming HLS](#configuration-du-streaming-hls)
6. [Test et utilisation](#test-et-utilisation)
7. [Dépannage](#dépannage)

---

## Prérequis

### Logiciels requis

- **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- **PostgreSQL** (v13 ou supérieur) - [Télécharger](https://www.postgresql.org/download/)
- **Nginx avec module RTMP** - [Installation](#installation-nginx-rtmp)
- **FFmpeg** - Pour la conversion de flux vidéo
- **Git** - Pour cloner le projet

### Versions testées

```bash
Node.js: v18.17.0
PostgreSQL: 15.2
Nginx: 1.24.0
FFmpeg: 5.1.2
```

### Configuration matérielle minimale

- CPU: 2 cœurs
- RAM: 4 GB
- Disque: 20 GB (pour les vidéos et enregistrements)
- Connexion: 10 Mbps (pour le streaming)

---

## Architecture système

```
┌─────────────────────────────────────────────────────────┐
│                   Navigateur Client                      │
│              (Chrome, Firefox, Safari, Edge)             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Nginx (Port 8080)                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ • Serveur HLS (/hls)                                ││
│  │ • Proxy API (/api → Backend)                        ││
│  │ • Proxy Socket.IO (/socket.io → Backend)           ││
│  │ • Serveur Frontend (/)                              ││
│  └─────────────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌─────────┐
    │Frontend│  │Backend │  │PostgreSQL
    │ React  │  │Node.js │  │Database
    │(Vite)  │  │Express │  │
    │        │  │Socket. │  │
    │        │  │IO      │  │
    └────────┘  └────────┘  └─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Nginx RTMP       │
            │ (Port 1935)      │
            │ • Réception RTMP │
            │ • Conversion HLS │
            │ • Enregistrement │
            └──────────────────┘
```

---

## Installation locale sans Docker

### Étape 1 : Installation de PostgreSQL

#### Sur Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Sur macOS (avec Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

#### Configuration initiale

```bash
# Créer un utilisateur PostgreSQL
sudo -u postgres createuser postgres
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"

# Créer la base de données
sudo -u postgres createdb webtv
```

### Étape 2 : Installation de Node.js et npm

```bash
# Vérifier l'installation
node --version  # v18.x.x ou supérieur
npm --version   # 9.x.x ou supérieur
```

### Étape 3 : Installation de FFmpeg

#### Sur Ubuntu/Debian

```bash
sudo apt install ffmpeg
```

#### Sur macOS

```bash
brew install ffmpeg
```

#### Vérification

```bash
ffmpeg -version
```

### Étape 4 : Installation de Nginx avec module RTMP

#### Sur Ubuntu/Debian

```bash
# Installer Nginx
sudo apt install nginx

# Installer le module RTMP (ou compiler depuis source)
sudo apt install libnginx-mod-rtmp

# Vérifier l'installation
nginx -v
```

#### Sur macOS

```bash
brew install nginx-rtmp
```

#### Configuration Nginx

```bash
# Copier la configuration
sudo cp /home/ubuntu/web-tv-platform/nginx-rtmp/nginx.conf /etc/nginx/nginx.conf

# Créer les répertoires nécessaires
sudo mkdir -p /tmp/hls
sudo mkdir -p /home/ubuntu/web-tv-platform/recordings
sudo mkdir -p /home/ubuntu/web-tv-platform/vod

# Définir les permissions
sudo chown -R $USER:$USER /tmp/hls
sudo chown -R $USER:$USER /home/ubuntu/web-tv-platform/recordings
sudo chown -R $USER:$USER /home/ubuntu/web-tv-platform/vod

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Étape 5 : Configuration du Backend

```bash
cd /home/ubuntu/web-tv-platform/backend

# Copier le fichier .env
cp .env.example .env

# Éditer le fichier .env si nécessaire
nano .env
```

Contenu du fichier `.env` :

```env
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webtv
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
HLS_URL=http://localhost:8080/hls
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5368709120
```

### Étape 6 : Installation des dépendances Backend

```bash
cd /home/ubuntu/web-tv-platform/backend

# Installer les dépendances
npm install

# Exécuter les migrations de base de données
npm run migrate
```

### Étape 7 : Configuration du Frontend

```bash
cd /home/ubuntu/web-tv-platform/frontend

# Installer les dépendances
npm install

# Créer un fichier .env.local (optionnel)
echo "VITE_API_URL=http://localhost:3000" > .env.local
```

### Étape 8 : Démarrage des services

#### Terminal 1 - Backend

```bash
cd /home/ubuntu/web-tv-platform/backend
npm start
# Serveur démarré sur http://localhost:3000
```

#### Terminal 2 - Frontend

```bash
cd /home/ubuntu/web-tv-platform/frontend
npm run dev
# Frontend disponible sur http://localhost:5173
```

#### Terminal 3 - Nginx

```bash
# Vérifier la configuration
sudo nginx -t

# Démarrer Nginx
sudo systemctl start nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## Installation avec Docker

### Prérequis Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier
docker --version
docker-compose --version
```

### Démarrage avec Docker Compose

```bash
cd /home/ubuntu/web-tv-platform

# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Accès aux services

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Nginx/HLS: http://localhost:8080
- PostgreSQL: localhost:5432

### Arrêt des services

```bash
docker-compose down

# Arrêt avec suppression des volumes
docker-compose down -v
```

---

## Configuration du streaming HLS

### Vérification de Nginx RTMP

```bash
# Vérifier que Nginx écoute sur le port 1935
sudo netstat -tlnp | grep 1935

# Ou avec ss
sudo ss -tlnp | grep 1935
```

### Test du streaming

#### 1. Générer une vidéo de test

```bash
# Créer une vidéo de test avec FFmpeg
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 \
        -f lavfi -i sine=frequency=1000:duration=10 \
        -c:v libx264 -preset fast -b:v 2000k \
        -c:a aac -b:a 128k \
        -f flv rtmp://localhost:1935/live/test
```

#### 2. Vérifier le flux HLS

```bash
# Vérifier que le fichier m3u8 est créé
ls -la /tmp/hls/

# Afficher le contenu du fichier m3u8
cat /tmp/hls/test.m3u8
```

#### 3. Accéder au flux dans le navigateur

```
http://localhost:8080/hls/test.m3u8
```

### Configuration des qualités multiples

Modifiez la section `application live` dans `nginx.conf` :

```nginx
application live {
    live on;
    record off;

    # Qualité 1080p
    exec ffmpeg -i rtmp://localhost:1935/live/$name
        -c:v libx264 -preset fast -b:v 5000k -maxrate 5000k -bufsize 10000k
        -c:a aac -b:a 128k
        -hls_time 10 -hls_list_size 6
        -f hls /tmp/hls/$name-1080p.m3u8;

    # Qualité 720p
    exec ffmpeg -i rtmp://localhost:1935/live/$name
        -c:v libx264 -preset fast -b:v 2500k -maxrate 2500k -bufsize 5000k
        -c:a aac -b:a 128k
        -hls_time 10 -hls_list_size 6
        -f hls /tmp/hls/$name-720p.m3u8;

    # Qualité 480p
    exec ffmpeg -i rtmp://localhost:1935/live/$name
        -c:v libx264 -preset fast -b:v 1000k -maxrate 1000k -bufsize 2000k
        -c:a aac -b:a 96k
        -hls_time 10 -hls_list_size 6
        -f hls /tmp/hls/$name-480p.m3u8;
}
```

---

## Test et utilisation

### Accès à l'application

1. **Frontend public**: http://localhost:5173
2. **Espace admin**: http://localhost:5173/admin/login
3. **API Backend**: http://localhost:3000/api

### Identifiants par défaut

```
Email: admin@webtv.local
Mot de passe: admin123
```

### Ajouter une vidéo VOD

1. Accédez à http://localhost:5173/admin/login
2. Connectez-vous avec les identifiants par défaut
3. Allez à l'onglet "Ajouter Vidéo"
4. Remplissez le formulaire:
   - **Titre**: Nom de la vidéo
   - **Description**: Description détaillée
   - **URL HLS**: `http://localhost:8080/hls/votre-video.m3u8`
   - **Catégorie**: Film, Série, Documentaire, etc.
   - **Miniature**: URL de l'image miniature

### Tester le streaming en direct

```bash
# Terminal 1: Générer un flux RTMP
ffmpeg -f lavfi -i testsrc=duration=300:size=1280x720:rate=30 \
        -f lavfi -i sine=frequency=1000:duration=300 \
        -c:v libx264 -preset fast -b:v 2000k \
        -c:a aac -b:a 128k \
        -f flv rtmp://localhost:1935/live/demo

# Terminal 2: Regarder le flux
# Ouvrez http://localhost:8080/hls/demo.m3u8 dans le navigateur
```

### Modérer les commentaires

1. Allez au tableau de bord admin
2. Cliquez sur l'onglet "Modération"
3. Approuvez ou rejetez les commentaires en attente

---

## Dépannage

### Problème: Nginx ne démarre pas

```bash
# Vérifier la configuration
sudo nginx -t

# Voir les erreurs
sudo journalctl -u nginx -n 50

# Vérifier les ports en utilisation
sudo netstat -tlnp | grep nginx
```

### Problème: PostgreSQL ne se connecte pas

```bash
# Vérifier le statut
sudo systemctl status postgresql

# Vérifier les logs
sudo tail -f /var/log/postgresql/postgresql.log

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Tester la connexion
psql -U postgres -d webtv -h localhost
```

### Problème: Pas de flux HLS

```bash
# Vérifier les permissions des répertoires
ls -la /tmp/hls/
ls -la /home/ubuntu/web-tv-platform/recordings/

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier que FFmpeg fonctionne
ffmpeg -version
```

### Problème: Erreur CORS

Vérifiez que la variable `FRONTEND_URL` dans `.env` correspond à votre URL frontend:

```env
FRONTEND_URL=http://localhost:5173
```

Puis redémarrez le backend:

```bash
npm start
```

### Problème: Base de données vide

Exécutez les migrations:

```bash
cd /home/ubuntu/web-tv-platform/backend
npm run migrate
```

### Problème: Connexion admin impossible

Réinitialisez la base de données:

```bash
# Supprimer et recréer la base
sudo -u postgres dropdb webtv
sudo -u postgres createdb webtv

# Exécuter les migrations
cd /home/ubuntu/web-tv-platform/backend
npm run migrate
```

---

## Optimisation pour connexions faibles

### Configuration Nginx pour compression

Ajoutez à la section `http` de nginx.conf:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css text/xml text/javascript 
            application/x-javascript application/xml+rss 
            application/javascript application/json;
```

### Réduction de la qualité vidéo

Modifiez les débits dans nginx.conf:

```nginx
# Pour connexions faibles (< 5 Mbps)
-b:v 500k -maxrate 500k -bufsize 1000k
```

### Cache côté client

Modifiez les en-têtes HTTP dans nginx.conf:

```nginx
location /hls {
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
}
```

---

## Sécurité en production

### Changez les identifiants par défaut

```bash
# Modifier le mot de passe admin dans la base de données
psql -U postgres -d webtv -c "UPDATE admin_users SET password = crypt('nouveau_mot_de_passe', gen_salt('bf')) WHERE email = 'admin@webtv.local';"
```

### Configurez HTTPS

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Générer un certificat
sudo certbot certonly --nginx -d votre-domaine.com

# Configurer Nginx pour HTTPS
# Modifiez nginx.conf pour ajouter les certificats SSL
```

### Activez le rate limiting

Le rate limiting est déjà configuré dans le backend. Vous pouvez l'ajuster dans `server.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requêtes par fenêtre
});
```

---

## Maintenance

### Sauvegarder la base de données

```bash
# Dump complet
pg_dump -U postgres webtv > backup-$(date +%Y%m%d).sql

# Restaurer
psql -U postgres webtv < backup-20240101.sql
```

### Nettoyer les fichiers temporaires

```bash
# Supprimer les anciens fichiers HLS
find /tmp/hls -mtime +7 -delete

# Supprimer les anciens enregistrements
find /home/ubuntu/web-tv-platform/recordings -mtime +30 -delete
```

### Monitorer les performances

```bash
# Vérifier l'utilisation disque
df -h /tmp/hls
df -h /home/ubuntu/web-tv-platform/

# Vérifier l'utilisation mémoire
free -h

# Vérifier les connexions PostgreSQL
psql -U postgres -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

---

## Support et ressources

- **Documentation Nginx RTMP**: https://github.com/arut/nginx-rtmp-module
- **Documentation HLS.js**: https://github.com/video-dev/hls.js
- **Documentation Express.js**: https://expressjs.com/
- **Documentation React**: https://react.dev/

---

**Dernière mise à jour**: 2024
**Version**: 1.0.0
