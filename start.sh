#!/bin/bash

# Script de démarrage pour Web TV Platform
# Usage: ./start.sh [docker|local]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-docker}"

echo "🚀 Démarrage de Web TV Platform..."
echo "Mode: $MODE"

if [ "$MODE" = "docker" ]; then
    echo ""
    echo "📦 Utilisation de Docker Compose..."
    
    # Vérifier Docker
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas installé"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
    
    echo "🔨 Construction des images..."
    docker-compose build
    
    echo "🚀 Démarrage des services..."
    docker-compose up -d
    
    echo ""
    echo "✅ Services démarrés!"
    echo ""
    echo "📍 Accès:"
    echo "   Frontend:  http://localhost:5173"
    echo "   Backend:   http://localhost:3000"
    echo "   Nginx/HLS: http://localhost:8080"
    echo ""
    echo "🔐 Identifiants admin:"
    echo "   Email:     admin@webtv.local"
    echo "   Mot de passe: admin123"
    echo ""
    echo "📊 Voir les logs:"
    echo "   docker-compose logs -f backend"
    echo "   docker-compose logs -f postgres"
    echo ""
    echo "🛑 Arrêter les services:"
    echo "   docker-compose down"
    
elif [ "$MODE" = "local" ]; then
    echo ""
    echo "💻 Installation locale..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL n'est pas installé"
        exit 1
    fi
    
    # Vérifier Nginx
    if ! command -v nginx &> /dev/null; then
        echo "❌ Nginx n'est pas installé"
        exit 1
    fi
    
    echo "✅ Tous les prérequis sont installés"
    echo ""
    
    # Backend
    echo "📦 Installation des dépendances Backend..."
    cd "$SCRIPT_DIR/backend"
    npm install
    
    echo "🗄️  Exécution des migrations..."
    npm run migrate
    
    # Frontend
    echo "📦 Installation des dépendances Frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm install
    
    echo ""
    echo "✅ Installation terminée!"
    echo ""
    echo "🚀 Démarrage des services..."
    echo ""
    echo "Ouvrez 3 terminaux et exécutez:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd $SCRIPT_DIR/backend && npm start"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd $SCRIPT_DIR/frontend && npm run dev"
    echo ""
    echo "Terminal 3 (Nginx):"
    echo "  sudo systemctl start nginx"
    echo ""
    echo "📍 Accès:"
    echo "   Frontend:  http://localhost:5173"
    echo "   Backend:   http://localhost:3000"
    echo "   Nginx/HLS: http://localhost:8080"
    
else
    echo "❌ Mode invalide: $MODE"
    echo "Usage: ./start.sh [docker|local]"
    exit 1
fi
