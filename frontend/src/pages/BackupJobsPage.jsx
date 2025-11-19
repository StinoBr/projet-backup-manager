import React, { useState, useEffect } from 'react';
// On importe les deux services d'API
import { backupJobApi, databaseConfigApi } from '../services/apiService';
import BackupJobForm from '../components/BackupJobForm';
import BackupJobList from '../components/BackupJobList';

function BackupJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [configs, setConfigs] = useState([]); // Pour le formulaire
  const [message, setMessage] = useState('');

  // Au chargement, on récupère les tâches ET les configs (pour le <select>)
  const fetchData = () => {
    // On utilise Promise.all pour lancer les deux requêtes en parallèle
    Promise.all([
      backupJobApi.getAll(),
      databaseConfigApi.getAll()
    ]).then(([jobsResponse, configsResponse]) => {
      setJobs(jobsResponse.data);
      setConfigs(configsResponse.data);
    }).catch(error => {
      console.error("Erreur lors du chargement des données:", error);
      setMessage("Erreur de connexion au backend.");
    });
  };

  // Exécute fetchData() une seule fois au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  // --- Logique métier (handlers) ---

  const handleCreateJob = async (formData) => {
    try {
      await backupJobApi.create(formData);
      setMessage("Tâche planifiée créée avec succès !");
      fetchData(); // Rafraîchit la liste des tâches et configs
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  const handleDeleteJob = async (id, configName) => { // AJOUT de 'configName'
    try {
      // --- AJOUT DE LA CONFIRMATION ---
      const confirmMessage = `Êtes-vous sûr de vouloir supprimer la tâche de sauvegarde pour "${configName}" ? Le planificateur s'arrêtera.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
      // --- FIN AJOUT ---

      await backupJobApi.delete(id);
      setMessage("Tâche supprimée avec succès !");
      fetchData(); // Rafraîchit la liste
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  /**
   * Gère l'activation/désactivation d'une tâche via le toggle
   */
  const handleToggleJob = async (job) => {
    try {
      // On envoie l'inverse de l'état actuel
      const updateData = { enabled: !job.enabled };
      await backupJobApi.update(job.id, updateData);
      setMessage(`Tâche pour "${job.config?.name || job.id}" mise à jour.`);
      fetchData(); // Rafraîchit
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Tâches Planifiées</h1>
      </header>
      
      {message && <div className="message">{message}</div>}

      <main className="page-content">
        <section className="form-section">
          <h2>Ajouter une Tâche</h2>
          <BackupJobForm 
            configs={configs} // On passe les BDD au formulaire
            onSubmit={handleCreateJob} 
          />
        </section>

        <section className="list-section">
          <h2>Tâches Actuelles</h2>
          <BackupJobList 
            jobs={jobs}
            onDelete={handleDeleteJob}
            onToggle={handleToggleJob}
          />
        </section>
      </main>
    </>
  );
}

export default BackupJobsPage;