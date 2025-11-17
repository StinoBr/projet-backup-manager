// CHARGE LES VARIABLES DE .env AU TOUT DÉBUT
// C'est la correction clé.
require('dotenv').config();

// Ce fichier lit les variables d'environnement (process.env)
// qu'il vient de charger.

module.exports = {
  development: {
    dialect: process.env.APP_DB_DIALECT, // 'postgres'
    host: process.env.APP_DB_HOST,       // 'localhost'
    port: process.env.APP_DB_PORT,       // '5432'
    username: process.env.APP_DB_USER,   // 'postgres'
    password: process.env.APP_DB_PASSWORD, // 'root'
    database: process.env.APP_DB_NAME,   // 'backup_manager_db'
    logging: console.log,
  },
  test: {
    // Configuration pour les tests (ex: base de données séparée)
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    // Configuration pour la production (utilisera les mêmes variables d'env)
    dialect: process.env.APP_DB_DIALECT,
    host: process.env.APP_DB_HOST,
    port: process.env.APP_DB_PORT,
    username: process.env.APP_DB_USER,
    password: process.env.APP_DB_PASSWORD,
    database: process.env.APP_DB_NAME,
    logging: false, // Ne pas logger les requêtes SQL en production
  },
};