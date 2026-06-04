#!/bin/bash

# Script de déploiement Heroku pour Web TV Platform
# Usage: ./deploy-heroku.sh <app-name> <environment>

set -e

APP_NAME="${1:-webtv-platform}"
ENVIRONMENT="${2:-production}"

echo "🚀 Déploiement Web TV Platform sur Heroku"
echo "App: $APP_NAME"
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

# Se connecter à Heroku
echo "🔐 Connexion à Heroku..."
heroku login

# Créer l'application si elle n'existe pas
echo "📦 Vérification de l'application Heroku..."
if ! heroku apps:info --app=$APP_NAME &> /dev/null; then
    echo "📝 Création de l'application $APP_NAME..."
    heroku create $APP_NAME
else
    echo "✅ Application $APP_NAME existe déjà"
fi

# Ajouter PostgreSQL
echo "🗄️  Configuration PostgreSQL..."
if ! heroku addons --app=$APP_NAME | grep -q "heroku-postgresql"; then
    echo "📝 Ajout de PostgreSQL..."
    heroku addons:create heroku-postgresql:hobby-dev --app=$APP_NAME
else
    echo "✅ PostgreSQL est déjà configuré"
fi

# Configurer les buildpacks
echo "🔨 Configuration des buildpacks..."
heroku buildpacks:clear --app=$APP_NAME
heroku buildpacks:add heroku/nodejs --app=$APP_NAME
heroku buildpacks:add heroku/static --app=$APP_NAME

# Définir les variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."

# Générer un secret JWT
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

heroku config:set NODE_ENV=$ENVIRONMENT --app=$APP_NAME
heroku config:set JWT_SECRET=$JWT_SECRET --app=$APP_NAME
heroku config:set FRONTEND_URL=https://$APP_NAME.herokuapp.com --app=$APP_NAME
heroku config:set HLS_URL=https://$APP_NAME.herokuapp.com/hls --app=$APP_NAME

echo "✅ Variables d'environnement configurées"

# Initialiser Git si nécessaire
if [ ! -d .git ]; then
    echo "📝 Initialisation du repository Git..."
    git init
    git add .
    git commit -m "Initial commit: Web TV Platform"
fi

# Ajouter remote Heroku
if ! git remote | grep -q heroku; then
    echo "📝 Ajout du remote Heroku..."
    heroku git:remote --app=$APP_NAME
fi

# Déployer
echo "🚀 Déploiement en cours..."
git push heroku main || git push heroku master

# Exécuter les migrations
echo "🗄️  Exécution des migrations..."
heroku run npm run migrate --prefix backend --app=$APP_NAME

# Ouvrir l'application
echo ""
echo "✅ Déploiement réussi!"
echo ""
echo "📍 Application disponible à: https://$APP_NAME.herokuapp.com"
echo ""
echo "📊 Voir les logs:"
echo "   heroku logs --tail --app=$APP_NAME"
echo ""
echo "🔧 Gérer l'application:"
echo "   heroku open --app=$APP_NAME"
echo "   heroku ps --app=$APP_NAME"
echo ""

read -p "Voulez-vous ouvrir l'application? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    heroku open --app=$APP_NAME
fi
