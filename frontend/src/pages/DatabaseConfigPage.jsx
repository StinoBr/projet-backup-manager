import React, { useState, useEffect } from 'react';
import { databaseConfigApi } from '../services/apiService';
import DatabaseConfigList from '../components/DatabaseConfigList';
import DatabaseConfigForm from '../components/DatabaseConfigForm';

const INITIAL_FORM_TITLE = "Ajouter une Base de Données";
const EDIT_FORM_TITLE = "Modifier la Configuration";

function DatabaseConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [message, setMessage] = useState('');
  // NOUVEAU: État pour stocker la configuration en cours d'édition
  const [editingConfig, setEditingConfig] = useState(null); 

  const fetchConfigs = () => {
    databaseConfigApi.getAll()
      .then(response => {
        setConfigs(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des configs:", error);
        setMessage("Erreur de connexion au backend. Le serveur est-il lancé ?");
      });
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // --- Handlers CRUD ---

  const handleCreateOrUpdateConfig = async (formData) => {
    // Determine si c'est une création (POST) ou une modification (PUT)
    const isUpdate = !!formData.id;
    
    try {
      if (isUpdate) {
        // Logique de mise à jour (PUT)
        await databaseConfigApi.update(formData.id, formData);
        setMessage(`Configuration "${formData.name}" mise à jour avec succès !`);
        setEditingConfig(null); // Quitter le mode édition
      } else {
        // Logique de création (POST)
        await databaseConfigApi.create(formData);
        setMessage("Configuration créée avec succès !");
      }
      
      fetchConfigs(); // Rafraîchit la liste
    } catch (error) {
      console.error(`Erreur lors de la ${isUpdate ? 'mise à jour' : 'création'}:`, error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  const handleDeleteConfig = async (id) => {
    try {
      // AJOUTER CONFIRMATION ICI (avec Modal si on veut éviter alert())
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette configuration ?")) {
        return;
      }
      
      await databaseConfigApi.delete(id);
      setMessage("Configuration supprimée avec succès !");
      fetchConfigs(); // Rafraîchit la liste
      // Si on supprime celle qui est en cours d'édition, on annule l'édition
      if (editingConfig && editingConfig.id === id) {
        setEditingConfig(null);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  // --- Nouveaux Handlers d'Édition ---

  /**
   * Commence l'édition en passant les données sélectionnées au formulaire.
   */
  const handleEditConfig = (config) => {
    setMessage(`Édition de "${config.name}".`);
    setEditingConfig(config);
    // Note: on ne passe PAS le mot de passe dans 'editingConfig' car
    // l'API le cache. Le formulaire devra gérer cela.
  };

  /**
   * Annule le mode édition.
   */
  const handleCancelEdit = () => {
    setEditingConfig(null);
    setMessage('');
  };

  // Détermine le titre actuel de la section du formulaire
  const formTitle = editingConfig ? EDIT_FORM_TITLE : INITIAL_FORM_TITLE;

  return (
    <>
      <header className="page-header">
        <h1>Configurations des Bases de Données</h1>
      </header>
      
      {/* Affiche un message d'état */}
      {message && <div className="message">{message}</div>}

      <main className="page-content">
        <section className="form-section">
          <div className="section-header-form">
            <h2>{formTitle}</h2>
            {/* Bouton Annuler si en mode édition */}
            {editingConfig && (
              <button onClick={handleCancelEdit} className="cancel-edit-btn">
                Annuler l'édition
              </button>
            )}
          </div>
          <DatabaseConfigForm 
            // Passe la config à modifier, ou null si on crée
            initialData={editingConfig} 
            // Toujours le même handler, il gère la logique POST/PUT
            onSubmit={handleCreateOrUpdateConfig} 
            isEditing={!!editingConfig}
          />
        </section>

        <section className="list-section">
          <h2>Bases de Données Enregistrées</h2>
          <DatabaseConfigList 
            configs={configs} 
            onDelete={handleDeleteConfig} 
            onEdit={handleEditConfig} // Passe le nouveau handler
          />
        </section>
      </main>
    </>
  );
}

export default DatabaseConfigPage;