# Raphaël Maihiot – LOG430-Labo – Projet Node.js & Jest

[![CI/CD Status](https://github.com/RaphaelMailhiot/LOG430-labo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/RaphaelMailhiot/LOG430-labo/actions/workflows/ci-cd.yml)

Un projet de POS **Node.js** (v22+) prêt à l’emploi, intégrant **Jest** pour des tests unitaires fiables et un pipeline **CI/CD** automatisé via GitHub Actions.

---

## 🚀 Prérequis

* **Node.js** v22 ou supérieur
* **npm** (fourni avec Node.js)
* **Docker** v2.17 ou supérieur
* Un terminal (Linux/macOS/Windows)

---

## 📥 Installation rapide

```bash
git clone https://github.com/RaphaelMailhiot/LOG430-labo.git
cd LOG430-labo
cd frontend
npm install
npm run build:css
cd ../services/auth
npm install
cd ../inventory
npm install
cd ../products
npm install
cd ../sales
npm install
cd ../store
npm install
cd ../../
```

---

## ▶️ Démarrage

### Avec Docker (recommandé)

```bash
docker build -t log430-labo .
docker compose up --build
```

## 🧪 Tests unitaires & couverture

* **Lancer les tests Jest pour un service spécifique**

  ```bash
  # Tester le service auth
  cd services/auth
  npm test
  
  # Tester le service inventory
  cd services/inventory
  npm test
  
  # Tester le service products
  cd services/products
  npm test
  
  # Tester le service sales
  cd services/sales
  npm test
  
  # Tester le service store
  cd services/store
  npm test
  ```
* **Générer le rapport de couverture**

  ```bash
  npm run coverage
  ```

---

## 📊 Monitoring et Observabilité

### Grafana Dashboards

Pour observer les métriques du projet et des microservices, accédez à l'interface Grafana :

**URL** : http://localhost:3006

**Fonctionnalités disponibles** :
- 📈 **Métriques des microservices** : Performance et santé des services (auth, inventory, products, sales, store)
- 🔍 **Requêtes HTTP** : Temps de réponse, taux d'erreur, débit
- 💾 **Utilisation des bases de données** : Connexions, requêtes, performance
- 🐳 **Métriques Docker** : Utilisation CPU, mémoire, réseau des conteneurs
- 📊 **Dashboards personnalisés** : Visualisations des métriques métier

### Prometheus

Les métriques sont collectées par Prometheus et exposées sur :
**URL** : http://localhost:9090

### Accès aux métriques

```bash
# Vérifier que les services sont en cours d'exécution
docker compose ps

# Consulter les logs des services de monitoring
docker compose logs prometheus
docker compose logs grafana
```

## 📁 Structure du projet

```
LOG430-labo/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Pipeline CI/CD GitHub Actions
├── docs/                       # Documentation et diagrammes
│   ├── development/            # Diagrammes de développement
│   ├── logical/                # Diagrammes logiques
│   ├── physical/               # Diagrammes physiques
│   ├── process/                # Diagrammes de processus
│   ├── use-case/               # Cas d'usage
│   └── README.md               # Documentation
├── frontend/                   # Application frontend principale
│   ├── dist/                   # Fichiers compilés
│   ├── public/                 # Fichiers statiques
│   ├── src/                    # Code source TypeScript
│   │   ├── controllers/        # Contrôleurs
│   │   ├── routes/             # Routes Express
│   │   ├── views/              # Vues EJS
│   │   ├── logger.ts           # Configuration des logs
│   │   ├── metrics.ts          # Métriques Prometheus
│   │   ├── server.ts           # Serveur Express
│   │   └── start.ts            # Point d'entrée
│   ├── test/                   # Tests unitaires
│   ├── types/                  # Types TypeScript
│   ├── Dockerfile              # Image Docker frontend
│   ├── package.json            # Dépendances frontend
│   └── tsconfig.json           # Configuration TypeScript
├── services/                   # Microservices
│   ├── auth/                   # Service d'authentification
│   │   ├── src/
│   │   │   ├── controllers/    # Contrôleurs auth
│   │   │   ├── entities/       # Entités TypeORM
│   │   │   ├── middleware/     # Middleware Express
│   │   │   ├── migrations/     # Migrations base de données
│   │   │   ├── routes/         # Routes API
│   │   │   ├── swagger/        # Documentation API
│   │   │   ├── data-source.ts  # Configuration TypeORM
│   │   │   ├── index.ts        # Point d'entrée service
│   │   │   ├── migration-runner.ts
│   │   │   └── seed.ts         # Données de base
│   │   ├── test/               # Tests unitaires
│   │   ├── Dockerfile          # Image Docker service
│   │   └── package.json        # Dépendances service
│   ├── inventory/              # Service d'inventaire
│   ├── products/               # Service de produits
│   ├── sales/                  # Service de ventes
│   └── store/                  # Service de magasins
├── provisioning/               # Configuration monitoring
│   ├── dashboards/             # Dashboards Grafana
│   └── datasources/            # Sources de données
├── out/                        # Rapports et diagrammes générés
├── docker-compose.yml          # Orchestration Docker
├── kong.yml                    # Configuration API Gateway
├── nginx.conf                  # Configuration serveur web
├── prometheus.yml              # Configuration monitoring
├── .dockerignore               # Fichiers ignorés Docker
├── .eslintrc.js                # Configuration ESLint
├── .gitignore                  # Fichiers ignorés Git
└── README.md                   # Documentation du projet
```

## ℹ️ Information supplémentaire

Cette application TypeScript utilise l'intégration continue (CI/CD) quand le code est poussé sur GitHub en quatre étape :
* Vérification de la qualité du code avec eslint
* Vérification des test unitaire Jest
* Construction de l'image Docker
* Publication de l'image sur Docker Hub