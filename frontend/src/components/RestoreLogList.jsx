import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

// Formate les dates (copié de BackupLogList)
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch (e) {
    console.warn('Date invalide dans formatDateTime:', e); 
    return 'Date invalide';
  }
};

// Affiche une icône et une couleur (copié de BackupLogList)
const LogStatus = ({ status }) => {
  switch (status) {
    case 'success':
      return <span className="log-status success"><CheckCircle size={18} /> Succès</span>;
    case 'failed':
      return <span className="log-status failed"><XCircle size={18} /> Échec</span>;
    case 'running':
      return <span className="log-status running"><Clock size={18} /> En cours</span>;
    default:
      return <span className="log-status pending">{status}</span>;
  }
};

/**
 * Affiche la liste (l'historique) des logs de RESTAURATION.
 */
function RestoreLogList({ logs }) {
  if (logs.length === 0) {
    return <p>Aucune restauration n'a encore été effectuée.</p>;
  }

  // Essaie d'extraire le nom de la BDD source (imbriqué)
  const getSourceName = (log) => {
    return log.backupLog?.job?.config?.name || 'Source inconnue';
  };
  
  // Nom de la BDD cible
  const getTargetName = (log) => {
    return log.config?.name || 'Cible inconnue';
  };

  return (
    <ul className="log-list">
      {logs.map((log) => (
        <li key={log.id} className={`log-item log-item-${log.status}`}>
          <div className="log-item-header">
            <strong>
              Restauration de "{getTargetName(log)}"
            </strong>
            <LogStatus status={log.status} />
          </div>
          <div className="log-item-body">
            <small>Cible: {getTargetName(log)}</small>
            <small>Source: "{getSourceName(log)}"</small>
            <small>Début: {formatDateTime(log.startTime)}</small>
            <small>Fin: {formatDateTime(log.endTime)}</small>
          </div>
          {log.status === 'failed' && log.message && (
            <div className="log-item-error">
              <strong>Erreur:</strong> {log.message}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default RestoreLogList;