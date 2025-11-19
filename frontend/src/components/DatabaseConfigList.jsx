import React from 'react';
import { Pencil } from 'lucide-react';

/**
 * Affiche la liste des configurations de BDD.
 * @param {object[]} configs - Liste des configurations
 * @param {function} onDelete - Fonction de suppression
 * @param {function} onEdit - NOUVEAU: Fonction pour démarrer l'édition
 */
function DatabaseConfigList({ configs, onDelete, onEdit }) {
  if (configs.length === 0) {
    return <p>Aucune configuration de base de données trouvée.</p>;
  }

  return (
    <ul className="config-list">
      {configs.map((config) => (
        // Le li est maintenant un bouton stylisé pour l'édition
        <li 
          key={config.id} 
          className="config-item clickable-item"
        >
          <div className="config-info" onClick={() => onEdit(config)}>
            <strong>{config.name}</strong>
            <small>({config.dbType})</small>
            <span>{config.username}@{config.host}:{config.port}/{config.databaseName}</span>
          </div>
          
          <div className="config-actions">
            {/* Nouveau bouton Modifier */}
            <button 
              onClick={() => onEdit(config)}
              className="edit-btn"
              title="Modifier la configuration"
            >
              <Pencil size={18} /> Modifier
            </button>

            <button 
              onClick={() => onDelete(config.id)} 
              className="delete-btn"
              title="Supprimer la configuration"
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default DatabaseConfigList;