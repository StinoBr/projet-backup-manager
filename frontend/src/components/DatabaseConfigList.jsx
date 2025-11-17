import React from 'react';

/**
 * Affiche la liste des configurations de BDD.
 */
function DatabaseConfigList({ configs, onDelete }) {
  if (configs.length === 0) {
    return <p>Aucune configuration de base de données trouvée.</p>;
  }

  return (
    <ul className="config-list">
      {configs.map((config) => (
        <li key={config.id} className="config-item">
          <div className="config-info">
            <strong>{config.name}</strong>
            <small>({config.dbType})</small>
            <span>{config.username}@{config.host}:{config.port}/{config.databaseName}</span>
          </div>
          <button 
            onClick={() => onDelete(config.id)} 
            className="delete-btn"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

export default DatabaseConfigList;