import React from 'react';

/**
 * Affiche la liste des tâches de sauvegarde planifiées.
 */
function BackupJobList({ jobs, onDelete, onToggle }) {
  if (jobs.length === 0) {
    return <p>Aucune tâche planifiée trouvée.</p>;
  }

  return (
    <ul className="config-list">
      {jobs.map((job) => (
        <li key={job.id} className="config-item">
          {/* Infos sur la tâche */}
          <div className="config-info">
            <strong>
              {/* Le backend inclut 'config.name' grâce à l'association ! */}
              Sauvegarde de "{job.config?.name || 'Inconnu'}"
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
            
            <button 
              onClick={() => onDelete(job.id)} 
              className="delete-btn"
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BackupJobList;