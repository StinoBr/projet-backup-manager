const express = require('express');
const cors = require('cors');

// --- Initialisation de l'application Express ---
const app = express();

// --- Middlewares ---

// Autorise les requêtes Cross-Origin (CORS)
// À configurer plus finement pour la production
app.use(cors({
  origin: 'http://localhost:5173' // Adresse de notre frontend Vite
}));

// Parse les corps de requêtes JSON (remplace bodyParser)
app.use(express.json());

// Parse les corps de requêtes URL-encoded
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Route de "santé" pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Serveur backend fonctionnel' });
});

// --- On décommente et on ajoute nos routes ---
const databaseConfigRoutes = require('./routes/databaseConfigRoutes');
// Toute requête vers /api/database-configs sera gérée par ce routeur
app.use('/api/database-configs', databaseConfigRoutes);

// --- AJOUT ICI ---
const backupJobRoutes = require('./routes/backupJobRoutes');
// Toute requête vers /api/backup-jobs sera gérée par ce routeur
app.use('/api/backup-jobs', backupJobRoutes);

// --- AJOUT ICI ---
const backupLogRoutes = require('./routes/backupLogRoutes');
// Toute requête vers /api/backup-logs sera gérée par ce routeur
app.use('/api/backup-logs', backupLogRoutes);

// --- AJOUT ICI ---
const restoreRoutes = require('./routes/restoreRoutes');
// Toute requête vers /api/restore sera gérée par ce routeur
app.use('/api/restore', restoreRoutes);

// --- AJOUT ICI ---
const dashboardRoutes = require('./routes/dashboardRoutes');
// Toute requête vers /api/dashboard sera gérée par ce routeur
app.use('/api/dashboard', dashboardRoutes);
// --- FIN DE L'AJOUT ---


// --- Gestionnaire d'erreurs global (à ajouter plus tard) ---
// ...

module.exports = app;