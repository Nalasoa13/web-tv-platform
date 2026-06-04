# Guide de Déploiement en Production - Web TV Platform

Ce guide couvre le déploiement de la plateforme Web TV en environnement de production.

## Table des matières

1. [Préparation](#préparation)
2. [Déploiement sur VPS](#déploiement-sur-vps)
3. [Configuration HTTPS/SSL](#configuration-httpsssl)
4. [Optimisation Performance](#optimisation-performance)
5. [Monitoring et Maintenance](#monitoring-et-maintenance)
6. [Sauvegarde et Récupération](#sauvegarde-et-récupération)

---

## Préparation

### Checklist Pré-Déploiement

- [ ] Tous les identifiants par défaut ont été changés
- [ ] Les variables d'environnement sont correctement configurées
- [ ] Les certificats SSL/TLS sont prêts
- [ ] La base de données a été sauvegardée
- [ ] Les tests ont été effectués en local
- [ ] Un plan de rollback est en place

### Variables d'Environnement Production

```env
# Base de données
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_HOST=db.production.com
DB_PORT=5432
DB_NAME=webtv_prod

# Serveur
PORT=3000
NODE_ENV=production
JWT_SECRET=very_long_random_secret_key_here

# Frontend
FRONTEND_URL=https://webtv.example.com

# Streaming
HLS_URL=https://webtv.example.com/hls

# Fichiers
UPLOAD_DIR=/var/www/webtv/uploads
MAX_FILE_SIZE=5368709120

# Sécurité
CORS_ORIGIN=https://webtv.example.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## Déploiement sur VPS

### 1. Préparation du Serveur

#### Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

#### Installation des dépendances

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx

# FFmpeg
sudo apt install -y ffmpeg

# Supervisor (pour gérer les processus)
sudo apt install -y supervisor

# Certbot (pour SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Configuration PostgreSQL

```bash
# Créer un utilisateur PostgreSQL
sudo -u postgres createuser prod_user
sudo -u postgres psql -c "ALTER USER prod_user WITH PASSWORD 'strong_password_here';"

# Créer la base de données
sudo -u postgres createdb webtv_prod -O prod_user

# Activer les extensions
sudo -u postgres psql -d webtv_prod -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
```

### 3. Cloner et Configurer le Projet

```bash
# Créer le répertoire d'application
sudo mkdir -p /var/www/webtv
sudo chown $USER:$USER /var/www/webtv
cd /var/www/webtv

# Cloner le repository
git clone <repository-url> .

# Installer les dépendances
cd backend
npm install --production
cd ../frontend
npm install
npm run build
cd ..
```

### 4. Configuration Nginx

Créer `/etc/nginx/sites-available/webtv`:

```nginx
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name webtv.example.com;
    
    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name webtv.example.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/webtv.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webtv.example.com/privkey.pem;

    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Logs
    access_log /var/log/nginx/webtv_access.log;
    error_log /var/log/nginx/webtv_error.log;

    # Limites
    client_max_body_size 5G;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;

    # Frontend
    location / {
        root /var/www/webtv/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }

    # API Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://backend/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # HLS Streaming
    location /hls {
        types {
            application/vnd.apple.mpegurl m3u8;
            video/mp2t ts;
        }
        alias /var/www/webtv/hls;
        expires -1;
        add_header Cache-Control "no-cache";
    }

    # VOD
    location /vod {
        alias /var/www/webtv/vod;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

Activer la configuration:

```bash
sudo ln -s /etc/nginx/sites-available/webtv /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configuration Supervisor

Créer `/etc/supervisor/conf.d/webtv-backend.conf`:

```ini
[program:webtv-backend]
directory=/var/www/webtv/backend
command=/usr/bin/node server.js
autostart=true
autorestart=true
stderr_logfile=/var/log/webtv-backend.err.log
stdout_logfile=/var/log/webtv-backend.out.log
environment=NODE_ENV=production,PATH="/usr/bin"
user=www-data
```

Activer:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start webtv-backend
```

### 6. Configuration Nginx RTMP

Installer le module RTMP:

```bash
sudo apt install libnginx-mod-rtmp
```

Ajouter à `/etc/nginx/nginx.conf`:

```nginx
rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record off;

            exec ffmpeg -i rtmp://localhost:1935/live/$name
                -c:v libx264 -preset veryfast -b:v 3000k
                -c:a aac -b:a 128k
                -hls_time 10 -hls_list_size 6
                -f hls /var/www/webtv/hls/$name.m3u8;
        }
    }
}
```

---

## Configuration HTTPS/SSL

### Obtenir un Certificat SSL avec Certbot

```bash
sudo certbot certonly --nginx -d webtv.example.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Configuration SSL Avancée

Ajouter à la section `server` de nginx.conf:

```nginx
# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Sécurité supplémentaire
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## Optimisation Performance

### 1. Optimisation Base de Données

```sql
-- Créer des index
CREATE INDEX idx_vod_published ON vod(published);
CREATE INDEX idx_vod_category ON vod(category);
CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_approved ON comments(approved);
CREATE INDEX idx_schedule_start_time ON schedule(start_time);

-- Analyser les tables
ANALYZE vod;
ANALYZE comments;
ANALYZE schedule;
```

### 2. Optimisation Node.js

Modifier `backend/server.js`:

```javascript
// Augmenter les limites de connexion
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Démarrer le serveur
}
```

### 3. Optimisation Nginx

```nginx
# Augmenter les workers
worker_processes auto;
worker_connections 4096;

# Optimiser les buffers
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;

# Caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;
proxy_cache api_cache;
proxy_cache_valid 200 1h;
```

### 4. CDN pour les Vidéos

Intégrer Cloudflare ou AWS CloudFront:

```nginx
# Rediriger vers CDN
location /hls {
    return 301 https://cdn.example.com/hls$request_uri;
}
```

---

## Monitoring et Maintenance

### 1. Logs

```bash
# Logs Nginx
tail -f /var/log/nginx/webtv_access.log
tail -f /var/log/nginx/webtv_error.log

# Logs Backend
tail -f /var/log/webtv-backend.out.log
tail -f /var/log/webtv-backend.err.log

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql.log
```

### 2. Monitoring avec Prometheus

Installer Prometheus:

```bash
sudo apt install prometheus
```

Configuration `/etc/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'webtv'
    static_configs:
      - targets: ['localhost:3000']
```

### 3. Alertes

Configurer des alertes pour:
- Utilisation CPU > 80%
- Utilisation mémoire > 85%
- Espace disque < 10%
- Erreurs HTTP 5xx > 10/min
- Temps de réponse > 2s

### 4. Maintenance Régulière

```bash
# Nettoyer les fichiers HLS anciens
find /var/www/webtv/hls -mtime +7 -delete

# Nettoyer les logs
find /var/log -name "*.log" -mtime +30 -delete

# Vérifier l'intégrité de la base de données
sudo -u postgres pg_dump webtv_prod | pg_restore -d webtv_test
```

---

## Sauvegarde et Récupération

### 1. Stratégie de Sauvegarde

```bash
#!/bin/bash
# Script de sauvegarde quotidienne

BACKUP_DIR="/backups/webtv"
DATE=$(date +%Y%m%d_%H%M%S)

# Sauvegarder la base de données
sudo -u postgres pg_dump webtv_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Sauvegarder les fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/webtv/vod /var/www/webtv/uploads

# Nettoyer les anciennes sauvegardes (> 30 jours)
find $BACKUP_DIR -mtime +30 -delete

# Uploader vers un stockage distant (S3, etc.)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://backup-bucket/webtv/
```

### 2. Restauration

```bash
# Restaurer la base de données
gunzip < /backups/webtv/db_20240101_120000.sql.gz | sudo -u postgres psql webtv_prod

# Restaurer les fichiers
tar -xzf /backups/webtv/files_20240101_120000.tar.gz -C /
```

### 3. Réplication PostgreSQL

Configuration du streaming replication:

```bash
# Sur le serveur primaire
sudo -u postgres psql -c "CREATE ROLE replication WITH REPLICATION LOGIN PASSWORD 'password';"

# Configurer pg_hba.conf
echo "host replication replication standby_ip/32 md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

---

## Rollback et Récupération

### Plan de Rollback

```bash
#!/bin/bash
# Script de rollback en cas de problème

# Arrêter le service
sudo supervisorctl stop webtv-backend

# Restaurer la version précédente
cd /var/www/webtv
git checkout HEAD~1

# Réinstaller les dépendances
cd backend && npm install --production && cd ..

# Redémarrer
sudo supervisorctl start webtv-backend

# Vérifier le statut
curl https://webtv.example.com/api/schedule
```

---

## Checklist Post-Déploiement

- [ ] Site accessible via HTTPS
- [ ] Certificat SSL valide
- [ ] API répond correctement
- [ ] Streaming en direct fonctionne
- [ ] Commentaires modérés
- [ ] Statistiques correctes
- [ ] Logs sans erreurs critiques
- [ ] Sauvegardes en place
- [ ] Monitoring actif
- [ ] Plan de rollback testé

---

## Support et Dépannage

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| Certificat SSL expiré | Renouveler avec `certbot renew` |
| Espace disque plein | Nettoyer les anciens fichiers HLS |
| Base de données lente | Exécuter `VACUUM ANALYZE` |
| Erreurs mémoire | Augmenter la limite Node.js |

---

**Dernière mise à jour**: 2024  
**Version**: 1.0.0
