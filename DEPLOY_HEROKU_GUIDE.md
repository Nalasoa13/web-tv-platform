# 🚀 Guide de Déploiement Heroku - Web TV Platform

## Votre Configuration

```
App Name: webtv-rua
Email: rianalarabe13@gmail.com
URL Finale: https://webtv-rua.herokuapp.com
```

---

## Étape 1: Installer Heroku CLI

### Sur Windows
1. Télécharger: https://cli-assets.heroku.com/heroku-x64.exe
2. Exécuter l'installateur
3. Redémarrer votre ordinateur

### Sur macOS
```bash
brew install heroku/brew/heroku
```

### Sur Linux
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**Vérifier l'installation:**
```bash
heroku --version
```

---

## Étape 2: Se Connecter à Heroku

```bash
heroku login
```

Entrez vos identifiants:
- **Email**: rianalarabe13@gmail.com
- **Mot de passe**: rIANALA*2026/RUA

---

## Étape 3: Télécharger le Projet

### Option A: Télécharger l'archive

1. Télécharger `web-tv-platform.zip` ou `web-tv-platform.tar.gz`
2. Extraire le fichier
3. Ouvrir un terminal dans le dossier `web-tv-platform`

### Option B: Cloner depuis GitHub (si vous avez un repository)

```bash
git clone <votre-repository-url>
cd web-tv-platform
```

---

## Étape 4: Configurer Git

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit: Web TV Platform"

# Configurer votre identité Git
git config user.email "rianalarabe13@gmail.com"
git config user.name "Rian Alarabe"
```

---

## Étape 5: Créer l'Application Heroku

```bash
# Créer l'app
heroku create webtv-rua

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurer les buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/static
```

---

## Étape 6: Configurer les Variables d'Environnement

```bash
# Générer une clé JWT sécurisée
# Sur Windows PowerShell:
$jwt = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
echo $jwt

# Sur macOS/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Puis exécuter:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<votre-clé-générée>
heroku config:set FRONTEND_URL=https://webtv-rua.herokuapp.com
heroku config:set HLS_URL=https://webtv-rua.herokuapp.com/hls
```

---

## Étape 7: Déployer

```bash
# Ajouter le remote Heroku
heroku git:remote --app webtv-rua

# Déployer
git push heroku master
```

**Attendez 5-10 minutes** pendant que Heroku construit et déploie votre application.

---

## Étape 8: Exécuter les Migrations

```bash
heroku run npm run migrate --prefix backend
```

---

## Étape 9: Vérifier le Déploiement

```bash
# Ouvrir l'application
heroku open

# Voir les logs
heroku logs --tail
```

---

## 🎉 Accès à Votre Application

Une fois déployée, accédez à:

```
https://webtv-rua.herokuapp.com
```

### Identifiants Admin

```
Email: admin@webtv.local
Mot de passe: admin123
```

⚠️ **Important**: Changez ces identifiants après le premier accès !

---

## Commandes Utiles

```bash
# Voir les logs en direct
heroku logs --tail

# Redémarrer l'app
heroku restart

# Voir les variables d'environnement
heroku config

# Se connecter à la base de données
heroku pg:psql

# Voir les processus
heroku ps

# Voir les informations de l'app
heroku apps:info
```

---

## Dépannage

### L'app ne démarre pas

```bash
# Voir les logs
heroku logs --tail

# Redémarrer
heroku restart
```

### Erreur de base de données

```bash
# Vérifier la connexion
heroku pg:info

# Exécuter les migrations
heroku run npm run migrate --prefix backend
```

### Erreur de déploiement

```bash
# Voir les logs de build
heroku logs --source heroku

# Réinitialiser les buildpacks
heroku buildpacks:clear
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/static
```

---

## Limitations du Plan Gratuit

⚠️ **Attention**: Le plan gratuit Heroku a des limitations :

- **Veille**: Application en veille après 30 min d'inactivité
- **BD**: PostgreSQL limité à 10k lignes
- **Support**: Pas de support prioritaire

**Pour la production**, considérez un plan payant (7$/mois minimum).

---

## Upgrade vers Plan Payant

```bash
# Voir les plans disponibles
heroku dyno:type

# Upgrade (ex: standard-1x)
heroku dyno:type standard-1x

# Voir les coûts
heroku billing
```

---

## Ajouter un Domaine Personnalisé

Si vous avez un domaine (ex: webtv.com) :

```bash
# Ajouter le domaine
heroku domains:add www.webtv.com

# Vérifier
heroku domains

# Configurer le DNS chez votre registraire
# Pointer vers: webtv-rua.herokuapp.com
```

---

## Mise à Jour de l'Application

Pour déployer une nouvelle version:

```bash
# Faire les changements
# ...

# Committer
git add .
git commit -m "Description des changements"

# Déployer
git push heroku master
```

---

## Support

- 📖 Documentation Heroku: https://devcenter.heroku.com
- 🆘 Support Heroku: https://help.heroku.com
- 💬 Community: https://help.heroku.com/articles/getting-help-with-heroku

---

**Prêt à déployer ?** Suivez les étapes ci-dessus et votre site sera en ligne en quelques minutes ! 🚀
