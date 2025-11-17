import React from 'react';
// --- AJOUT ---
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
    // --- MODIFICATION ICI ---
    // On utilise la variable 'e' pour que le linter soit content
    // et pour nous aider à déboguer.
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
 * Affiche la liste (l'historique) des logs de sauvegarde.
 */
// --- MODIFICATION: Ajout de 'onRestoreClick' ---
function BackupLogList({ logs, onRestoreClick }) {
  if (logs.length === 0) {
    return <p>L'historique est vide. Aucune sauvegarde n'a encore été exécutée.</p>;
  }

  return (
    <ul className="log-list">
      {logs.map((log) => (
        <li key={log.id} className={`log-item log-item-${log.status}`}>
          <div className="log-item-header">
            <strong>
              {/* Le backend inclut 'job.config.name' ! */}
              Sauvegarde de "{log.job?.config?.name || 'Tâche supprimée'}"
            </strong>
            <LogStatus status={log.status} />
          </div>
          <div className="log-item-body">
            <small>Début: {formatDateTime(log.startTime)}</small>
            <small>Fin: {formatDateTime(log.endTime)}</small>
            <small>Taille: {formatBytes(log.fileSize)}</small>
            {log.filePath && <small>Fichier: {log.filePath}</small>}
          </div>
          {log.status === 'failed' && log.message && (
            <div className="log-item-error">
              <strong>Erreur:</strong> {log.message}
            </div>
          )}
          {/* --- AJOUT DU BOUTON RESTAURER --- */}
          {log.status === 'success' && (
            <div className="log-item-actions">
              <button 
                className="restore-btn"
                onClick={() => onRestoreClick(log)}
              >
                <UploadCloud size={16} /> Restaurer
              </button>
            </div>
          )}
          {/* --- FIN DE L'AJOUT --- */}
        </li>
      ))}
    </ul>
  );
}

export default BackupLogList;