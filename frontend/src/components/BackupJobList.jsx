import React from 'react';

/**
 * Affiche la liste des tâches de sauvegarde planifiées.
 * @param {function} onDelete - Prend l'ID et le nom de la config
 */
function BackupJobList({ jobs, onDelete, onToggle }) {
  if (jobs.length === 0) {
    return <p>Aucune tâche planifiée trouvée.</p>;
  }

  return (
    <ul className="config-list">
      {jobs.map((job) => {
        const configName = job.config?.name || 'Tâche orpheline';
        return (
          <li key={job.id} className="config-item">
            {/* Infos sur la tâche */}
            <div className="config-info">
              <strong>
                Sauvegarde de "{configName}"
              </strong>
              <small>Type: {job.backupType} ({job.storageType})</small>
              <span title="Fréquence Cron">Planification: {job.schedule}</span>
              <span>Destination: {job.storagePath}</span>
            </div>
            
            {/* Actions */}
            <div className="config-actions">
              {/* Bouton Toggle pour Activer/Désactiver */}
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id={`toggle-${job.id}`}
                  checked={job.enabled}
                  onChange={() => onToggle(job)}
                />
                {/* Le label est utilisé pour créer le style du switch */}
                <label htmlFor={`toggle-${job.id}`}></label>
              </div>
              
              {/* MODIFICATION : Passage de l'ID ET du nom de la config */}
              <button 
                onClick={() => onDelete(job.id, configName)} 
                className="delete-btn"
              >
                Supprimer
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default BackupJobList;