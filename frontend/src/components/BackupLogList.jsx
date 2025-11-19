import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, UploadCloud } from 'lucide-react';

// Formate les dates
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

// Formate la taille
const formatBytes = (bytes) => {
  if (!bytes) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Affiche une icône et une couleur selon le statut
const LogStatus = ({ status }) => {
  switch (status) {
    case 'success':
      return <span className="log-status success"><CheckCircle size={18} /> Succès</span>;
    case 'failed':
      return <span className="log-status failed"><XCircle size={18} /> Échec</span>;
    case 'running':
      return <span className="log-status running"><Clock size={18} /> En cours</span>;
    case 'pending':
      return <span className="log-status pending"><AlertTriangle size={18} /> En attente</span>;
    default:
      return <span className="log-status pending">{status}</span>;
  }
};

/**
 * Affiche la liste (l'historique) des logs de sauvegarde sous forme de tableau.
 */
function BackupLogList({ logs, onRestoreClick }) {
  if (logs.length === 0) {
    return <p>L'historique est vide. Aucune sauvegarde n'a encore été exécutée.</p>;
  }
  
  const hasError = logs.some(log => log.status === 'failed' && log.message);

  return (
    <div className="log-table-container">
      <table className="log-table">
        <thead>
          <tr>
            <th>BDD Source</th>
            <th>Statut</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Taille</th>
            <th>Fichier / Chemin</th>
            {hasError && <th>Message</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className={`log-row log-row-${log.status}`}>
              <td data-label="BDD Source">
                {log.job?.config?.name || 'Tâche supprimée'}
              </td>
              <td data-label="Statut">
                <LogStatus status={log.status} />
              </td>
              <td data-label="Début">{formatDateTime(log.startTime)}</td>
              <td data-label="Fin">{formatDateTime(log.endTime)}</td>
              <td data-label="Taille">{formatBytes(log.fileSize)}</td>
              <td data-label="Chemin">{log.filePath || 'N/A'}</td>
              {hasError && (
                <td data-label="Message" className="log-message">
                  {log.message ? log.message : '-'}
                </td>
              )}
              <td data-label="Action" className="log-action">
                {log.status === 'success' && (
                  <button 
                    className="restore-btn"
                    onClick={() => onRestoreClick(log)}
                  >
                    <UploadCloud size={16} /> Restaurer
                  </button>
                )}
                {log.status !== 'success' && '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BackupLogList;