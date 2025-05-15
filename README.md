# Projet Jest & Node.js

[![CI/CD Status](https://github.com/RaphaelMailhiot/LOG430-labo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/RaphaelMailhiot/LOG430-labo/actions/workflows/ci-cd.yml)

Un **projet JavaScript** simple sous **Node.js** avec **Jest** pour les tests unitaires, prêt à être cloné, installé et démarré en quelques secondes.

---

## 🔧 Prérequis

- **Node.js** (v12 ou supérieur)  
- **npm** (installé avec Node.js)  
- Terminal Linux / macOS / Windows (ou équivalent)

---

## 🚀 Installation

1. **Cloner le dépôt**  
   ```bash
   git clone https://github.com/RaphaelMailhiot/LOG430-labo.git
   cd LOG430-labo
   ```

## ⚙️ Exécution

1. **Installer les dépendances**
    ```bash
    npm install
    ```

2. **Démarrage de l’application**
    ```bash
    npm start
    ```
    Pour utiliser nodemon
    ```bash
    npm dev
    ```

## 🧪 Tests

1. **Exécuter les test Jest**
    ```bash
    npm test
    ```

## 🗂️ Structure du projet

    LOG430-labo/
    ├── src/
    │ └── index.js # Point d’entrée de l’application
    ├── __tests__/ # Tests unitaires Jest
    │ └── example.test.js
    ├── package.json # Scripts & dépendances
    └── README.md # Documentation du projet
    