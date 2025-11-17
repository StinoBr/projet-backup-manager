'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// Charge notre fichier de configuration JS
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;

// Initialise la connexion Sequelize en utilisant notre config
if (config.use_env_variable) {
  // Pour la production (ex: Heroku, Render...)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Pour le développement et les tests (utilise les variables de .env)
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Charge tous les fichiers de modèles (sauf index.js) depuis ce dossier
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Établit les associations entre les modèles (si définies)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exporte la connexion (sequelize) et tous les modèles (db)
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;