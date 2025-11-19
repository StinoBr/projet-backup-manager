import React, { useState, useEffect } from 'react';
import { databaseConfigApi } from '../services/apiService';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

/**
 * État initial du formulaire pour une configuration de BDD.
 */
const INITIAL_STATE = {
  id: null, // Ajout de l'ID pour l'édition
  name: '',
  dbType: 'postgres',
  host: 'localhost',
  port: 5432,
  username: '',
  password: '',
  databaseName: '',
};

/**
 * Formulaire pour créer/modifier une configuration de BDD.
 * @param {object | null} initialData - Données de la config à éditer, ou null pour une création.
 * @param {function} onSubmit - Fonction à appeler à la soumission (création ou mise à jour).
 * @param {boolean} isEditing - Vrai si en mode modification.
 */
function DatabaseConfigForm({ initialData, onSubmit, isEditing }) {
  // Le state est initialisé soit avec les données passées, soit avec l'état vide
  const [formData, setFormData] = useState(initialData || INITIAL_STATE);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); 
  const [testMessage, setTestMessage] = useState('');

  // S'assure que le formulaire se met à jour quand initialData change (mode édition)
  useEffect(() => {
    // Si on passe à null, on réinitialise. Sinon, on charge les nouvelles données.
    setFormData(initialData || INITIAL_STATE);
    setTestStatus(null);
    setTestMessage('');
  }, [initialData]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Réinitialise le statut du test dès qu'un champ change
    if (testStatus || testMessage) {
      setTestStatus(null);
      setTestMessage('');
    }
    
    // Gère le changement de type de BDD pour ajuster le port par défaut
    if (name === 'dbType' && !isEditing) {
      // Permet de changer le port par défaut uniquement lors de la création
      const defaultPort = value === 'postgres' ? 5432 : (value === 'mysql' ? 3306 : 0);
      setFormData(prev => ({ ...prev, dbType: value, port: defaultPort, [name]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    // Assure que le mot de passe est toujours un string non vide lors de la CRÉATION
    if (!isEditing && !formData.password) {
      setTestStatus('failed');
      setTestMessage("Le mot de passe est requis pour la création.");
      return;
    }
    
    onSubmit(formData);
    // Le réinitialisation se fait via useEffect si la page parente passe initialData à null
  };
  
  /**
   * Teste la connexion à la BDD via l'API.
   */
  const handleTestConnection = async () => {
    // Vérifie que tous les champs requis pour la connexion sont remplis
    const { dbType, host, port, username, password, databaseName } = formData;
    if (!dbType || !host || !port || !username || !databaseName) {
      setTestStatus('failed');
      setTestMessage("Veuillez remplir tous les champs de connexion (sauf le Nom) avant de tester.");
      return;
    }
    
    // Note: Pour l'édition, si le champ password est vide, on utilise un placeholder
    // côté backend, mais ici, on ne peut pas tester sans le vrai mdp, donc l'utilisateur
    // DOIT le saisir s'il veut tester la connexion pendant une édition.
    if (!password) {
        setTestStatus('failed');
        setTestMessage(isEditing 
            ? "Veuillez saisir le mot de passe si vous souhaitez tester la connexion." 
            : "Le mot de passe est requis pour le test.");
        return;
    }
    
    setIsTesting(true);
    setTestStatus(null);
    setTestMessage("Test en cours...");

    try {
      const response = await databaseConfigApi.testConnection(formData);
      
      setTestStatus('success');
      setTestMessage(response.data.message || "Connexion réussie !");
    } catch (error) {
      console.error("Erreur lors du test de connexion:", error);
      setTestStatus('failed');
      setTestMessage(error.response?.data?.message || "Échec de la connexion. Vérifiez les logs backend pour plus de détails.");
    } finally {
      setIsTesting(false);
    }
  };

  // La validation vérifie tous les champs sauf 'password' pour l'édition (où il est optionnel)
  const isBaseValid = formData.name && formData.host && formData.port && formData.username && formData.databaseName;
  const isFormValidForCreation = isBaseValid && formData.password;
  const isFormValidForUpdate = isBaseValid;
  const isFormValid = isEditing ? isFormValidForUpdate : isFormValidForCreation;


  return (
    <form onSubmit={handleSubmit} className="config-form improved-form">
      
      <div className="form-group">
        <label htmlFor="name">Nom de la configuration <span className="required">*</span></label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="ex: Mon Blog Prod"
          required
          className="form-control"
        />
        <p className="form-help-text">Un nom pour identifier cette base de données.</p>
      </div>

      {/* TYPE DE BDD (désactivé en édition pour éviter les problèmes de migration) */}
      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="dbType">Type de BDD <span className="required">*</span></label>
          <select 
            id="dbType"
            name="dbType" 
            value={formData.dbType} 
            onChange={handleChange}
            required
            className="form-control"
            disabled={isEditing} // Désactivé si en mode édition
          >
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite" disabled>SQLite (Non supporté)</option>
          </select>
          {isEditing && <p className="form-help-text">Non modifiable après la création.</p>}
        </div>
        
        {/* PORT */}
        <div className="form-group half-width">
          <label htmlFor="port">Port <span className="required">*</span></label>
          <input
            id="port"
            name="port"
            type="number"
            value={formData.port}
            onChange={handleChange}
            placeholder="Port"
            required
            className="form-control"
          />
        </div>
      </div>
      
      {/* HÔTE */}
      <div className="form-group">
        <label htmlFor="host">Hôte (Adresse) <span className="required">*</span></label>
        <input
          id="host"
          name="host"
          value={formData.host}
          onChange={handleChange}
          placeholder="ex: localhost ou 192.168.1.1"
          required
          className="form-control"
        />
      </div>

      {/* NOM BDD */}
      <div className="form-group">
        <label htmlFor="databaseName">Nom de la Base de Données <span className="required">*</span></label>
        <input
          id="databaseName"
          name="databaseName"
          value={formData.databaseName}
          onChange={handleChange}
          placeholder="Nom de la base de données"
          required
          className="form-control"
        />
      </div>
      
      {/* UTILISATEUR & MOT DE PASSE */}
      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="username">Utilisateur <span className="required">*</span></label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Utilisateur"
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group half-width">
          <label htmlFor="password">Mot de passe {isEditing ? "(Laisser vide pour garder l'ancien)" : <span className="required">*</span>}</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password || ''} // Assure que c'est une chaîne vide en mode édition
            onChange={handleChange}
            placeholder={isEditing ? "Entrer un nouveau mot de passe" : "Mot de passe"}
            required={!isEditing} // Requis seulement en création
            className="form-control"
          />
        </div>
      </div>
      
      {/* BOUTON DE TEST ET STATUT */}
      <div className="test-connection-group">
        <button 
          type="button" 
          onClick={handleTestConnection} 
          className={`test-btn status-${testStatus}`}
          disabled={isTesting || !isBaseValid} // Seule la base de la connexion est requise
        >
          {isTesting ? <Loader size={20} className="icon-spin" /> : 
           testStatus === 'success' ? <CheckCircle size={20} /> : 
           testStatus === 'failed' ? <XCircle size={20} /> : 
           'Tester la connexion'}
        </button>
        {testMessage && (
          <div className={`test-message status-${testStatus}`}>
            {testMessage}
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!isFormValid || isTesting}
      >
        {isEditing ? 'Modifier la Configuration' : 'Ajouter la Configuration'}
      </button>
    </form>
  );
}

export default DatabaseConfigForm;