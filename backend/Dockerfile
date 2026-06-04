FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p uploads migrations

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
