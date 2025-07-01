# Utilise l'image Node.js
FROM node:22-alpine

# Crée le dossier de l'app
WORKDIR /store-service

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste du code source
COPY . .

# Compile le TypeScript
RUN npm run build

# Expose le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]