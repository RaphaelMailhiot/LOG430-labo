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
├── src/                  # Code source
│   └── index.js          # Point d’entrée de l’application
├── __tests__/            # Tests unitaires Jest
│   └── example.test.js
├── .github/              # CI/CD (GitHub Actions)
│   └── workflows/ci-cd.yml
├── package.json          # Scripts & dépendances
└── README.md             # Documentation du projet
```

## ℹ️ Information supplémentaire

Cette application JavaScript utilise l'intégration continue (CI/CD) quand le code est poussé sur GitHub en quatre étape :
* Vérification de la qualité du code avec eslint
* Vérification des test unitaire Jest
* Construction de l'image Docker
* Publication de l'image sur Docker Hub