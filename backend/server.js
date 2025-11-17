require('dotenv').config(); // Charge les variables d'environnement en premier
const http = require('http');
const app = require('./app');
// --- CORRECTION ICI ---
// On importe l'objet 'db' en entier, pas une propriété '{ db }'
const db = require('./models'); // Importe la connexion Sequelize

// --- AJOUT ICI ---
const SchedulerService = require('./jobs/schedulerService');
// --- FIN DE L'AJOUT ---

const port = process.env.PORT || 4000;
app.set('port', port);

const server = http.createServer(app);

/**
 * Fonction pour démarrer le serveur après avoir vérifié la connexion BDD.
 */
async function startServer() {
  try {
    // Teste la connexion à la base de données de notre application
    // Maintenant, 'db' est l'objet que l'on attend, et 'db.sequelize' existe.
    await db.sequelize.authenticate();
    console.log('Connexion à la base de données (PostgreSQL) établie avec succès.');

    // --- AJOUT ICI ---
    // Une fois la BDD connectée, on lance le planificateur
    SchedulerService.initialize();
    // --- FIN DE L'AJOUT ---

    // Démarre le serveur HTTP
    server.listen(port, () => {
      console.log(`Serveur en écoute sur le port ${port}`);
    });
  } catch (error) {
    console.error('Impossible de se connecter à la base de données :', error);
    process.exit(1); // Arrête l'application en cas d'échec de connexion BDD
  }
}

startServer();