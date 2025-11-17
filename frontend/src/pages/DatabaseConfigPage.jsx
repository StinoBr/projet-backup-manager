import React, { useState, useEffect } from 'react';
import { databaseConfigApi } from '../services/apiService';
import DatabaseConfigList from '../components/DatabaseConfigList';
import DatabaseConfigForm from '../components/DatabaseConfigForm';

// Ce composant contient la logique qui était avant dans App.jsx
function DatabaseConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [message, setMessage] = useState('');

  const fetchConfigs = async () => {
    try {
      const response = await databaseConfigApi.getAll();
      setConfigs(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des configs:", error);
      setMessage("Erreur de connexion au backend. Le serveur est-il lancé ?");
    }
  };

  useEffect(() => {
    databaseConfigApi.getAll()
      .then(response => {
        setConfigs(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des configs:", error);
        setMessage("Erreur de connexion au backend. Le serveur est-il lancé ?");
      });
  }, []);

  const handleCreateConfig = async (formData) => {
    try {
      await databaseConfigApi.create(formData);
      setMessage("Configuration créée avec succès !");
      fetchConfigs(); // Rafraîchit la liste
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  const handleDeleteConfig = async (id) => {
    try {
      await databaseConfigApi.delete(id);
      setMessage("Configuration supprimée avec succès !");
      fetchConfigs(); // Rafraîchit la liste
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setMessage(`Erreur: ${error.response?.data?.message || 'Inconnue'}`);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Configurations des Bases de Données</h1>
      </header>
      
      {/* Affiche un message d'état */}
      {message && <div className="message">{message}</div>}

      <main className="page-content">
        <section className="form-section">
          <h2>Ajouter une Base de Données</h2>
          <DatabaseConfigForm onSubmit={handleCreateConfig} />
        </section>

        <section className="list-section">
          <h2>Bases de Données Enregistrées</h2>
          <DatabaseConfigList 
            configs={configs} 
            onDelete={handleDeleteConfig} 
          />
        </section>
      </main>
    </>
  );
}

export default DatabaseConfigPage;