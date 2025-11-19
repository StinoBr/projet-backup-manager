import React, { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react'; // Assurez-vous d'avoir ces icônes

// État initial du formulaire
const initialState = {
  databaseConfigId: '',
  schedule: '0 2 * * *', // Par défaut "tous les jours à 2h"
  storagePath: '',
  compression: true,
  enabled: true,
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
      // Idéalement, utilisez une notification toast ici
      alert("Veuillez sélectionner une base de données."); 
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="config-form improved-form">
      
      {/* SÉLECTION DE LA BDD */}
      <div className="form-group">
        <label htmlFor="databaseConfigId">Base de données cible <span className="required">*</span></label>
        <select 
          id="databaseConfigId"
          name="databaseConfigId" 
          value={formData.databaseConfigId} 
          onChange={handleChange}
          required
          className="form-control"
        >
          <option value="">-- Choisir une configuration --</option>
          {configs.map(config => (
            <option key={config.id} value={config.id}>
              {config.name} ({config.dbType} - {config.databaseName})
            </option>
          ))}
        </select>
        <p className="form-help-text">La base de données dont vous souhaitez extraire les données.</p>
      </div>
      
      {/* PLANIFICATION CRON */}
      <div className="form-group">
        <label htmlFor="schedule">Fréquence (Format Cron) <span className="required">*</span></label>
        <div className="input-with-icon">
          <input
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            placeholder="ex: 0 2 * * *"
            required
            className="form-control"
          />
        </div>
        <div className="form-help-box">
          <Info size={16} />
          <span>
            Format: <code>Minute Heure Jour Mois JourSemaine</code>. 
            <br />
            Exemple: <code>0 2 * * *</code> (Tous les jours à 02h00).
            <a 
              href="https://crontab.guru/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="help-link"
            >
              Besoin d'aide ? <ExternalLink size={12} />
            </a>
          </span>
        </div>
      </div>
      
      {/* CHEMIN DE STOCKAGE */}
      <div className="form-group">
        <label htmlFor="storagePath">Dossier de destination (Local) <span className="required">*</span></label>
        <input
          id="storagePath"
          name="storagePath"
          value={formData.storagePath}
          onChange={handleChange}
          placeholder={window.navigator.platform.includes('Win') ? "C:\\Backups\\MySQL" : "/var/backups/mysql"}
          required
          className="form-control"
        />
        <p className="form-help-text">Chemin absolu sur le serveur où les fichiers seront enregistrés.</p>
      </div>

      {/* OPTIONS FIXES (Information) */}
      <div className="form-row">
        <div className="form-group half-width">
          <label>Type de sauvegarde</label>
          <input type="text" value="Complète (Full)" disabled className="form-control disabled" />
        </div>
        <div className="form-group half-width">
          <label>Type de stockage</label>
          <input type="text" value="Disque Local" disabled className="form-control disabled" />
        </div>
      </div>
      
      {/* CHECKBOXES */}
      <div className="form-checkbox-container">
        <div className="form-checkbox-group">
          <input
            id="compression"
            name="compression"
            type="checkbox"
            checked={formData.compression}
            onChange={handleChange}
          />
          <label htmlFor="compression">
            Compresser le fichier (.zip)
          </label>
        </div>

        <div className="form-checkbox-group">
          <input
            id="enabled"
            name="enabled"
            type="checkbox"
            checked={formData.enabled}
            onChange={handleChange}
          />
          <label htmlFor="enabled">
            Activer la tâche immédiatement
          </label>
        </div>
      </div>
      
      <button type="submit" className="submit-btn">Créer la Tâche</button>
    </form>
  );
}

export default BackupJobForm;