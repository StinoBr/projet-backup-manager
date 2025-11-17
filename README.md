Projet Backup Manager

Un système complet de gestion et d'automatisation de sauvegardes de bases de données (PostgreSQL, MySQL, etc.) avec une interface web en React.

Ce projet est un "monorepo" géré par les workspaces npm, contenant :

/frontend : L'application React (Vite)

/backend : L'API (Node.js, Express, Sequelize)

Fonctionnalités

Gestion des Configurations : Enregistrez les accès à différentes BDD (Postgres, MySQL, SQLite) de manière sécurisée (mots de passe chiffrés).

Planification : Créez des tâches de sauvegarde (Jobs) avec une fréquence personnalisée (syntaxe Cron).

Exécution : Un moteur de sauvegarde (node-cron) exécute les pg_dump et mysqldump en arrière-plan.

Compression : Les sauvegardes sont automatiquement compressées (.zip).

Restauration : Restaurez n'importe quel fichier de sauvegarde sur la base de données de votre choix.

Journalisation : Un historique complet des succès et échecs des sauvegardes et des restaurations.

Dashboard : Une vue d'ensemble de l'état du système, de l'espace disque utilisé et des activités récentes.

Stack Technique

Domaine

Outil

Frontend

React (Vite), Axios, React Router, Lucide-React

Backend

Node.js, Express.js

BDD (Application)

PostgreSQL

ORM

Sequelize

Planification

node-cron

Moteur de Sauvegarde

pg_dump, mysqldump (via child_process)

Moteur de Restauration

psql, mysql (via child_process)

Utilitaires

archiver (zip), unzipper (unzip)

Prérequis

Avant de commencer, assurez-vous d'avoir installé les logiciels suivants sur votre machine de développement :

Node.js : (v18+ recommandé)

npm : (v9+ recommandé, pour la gestion des workspaces)

Git

PostgreSQL : Un serveur PostgreSQL doit être en cours d'exécution pour héberger la base de données de cette application.

⚠️ Prérequis Essentiel (Moteur de Sauvegarde)

Pour que les sauvegardes et restaurations fonctionnent, les outils en ligne de commande des bases de données que vous souhaitez gérer doivent être installés sur la machine qui fait tourner le backend et accessibles dans le PATH du système.

Pour PostgreSQL : pg_dump et psql

Pour MySQL : mysqldump et mysql

Installation

Clonez le dépôt :

git clone [URL_DE_VOTRE_DEPOT_GITHUB]
cd projet-backup-manager


Installez toutes les dépendances (frontend et backend) en une seule commande depuis la racine. (Merci aux workspaces npm !)

npm install


Configuration

La configuration se fait principalement côté backend.

Accédez au dossier backend :

cd backend


Créez le fichier d'environnement :
Créez un fichier nommé .env à la racine du dossier /backend.

Remplissez le fichier .env en vous basant sur cet exemple. Vous devez le remplir avec vos propres identifiants.

# Configuration du serveur
NODE_ENV=development
PORT=4000

# Base de données de NOTRE application (PostgreSQL)
# Assurez-vous que cette BDD existe !
APP_DB_DIALECT=postgres
APP_DB_HOST=localhost
APP_DB_PORT=5432
APP_DB_USER=votre_user_pg_local # ex: postgres
APP_DB_PASSWORD=votre_mot_de_passe_pg_local # ex: root
APP_DB_NAME=backup_manager_db

# Clé secrète pour chiffrer les mots de passe des autres BDD
# Mettez une longue chaîne aléatoire
CREDENTIAL_ENCRYPTION_KEY=votre_super_cle_secrete_de_32_octets


Créez votre base de données PostgreSQL :
Assurez-vous que la base de données (backup_manager_db dans l'exemple) existe. Vous pouvez la créer via psql ou un outil graphique (pgAdmin, DBeaver).

Exemple avec psql :

CREATE DATABASE backup_manager_db;


Exécutez les migrations de la base de données :
Cette commande va créer toutes les tables (database_configs, backup_jobs, etc.) dans votre BDD.

(Toujours depuis le dossier /backend)

npx sequelize-cli db:migrate


Lancement

Vous devez lancer le backend et le frontend dans deux terminaux séparés. Lancez les deux commandes depuis la racine du projet (projet-backup-manager/).

1. Lancer le Backend (API)

npm run dev:backend


Votre API tournera sur http://localhost:4000.

2. Lancer le Frontend (Interface)

npm run dev:frontend


Votre application React tournera sur http://localhost:5173 (ou un port similaire indiqué par Vite).