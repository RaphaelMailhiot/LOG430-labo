# Utilise la dernière LTS de Node.js sous Alpine pour une image légère
FROM node:18-alpine

# Définit le répertoire de travail dans le conteneur
WORKDIR /LOG430-labo

# Copie uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

# Installe toutes les dépendances (y compris dev pour le build)
RUN npm ci

# Copie le reste de l’application
COPY . .

# Build le projet TypeScript
RUN npm run build:css
RUN npm run build

# Expose le port de l'app (décommente si besoin)
# EXPOSE 3000

# Commande par défaut pour démarrer l'app compilée
CMD ["npm", "run", "dev:web"]