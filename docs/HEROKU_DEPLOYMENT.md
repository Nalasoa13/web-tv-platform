# Déploiement sur Heroku - Web TV Platform

Ce guide couvre le déploiement complet de la plateforme Web TV sur Heroku.

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Heroku](#configuration-heroku)
3. [Déploiement](#déploiement)
4. [Configuration Base de Données](#configuration-base-de-données)
5. [Variables d'Environnement](#variables-denvironnement)
6. [Monitoring](#monitoring)
7. [Dépannage](#dépannage)

---

## Prérequis

### Installations Requises

```bash
# Installer Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Vérifier l'installation
heroku --version
```

### Compte Heroku

1. Créer un compte sur [heroku.com](https://www.heroku.com)
2. Vérifier votre email
3. Ajouter un moyen de paiement (même gratuit, requis pour certains services)

### Git

```bash
# Initialiser le repository Git
cd /home/ubuntu/web-tv-platform
git init
git add .
git commit -m "Initial commit: Web TV Platform"
```

---

## Configuration Heroku

### 1. Créer l'Application Heroku

```bash
# Se connecter à Heroku
heroku login

# Créer une nouvelle application
heroku create webtv-platform

# Vérifier la création
heroku apps:info
```

**Note**: Remplacez `webtv-platform` par un nom unique (ex: `webtv-myname`)

### 2. Ajouter PostgreSQL

```bash
# Ajouter PostgreSQL (plan gratuit)
heroku addons:create heroku-postgresql:hobby-dev

# Vérifier
heroku addons
```

### 3. Configurer les Buildpacks

```bash
# Ajouter les buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/static

# Vérifier
heroku buildpacks
```

---

## Déploiement

### Déploiement Initial

```bash
# Déployer vers Heroku
git push heroku main

# Ou si votre branche s'appelle master
git push heroku master
```

### Logs de Déploiement

```bash
# Voir les logs en direct
heroku logs --tail

# Voir les logs complets
heroku logs
```

### Vérifier le Statut

```bash
# Vérifier que l'application tourne
heroku ps

# Ouvrir l'application
heroku open
```

---

## Configuration Base de Données

### 1. Obtenir l'URL PostgreSQL

```bash
# Récupérer l'URL de la base de données
heroku config:get DATABASE_URL
```

### 2. Exécuter les Migrations

```bash
# Les migrations s'exécutent automatiquement au déploiement
# Mais vous pouvez aussi les exécuter manuellement

heroku run npm run migrate --prefix backend
```

### 3. Vérifier la Base de Données

```bash
# Se connecter à la base de données
heroku pg:psql

# Voir les tables
\dt

# Quitter
\q
```

---

## Variables d'Environnement

### Définir les Variables

```bash
# Définir les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-very-long-secret-key-here
heroku config:set FRONTEND_URL=https://webtv-platform.herokuapp.com
heroku config:set HLS_URL=https://webtv-platform.herokuapp.com/hls

# Vérifier les variables
heroku config
```

### Variables Importantes

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Mode production |
| `JWT_SECRET` | Clé complexe | Secret JWT |
| `FRONTEND_URL` | URL Heroku | URL du frontend |
| `HLS_URL` | URL Heroku | URL du streaming HLS |
| `PORT` | Automatique | Port (défini par Heroku) |
| `DATABASE_URL` | Automatique | URL PostgreSQL |

---

## Déploiement du Frontend

### Build du Frontend

```bash
# Le frontend est construit automatiquement lors du déploiement
# Mais vous pouvez aussi le construire manuellement

cd frontend
npm run build
cd ..
```

### Servir le Frontend

Le frontend est servi par le buildpack `heroku/static` depuis le dossier `frontend/dist`.

---

## Monitoring

### Logs

```bash
# Voir les logs en direct
heroku logs --tail

# Voir les logs des 50 dernières lignes
heroku logs -n 50

# Voir les logs d'erreur
heroku logs --source app
```

### Métriques

```bash
# Voir l'utilisation des ressources
heroku ps

# Voir les détails de l'application
heroku apps:info
```

### Restart

```bash
# Redémarrer l'application
heroku restart

# Redémarrer une dyno spécifique
heroku ps:restart web
```

---

## Mise à Jour

### Déployer une Nouvelle Version

```bash
# Faire les changements
# ...

# Committer
git add .
git commit -m "Description des changements"

# Déployer
git push heroku main
```

### Rollback

```bash
# Voir l'historique des déploiements
heroku releases

# Revenir à une version précédente
heroku rollback v5
```

---

## Dépannage

### Application ne démarre pas

```bash
# Voir les logs
heroku logs --tail

# Vérifier les variables d'environnement
heroku config

# Redémarrer
heroku restart
```

### Erreur PostgreSQL

```bash
# Vérifier la connexion à la base de données
heroku pg:info

# Exécuter les migrations
heroku run npm run migrate --prefix backend

# Se connecter à la base
heroku pg:psql
```

### Erreur de déploiement

```bash
# Voir les logs de build
heroku logs --source heroku

# Vérifier les buildpacks
heroku buildpacks

# Réinitialiser les buildpacks
heroku buildpacks:clear
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/static
```

### Problème de CORS

```bash
# Vérifier FRONTEND_URL
heroku config:get FRONTEND_URL

# Mettre à jour si nécessaire
heroku config:set FRONTEND_URL=https://webtv-platform.herokuapp.com
```

---

## Optimisation

### Réduire la Taille de l'Application

```bash
# Nettoyer les dépendances inutiles
npm prune --production

# Supprimer node_modules
rm -rf node_modules

# Réinstaller
npm install --production
```

### Améliorer les Performances

```bash
# Augmenter la mémoire (plan payant)
heroku dyno:type standard-1x

# Ajouter plusieurs workers
heroku ps:scale web=2
```

---

## Sécurité

### Changer le Secret JWT

```bash
# Générer une nouvelle clé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Définir la nouvelle clé
heroku config:set JWT_SECRET=<nouvelle-clé>

# Redémarrer
heroku restart
```

### Activer HTTPS

HTTPS est activé par défaut sur Heroku avec les certificats Let's Encrypt.

### Ajouter un Domaine Personnalisé

```bash
# Ajouter un domaine
heroku domains:add www.webtv.com

# Vérifier
heroku domains

# Configurer le DNS chez votre registraire
# Pointer vers: webtv-platform.herokuapp.com
```

---

## Limitations Heroku

### Plan Gratuit

- ⚠️ Application en veille après 30 min d'inactivité
- ⚠️ PostgreSQL limité à 10k lignes
- ⚠️ Pas de support 24/7
- ✅ Idéal pour développement et test

### Plan Payant

- ✅ Application toujours active
- ✅ PostgreSQL illimité
- ✅ Performance améliorée
- ✅ Support prioritaire

---

## Alternatives à Heroku

Si vous préférez d'autres solutions :

- **Railway**: https://railway.app (plus simple)
- **Render**: https://render.com (gratuit avec limitations)
- **DigitalOcean**: https://www.digitalocean.com (VPS classique)
- **AWS**: https://aws.amazon.com (scalable)
- **Google Cloud**: https://cloud.google.com (professionnel)

---

## Checklist de Déploiement

- [ ] Compte Heroku créé
- [ ] Heroku CLI installé
- [ ] Repository Git initialisé
- [ ] Application Heroku créée
- [ ] PostgreSQL ajouté
- [ ] Buildpacks configurés
- [ ] Variables d'environnement définies
- [ ] Déploiement initial réussi
- [ ] Migrations exécutées
- [ ] Frontend accessible
- [ ] API fonctionnelle
- [ ] Logs sans erreurs

---

## Support

Pour plus d'informations :

- **Documentation Heroku**: https://devcenter.heroku.com
- **Buildpack Node.js**: https://github.com/heroku/heroku-buildpack-nodejs
- **PostgreSQL sur Heroku**: https://devcenter.heroku.com/articles/heroku-postgresql

---

**Dernière mise à jour**: 2024  
**Version**: 1.0.0
