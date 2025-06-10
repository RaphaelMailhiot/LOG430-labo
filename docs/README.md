# 1. Analyse des besoins

## Besoins fonctionnels

(Labo1)

1. **Recherche de produits**  
   - Recherche par identifiant, nom ou catégorie  
2. **Enregistrement d’une vente**  
   - Sélection multiple de produits  
   - Calcul du total
3. **Gestion des retours**  
   - Annulation de vente et réintégration automatique du stock  
4. **Consultation du stock en temps réel**  
   - Affichage de la disponibilité pour chaque référence  
5. **Support multi-caisses**  
   - Jusqu’à 3 caisses concurrentes
   - Transactions atomiques pour chaque vente
6. **Couche de persistance abstraite**  
   - Accès direct à la base de données via un ORM

(Labo2)

7. **Générer un rapport consolidé des ventes**
    - La maison mère peut générer un rapport détaillé des ventes de tous les magasins et stocks
8. **Consulter le stock central et d´eclencher un réapprovisionnement**
    - Un employé voit le stock central et peux faire une demande de réapprovisionnement
9. **Visualiser les performances des magasins dans un tableau de bord**
    - La maison mère peut voir les infos des magasins sur un tableau de bord
10. **Offrir une interface web minimale pour les gestionnaires**
    - Une interface web permet de gérer le POS du magasin

---

## Besoins non-fonctionnels

| Catégorie       | Exigences clés                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance** | • Temps de réponse rapide <br> • Gestion fluide de 3 transactions simultanées                           |
| **Fiabilité**   | • Rollback automatique en cas d’erreur                                                                                     |
| **Sécurité**    | • Validation stricte des saisies (IDs, quantités)                                              |
| **Maintenabilité** | • Séparation claire MVC <br> • Tests unitaires et intégration continue (CI/CD)                         |
| **Portabilité** | • Conteneurisation Docker (Dockerfile, docker-compose) pour déploiement multi-plateformes                                                            |
| **Extensibilité** | • Conception modulaire <br> • Architecture 4+1 pour adaptation future
| **Usabilité**   | • Interface console simple et intuitive <br> • Documentation complète (README, ADRs, diagrammes UML)                                                |

---

## Architecture et Technologies

- **Client/Serveur 3 tiers**  
  - Interface : application web
  - Serveur : Node.js avec Express.js
  - Base de données : PostgreSQL
- **ORM abstrait** (TypeORM)  
- **SGBD** : PostgreSQL
- **Conteneurisation** : Docker & Docker-Compose  
- **CI/CD** : GitHub Actions / GitLab CI  
- **Tests** : Jest

---

# 2. Proposition d’architecture

## Vue logique
![Diagramme de classes (PlantUML)](../out/docs/logical/class-diagram/class-diagram.svg)

## Vue des processus
![Processus de recherche d'un produit (PlantUML)](../out/docs/process/product-search/product-search.svg)
![Processus d'ajout d'un produit (PlantUML)](../out/docs/process/add-product/add-product.svg)
![Processus d'une vente (PlantUML)](../out/docs/process/record-sale/record-sale.svg)
![Processus de retour d'une vente (PlantUML)](../out/docs/process/manage-return/manage-return.svg)
![Processus de consultation de l'inventaire (PlantUML)](../out/docs/process/view-stock/view-stock.svg)

## Vue de déploiement
![Architecture locale 2-tier (PlantUML)](../out/docs/physical/local-architecture/local-architecture.svg)

## Vue d’implémentation
![Organisation des modules (PlantUML)](../out/docs/development/modules-organisation/modules-organisation.svg)

## Vue des cas d'utilisation
![Cas d'utilisation (PlantUML)](../out/docs/use-case/use-case/use-case.svg)

---

# 3. Justification des d´ecisions d’architecture (ADR)

## ADR-1 : Choix de plateform

Il faut une plateforme pour faire une service de gestion de POS avec un modèle 3-tier qui est modulaire et fiable.
La plateforme choisit est Node.js avec TypeScript parce qu'on peut utiliser npm pour facilité le développement, TypeScript est plus sécuriataire que JavaScript grâce au typage et ma connaissance de la plateforme aide le développement.

## ADR-2 : Séparation des responsabilités

Il faut une structure claire pour maintenir une évolution de l'application et séparer les différentes couches de l'application.
L'architecture adopté est inspiré des celle Modèle-Vue-Contrôleur (MVC). Cela fait en sorte que chaques couches sont séparées des autres et elles peuvent évoluer indépendamment.

## ADR-3 : Choix de m´ecanisme de base de données

Il faut une base de données pour gérer l'inventaire et les ventes.
Le type de base de données choisit est PostgreSQL parce que j'avais à la base une base de données SQLite et je devais migré vers une base de données qui est multi-utilisateurs puisqu'il y a maintenant plusieurs magasin et PostgreSQL est une base de données relationnelles ce qui facilite la migration.

# 4. Choix technologiques

- **Node.js**  
  Choisi pour sa simplicité de déploiement, sa rapidité d’exécution et la richesse de son écosystème. Permet de développer une application console portable et légère.

- **TypeScript**  
  Apporte la sécurité du typage statique, facilite la maintenance et réduit les erreurs à l’exécution. Idéal pour des projets évolutifs et fiables.

- **TypeORM**  
  Fournit une abstraction de la couche de persistance, simplifie l’accès aux données et compatible avec SQLite.

- **PostgreSQL**  
  Base de données client-serveur pour les applications à grande échelle qui est multi-utilisateurs et faite pour des multiples connexions.

- **Jest**  
  Outil de tests unitaires moderne, rapide et facile à intégrer dans un projet TypeScript. Permet d’assurer la fiabilité du code et de faciliter la maintenance.

- **Docker & Docker Compose**  
  Garantissent la portabilité et la reproductibilité de l’environnement de développement et de production. Simplifient le déploiement sur différentes plateformes sans configuration manuelle.

- **GitHub Actions / GitLab CI**  
  Intègrent l’intégration continue (CI) pour automatiser les tests et les vérifications à chaque modification du code, augmentant la fiabilité et la qualité du projet.
