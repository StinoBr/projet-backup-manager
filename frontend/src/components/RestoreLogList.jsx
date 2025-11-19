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
 * Affiche la liste (l'historique) des logs de RESTAURATION sous forme de tableau.
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

  const hasError = logs.some(log => log.status === 'failed' && log.message);

  return (
    <div className="log-table-container">
      <table className="log-table">
        <thead>
          <tr>
            <th>BDD Cible</th>
            <th>Source de la Sauvegarde</th>
            <th>Statut</th>
            <th>Début</th>
            <th>Fin</th>
            {hasError && <th>Message</th>}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className={`log-row log-row-${log.status}`}>
              <td data-label="BDD Cible">
                {getTargetName(log)} ({log.config?.dbType})
              </td>
              <td data-label="Source Sauvegarde">
                {getSourceName(log)} 
                <small> (Du: {formatDateTime(log.backupLog?.startTime)})</small>
              </td>
              <td data-label="Statut">
                <LogStatus status={log.status} />
              </td>
              <td data-label="Début">{formatDateTime(log.startTime)}</td>
              <td data-label="Fin">{formatDateTime(log.endTime)}</td>
              {hasError && (
                <td data-label="Message" className="log-message">
                  {log.message || '-'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RestoreLogList;