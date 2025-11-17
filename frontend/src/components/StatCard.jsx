import React from 'react';

/**
 * Affiche une "carte" de statistique pour le Dashboard.
 * @param {string} title - Titre de la carte (ex: "Tâches Actives")
 * @param {string|number} value - La valeur à afficher (ex: 5)
 * @param {string} [subtitle] - Texte secondaire (ex: "sur 10 au total")
 * @param {React.ReactNode} [icon] - Une icône lucide
 * @param {string} [color] - 'primary', 'success', 'danger', 'warning'
 */
function StatCard({ title, value, subtitle, icon, color = 'primary' }) {
  return (
    <div className={`stat-card color-${color}`}>
      <div className="stat-card-icon">
        {icon}
      </div>
      <div className="stat-card-content">
        <span className="stat-card-value">{value}</span>
        <h3 className="stat-card-title">{title}</h3>
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

export default StatCard;