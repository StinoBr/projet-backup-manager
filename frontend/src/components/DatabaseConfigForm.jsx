import React, { useState } from 'react';

/**
 * Formulaire pour créer/modifier une configuration de BDD.
 */
function DatabaseConfigForm({ onSubmit }) {
  // État local pour gérer les champs du formulaire
  const [formData, setFormData] = useState({
    name: '',
    dbType: 'postgres',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    databaseName: '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Gère le changement de type de BDD pour ajuster le port par défaut
    if (name === 'dbType') {
      const defaultPort = value === 'postgres' ? 5432 : (value === 'mysql' ? 3306 : 0);
      setFormData(prev => ({ ...prev, dbType: value, port: defaultPort }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    // Appelle la fonction 'onSubmit' passée en prop (depuis App.jsx)
    onSubmit(formData);
    // Optionnel : réinitialiser le formulaire
    // setFormData({ ...initial state... });
  };

  return (
    <form onSubmit={handleSubmit} className="config-form">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nom (ex: Mon Blog Prod)"
        required
      />
      
      <select name="dbType" value={formData.dbType} onChange={handleChange}>
        <option value="postgres">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="sqlite">SQLite</option>
      </select>
      
      <input
        name="host"
        value={formData.host}
        onChange={handleChange}
        placeholder="Hôte (ex: localhost)"
        required
      />
      
      <input
        name="port"
        type="number"
        value={formData.port}
        onChange={handleChange}
        placeholder="Port"
        required
      />
      
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Utilisateur"
        required
      />
      
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Mot de passe"
        required
      />
      
      <input
        name="databaseName"
        value={formData.databaseName}
        onChange={handleChange}
        placeholder="Nom de la base de données"
        required
      />
      
      <button type="submit">Ajouter</button>
    </form>
  );
}

export default DatabaseConfigForm;