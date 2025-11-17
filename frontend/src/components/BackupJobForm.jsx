import React, { useState } from 'react';

// État initial du formulaire
const initialState = {
  databaseConfigId: '', // Très important
  schedule: '0 2 * * *', // Par défaut "tous les jours à 2h"
  storagePath: '',
  compression: true,
  enabled: true,
  // Les types sont fixés pour l'instant (d'après notre modèle BDD)
  backupType: 'full',
  storageType: 'local',
};

/**
 * Formulaire pour créer une Tâche de Sauvegarde.
 * @param {object[]} configs - Liste des configs BDD (pour le <select>)
 * @param {function} onSubmit - Fonction à appeler à la soumission
 */
function BackupJobForm({ configs, onSubmit }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.databaseConfigId) {
      alert("Veuillez sélectionner une base de données."); // Remplacé par un message non bloquant
      return;
    }
    onSubmit(formData);
    // Optionnel: réinitialiser
    // setFormData(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="config-form">
      {/* Le champ le plus important : la liaison */}
      <label htmlFor="databaseConfigId">Base de données à sauvegarder :</label>
      <select 
        id="databaseConfigId"
        name="databaseConfigId" 
        value={formData.databaseConfigId} 
        onChange={handleChange}
        required
      >
        <option value="">-- Sélectionnez une configuration --</option>
        {/* On peuple le menu déroulant avec les configs chargées */}
        {configs.map(config => (
          <option key={config.id} value={config.id}>
            {config.name} ({config.dbType})
          </option>
        ))}
      </select>
      
      <label htmlFor="schedule">Fréquence (Cron) :</label>
      <input
        id="schedule"
        name="schedule"
        value={formData.schedule}
        onChange={handleChange}
        placeholder="Fréquence (ex: 0 2 * * *)"
        required
      />
      
      <label htmlFor="storagePath">Chemin de stockage local :</label>
      <input
        id="storagePath"
        name="storagePath"
        value={formData.storagePath}
        onChange={handleChange}
        placeholder="ex: /var/backups/mysql"
        required
      />
      
      <div className="form-checkbox-group">
        <label htmlFor="compression">
          Activer la compression (.zip) :
        </label>
        <input
          id="compression"
          name="compression"
          type="checkbox"
          checked={formData.compression}
          onChange={handleChange}
        />
      </div>

      <div className="form-checkbox-group">
        <label htmlFor="enabled">
          Tâche activée :
        </label>
        <input
          id="enabled"
          name="enabled"
          type="checkbox"
          checked={formData.enabled}
          onChange={handleChange}
        />
      </div>
      
      <button type="submit">Ajouter la Tâche</button>
    </form>
  );
}

export default BackupJobForm;