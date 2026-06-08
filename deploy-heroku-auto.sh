#!/bin/bash

# Script de déploiement Heroku automatisé pour Web TV Platform
# Usage: ./deploy-heroku-auto.sh

set -e

APP_NAME="webtv-rua"
EMAIL="rianalarabe13@gmail.com"
ENVIRONMENT="production"

echo ""
echo "=========================================="
echo "  Web TV Platform - Heroku Deployment"
echo "=========================================="
echo ""
echo "App: $APP_NAME"
echo "Email: $EMAIL"
echo "Environment: $ENVIRONMENT"
echo ""

# Vérifier Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI n'est pas installé"
    echo "Installez-le: curl https://cli-assets.heroku.com/install.sh | sh"
    exit 1
fi

# Vérifier Git
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé"
    exit 1
fi

echo "✅ Tous les prérequis sont installés"
echo ""

# Configuration Git
echo "[1/8] Configuration Git..."
git config user.email "$EMAIL"
git config user.name "Rian Alarabe"

# Initialiser Git
echo "[2/8] Initialisation du repository..."
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit: Web TV Platform"
else
    echo "Repository Git déjà initialisé"
fi

# Connexion Heroku
echo "[3/8] Connexion à Heroku..."
heroku login

# Créer l'application
echo "[4/8] Création de l'application Heroku..."
heroku create $APP_NAME 2>/dev/null || echo "Application $APP_NAME existe déjà"

# Ajouter PostgreSQL
echo "[5/8] Ajout de PostgreSQL..."
heroku addons:create heroku-postgresql:hobby-dev --app=$APP_NAME 2>/dev/null || echo "PostgreSQL déjà configuré"

# Configurer les buildpacks
echo "[6/8] Configuration des buildpacks..."
heroku buildpacks:clear --app=$APP_NAME
heroku buildpacks:add heroku/nodejs --app=$APP_NAME
heroku buildpacks:add heroku/static --app=$APP_NAME

# Variables d'environnement
echo "[7/8] Configuration des variables d'environnement..."

# Générer une clé JWT
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || echo "your-secret-key-change-this")

heroku config:set NODE_ENV=$ENVIRONMENT --app=$APP_NAME
heroku config:set JWT_SECRET=$JWT_SECRET --app=$APP_NAME
heroku config:set FRONTEND_URL=https://$APP_NAME.herokuapp.com --app=$APP_NAME
heroku config:set HLS_URL=https://$APP_NAME.herokuapp.com/hls --app=$APP_NAME

# Ajouter remote Heroku
if ! git remote | grep -q heroku; then
    heroku git:remote --app=$APP_NAME
fi

# Déployer
echo "[8/8] Déploiement du code..."
git push heroku master

echo ""
echo "=========================================="
echo "  ✅ Déploiement réussi!"
echo "=========================================="
echo ""
echo "📍 URL: https://$APP_NAME.herokuapp.com"
echo ""
echo "🗄️  Exécution des migrations..."
heroku run npm run migrate --prefix backend --app=$APP_NAME

echo ""
echo "✅ Tout est prêt!"
echo ""
echo "🔐 Identifiants Admin:"
echo "   Email: admin@webtv.local"
echo "   Mot de passe: admin123"
echo ""
echo "⚠️  Changez ces identifiants après le premier accès!"
echo ""
echo "📊 Commandes utiles:"
echo "   heroku logs --tail --app=$APP_NAME"
echo "   heroku open --app=$APP_NAME"
echo "   heroku config --app=$APP_NAME"
echo ""

read -p "Voulez-vous ouvrir l'application? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    heroku open --app=$APP_NAME
fi
