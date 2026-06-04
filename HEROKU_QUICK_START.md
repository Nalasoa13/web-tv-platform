# 🚀 Déploiement Heroku - Guide Rapide

## En 5 Minutes sur Heroku

### 1. Prérequis

```bash
# Installer Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Vérifier
heroku --version
```

### 2. Se Connecter à Heroku

```bash
heroku login
```

### 3. Déployer Automatiquement

```bash
cd /home/ubuntu/web-tv-platform

# Rendre le script exécutable
chmod +x deploy-heroku.sh

# Lancer le déploiement
./deploy-heroku.sh webtv-myapp production
```

**Note**: Remplacez `webtv-myapp` par un nom unique (ex: `webtv-john-2024`)

### 4. Accéder à l'Application

```
https://webtv-myapp.herokuapp.com
```

### 5. Connexion Admin

```
Email: admin@webtv.local
Mot de passe: admin123
```

---

## Déploiement Manuel (si le script ne fonctionne pas)

### 1. Créer l'Application

```bash
heroku create webtv-myapp
heroku addons:create heroku-postgresql:hobby-dev
```

### 2. Configurer les Buildpacks

```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/static
```

### 3. Définir les Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set FRONTEND_URL=https://webtv-myapp.herokuapp.com
heroku config:set HLS_URL=https://webtv-myapp.herokuapp.com/hls
```

### 4. Déployer

```bash
git push heroku main
```

### 5. Exécuter les Migrations

```bash
heroku run npm run migrate --prefix backend
```

---

## Commandes Utiles

```bash
# Voir l'application
heroku open

# Voir les logs
heroku logs --tail

# Redémarrer
heroku restart

# Voir les variables
heroku config

# Se connecter à la BD
heroku pg:psql
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| App en veille | Upgrade vers plan payant |
| Erreur déploiement | Voir les logs: `heroku logs --tail` |
| BD vide | Exécuter: `heroku run npm run migrate --prefix backend` |
| CORS error | Vérifier `FRONTEND_URL` dans `heroku config` |

---

## Limites Plan Gratuit

⚠️ **Attention**: Le plan gratuit Heroku a des limitations :

- Application en veille après 30 min d'inactivité
- PostgreSQL limité à 10k lignes
- Pas de support prioritaire

**Pour la production**, considérez un plan payant ou une alternative.

---

## Alternatives à Heroku

- **Railway**: https://railway.app (recommandé, plus simple)
- **Render**: https://render.com (gratuit avec limitations)
- **DigitalOcean**: https://www.digitalocean.com (VPS)

---

**Besoin d'aide?** Consultez [docs/HEROKU_DEPLOYMENT.md](./docs/HEROKU_DEPLOYMENT.md) pour le guide complet.
