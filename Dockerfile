# Utilise la dernière LTS de Node.js sous Alpine
FROM node:22-alpine

# Répertoire de travail
WORKDIR /LOG430-labo

# Copie des fichiers de dépendances et installation
COPY package*.json ./
RUN npm ci

# Copie du reste de l’application
COPY . .

# Expose le port (optionnel, à décommenter si nécessaire)
# EXPOSE 3000

# Par défaut, on lancera nodemon (la build sera gérée par docker-compose)
CMD ["npm", "run", "dev:web:docker"]