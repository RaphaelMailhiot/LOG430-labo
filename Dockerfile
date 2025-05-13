# Utilise la dernière LTS de Node.js sous Alpine pour une image légère
FROM node:18-alpine

# Définit le répertoire de travail dans le conteneur
WORKDIR /LOG430-labo

# Copie uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

# Installe les dépendances en mode production (ignorer devDependencies)
RUN npm ci --only=production

# Copie le reste de l’application (src/, __tests__/, README.md, etc.)
COPY . .

# Si votre app écoute sur un port, décommentez la ligne suivante (ex : 3000)
# EXPOSE 3000

# Commande par défaut pour démarrer votre application
# Soit via npm start, soit directement avec node
CMD ["npm", "start"]
