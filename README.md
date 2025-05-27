# Raphaël Maihiot – LOG430-Labo – Projet Node.js & Jest

[![CI/CD Status](https://github.com/RaphaelMailhiot/LOG430-labo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/RaphaelMailhiot/LOG430-labo/actions/workflows/ci-cd.yml)

Un projet **Node.js** (v22+) prêt à l’emploi, intégrant **Jest** pour des tests unitaires fiables et un pipeline **CI/CD** automatisé via GitHub Actions. Clonez, installez et démarrez en quelques secondes pour développer et tester vos applications JavaScript serveur efficacement.

---

## 🚀 Prérequis

* **Node.js** v22 ou supérieur
* **npm** (fourni avec Node.js)
* **Docker** (optionnel, pour la version conteneurisée)
* Un terminal (Linux/macOS/Windows)

---

## 📥 Installation rapide

```bash
git clone https://github.com/RaphaelMailhiot/LOG430-labo.git
cd LOG430-labo
npm install
```

---

## ▶️ Démarrage

### Avec Docker (recommandé)

```bash
docker build -t log430-labo .
docker run -p 3000:3000 log430-labo
```

### Sans Docker

* **Démarrer**

  ```bash
  npm run build
  npm start
  ```
* **Mode développement** (avec nodemon)

  ```bash
  npm run build
  npm run dev
  ```

---

## 🧪 Tests unitaires & couverture

* **Lancer les tests Jest**

  ```bash
  npm test
  ```
* **Générer le rapport de couverture**

  ```bash
  npm run coverage
  ```

---

## 📁 Structure du projet

```
LOG430-labo/
├── __tests__/                  # Tests unitaires Jest
│   ├── example.test.ts
│   └── index.test.ts
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Pipeline CI/CD GitHub Actions
├── data/                       # Données persistantes (SQLite, etc.)
├── dist/                       # Fichiers compilés (TypeScript → JavaScript)
├── docs/                       # Documentation et diagrammes
├── node_modules/               # Dépendances npm
├── out/                        # Diagrammes générés, rapports, etc.
├── public/                     # Fichiers statiques
├── src/                        # Code source principal
│   ├── entities/               # Entités TypeORM (base de données)
│   │   ├── Product.ts
│   │   ├── Sale.ts
│   │   └── SaleItem.ts
│   ├── services/               # Logique métier (services)
│   │   ├── productService.ts
│   │   └── saleService.ts
│   ├── views/                  # Interface utilisateur (CLI)
│   │   └── cli.ts
│   ├── data-source.ts          # Configuration de la source de données (TypeORM)
│   ├── index.ts                # Point d’entrée principal
│   └── initData.ts             # Initialisation des données
├── .env                        # Variables d’environnement
├── package.json                # Scripts & dépendances npm
└── README.md                   # Documentation du projet
```

## ℹ️ Information supplémentaire

Cette application TypeScript utilise l'intégration continue (CI/CD) quand le code est poussé sur GitHub en quatre étape :
* Vérification de la qualité du code avec eslint
* Vérification des test unitaire Jest
* Construction de l'image Docker
* Publication de l'image sur Docker Hub