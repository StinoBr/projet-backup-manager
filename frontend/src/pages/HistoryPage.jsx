import React, { useState, useEffect } from 'react';
// --- MODIFICATION ---
import { backupLogApi, databaseConfigApi, restoreApi } from '../services/apiService';
import BackupLogList from '../components/BackupLogList';
import Modal from '../components/Modal';
// --- AJOUT ---
import RestoreLogList from '../components/RestoreLogList';

function HistoryPage() {
  const [backupLogs, setBackupLogs] = useState([]); // Renommé
  // --- AJOUT ---
  const [restoreLogs, setRestoreLogs] = useState([]);
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- NOUVEAUX ÉTATS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null); // Le log sur lequel on a cliqué
  const [targetConfigId, setTargetConfigId] = useState(''); // La BDD cible choisie
  const [allConfigs, setAllConfigs] = useState([]); // Pour le <select> du modal
  const [restoreMessage, setRestoreMessage] = useState(''); // Message dans le modal

  // --- CORRECTION ICI ---
  // Un seul useEffect pour charger TOUTES les données au montage.
  useEffect(() => {
    Promise.all([
      backupLogApi.getAll(),
      databaseConfigApi.getAll(), // Pour le modal
      restoreApi.getLogs() // <-- On ajoute l'historique des restaurations
    ])
      .then(([backupLogsResponse, configsResponse, restoreLogsResponse]) => {
        setBackupLogs(backupLogsResponse.data); // Renommé
        setAllConfigs(configsResponse.data);
        setRestoreLogs(restoreLogsResponse.data); // <-- On stocke
      })
      .catch(error => {
        console.error("Erreur lors du chargement de l'historique:", error);
        setMessage("Erreur de connexion au backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
      
  }, []); // Le tableau vide signifie "exécuter 1 seule fois au montage"

  // --- L'ANCIEN/DUPLICATA useEffect a été supprimé ---

  // --- NOUVELLES FONCTIONS HANDLER ---

  /**
   * Ouvre le modal de restauration pour un log spécifique.
   */
  const handleOpenRestoreModal = (log) => {
    // --- AJOUT DE DÉBOGAGE ---
    console.log("handleOpenRestoreModal_cliqué!", log);
    // --- FIN DE L'AJOUT ---

    if (log.status !== 'success') {
      setMessage("Vous ne pouvez restaurer qu'à partir d'une sauvegarde réussie.");
      return;
    }
    setSelectedLog(log);
    setIsModalOpen(true);
    setRestoreMessage(''); // Réinitialise le message du modal
    setTargetConfigId(''); // Réinitialise la sélection
  };

  /**
   * Ferme le modal.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  /**
   * Lance l'API de restauration.
   */
  const handleConfirmRestore = async () => {
    if (!targetConfigId) {
      setRestoreMessage("Erreur: Veuillez sélectionner une base de données cible.");
      return;
    }
    if (!selectedLog) return;

    setRestoreMessage("Restauration en cours... Veuillez patienter.");

    try {
      await restoreApi.start(selectedLog.id, targetConfigId);
      
      // Succès !
      setRestoreMessage("Restauration terminée avec succès !");
      // On ferme le modal après 2 secondes
      setTimeout(handleCloseModal, 2000);
      
      // On pourrait aussi rafraîchir l'historique des logs de restauration ici
      // --- AJOUT ---
      // Rafraîchissons l'historique des restaurations !
      restoreApi.getLogs().then(res => setRestoreLogs(res.data));
      // --- FIN AJOUT ---

    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      setRestoreMessage(`Échec: ${error.response?.data?.message || 'Erreur inconnue'}`);
    }
  };


  return (
    <>
      <header className="page-header">
        <h1>Historique</h1>
      </header>
      
      {message && <div className="message">{message}</div>}

      <main className="page-content-full"> {/* Layout 1 colonne */}
        
        {/* --- SECTION 1 : SAUVEGARDES --- */}
        <section className="list-section">
          <h2>Exécutions des Sauvegardes</h2>
          {isLoading ? (
            <p>Chargement de l'historique des sauvegardes...</p>
          ) : (
            <BackupLogList 
              logs={backupLogs} // Renommé
              onRestoreClick={handleOpenRestoreModal}
            />
          )}
        </section>

        {/* --- SECTION 2 : RESTAURATIONS (AJOUT) --- */}
        <section className="list-section">
          <h2>Exécutions des Restaurations</h2>
          {isLoading ? (
            <p>Chargement de l'historique des restaurations...</p>
          ) : (
            <RestoreLogList logs={restoreLogs} />
          )}
        </section>

      </main>

      {/* --- MODAL DE RESTAURATION --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Confirmer la Restauration"
      >
        {selectedLog && (
          <div className="restore-modal-content">
            <p className="restore-warning">
              <strong>ATTENTION:</strong> Vous allez écraser la base de données sélectionnée.
              <br/>
              Cette action est <strong>irréversible</strong>.
            </p>
            
            <p>
              <strong>Source:</strong> {selectedLog.job?.config?.name || 'Inconnu'} 
              <small> (Fait le {new Date(selectedLog.startTime).toLocaleString('fr-FR')})</small>
            </p>

            {/* Le sélecteur de BDD Cible */}
            <label htmlFor="targetConfig">
              <strong>Écraser la base de données suivante :</strong>
            </label>
            <select
              id="targetConfig"
              className="config-form-select" // Style simple
              value={targetConfigId}
              onChange={(e) => setTargetConfigId(e.target.value)}
            >
              <option value="">-- Sélectionnez la BDD cible --</option>
              {allConfigs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.name} ({config.username}@{config.host})
                </option>
              ))}
            </select>

            {/* Zone de message et bouton */}
            <div className="modal-footer">
              <button 
                className="restore-confirm-btn"
                onClick={handleConfirmRestore}
                disabled={!targetConfigId || restoreMessage.includes("en cours")}
              >
                Lancer la Restauration
              </button>
              {restoreMessage && (
                <span className={`restore-message ${restoreMessage.includes('Échec') ? 'error' : ''}`}>
                  {restoreMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default HistoryPage;