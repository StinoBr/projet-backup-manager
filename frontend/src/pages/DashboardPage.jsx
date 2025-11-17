import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/apiService';
import StatCard from '../components/StatCard';
import { CheckCircle, XCircle, Clock, Database, HardDrive, Archive } from 'lucide-react';
import BackupLogList from '../components/BackupLogList'; // Réutilise la liste

// Fonction pour formater la taille (copiée de BackupLogList)
const formatBytes = (bytes) => {
  if (!bytes) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dashboardApi.getStats()
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement du dashboard:", error);
        setMessage("Erreur de connexion au backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <>
        <header className="page-header"><h1>Dashboard</h1></header>
        <p>Chargement des statistiques...</p>
      </>
    );
  }

  if (message || !stats) {
    return (
      <>
        <header className="page-header"><h1>Dashboard</h1></header>
        <div className="message">{message || "Aucune statistique trouvée."}</div>
      </>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>

      {/* Grille de statistiques */}
      <div className="dashboard-grid">
        <StatCard 
          title="Sauvegardes Réussies (24h)"
          value={stats.successfulToday}
          icon={<CheckCircle size={32} />}
          color="success"
        />
        <StatCard 
          title="Sauvegardes Échouées (24h)"
          value={stats.failedToday}
          icon={<XCircle size={32} />}
          color={stats.failedToday > 0 ? "danger" : "success"}
        />
        <StatCard 
          title="Tâches Actives"
          value={stats.enabledJobs}
          subtitle={`sur ${stats.totalJobs} au total`}
          icon={<Clock size={32} />}
          color="primary"
        />
        <StatCard 
          title="Configurations BDD"
          value={stats.totalConfigs}
          icon={<Database size={32} />}
          color="warning"
        />
        <StatCard 
          title="Espace Disque Utilisé"
          value={formatBytes(stats.totalSize)}
          subtitle={`sur ${stats.totalBackups} backups`}
          icon={<HardDrive size={32} />}
          color="primary"
        />
        <StatCard 
          title="Total Sauvegardes"
          value={stats.totalBackups}
          subtitle={`${stats.failedBackups} échecs`}
          icon={<Archive size={32} />}
          color="warning"
        />
      </div>

      {/* Historique récent */}
      <main className="page-content-full" style={{marginTop: '2rem'}}>
        <section className="list-section">
          <h2>Historique Récent des Sauvegardes</h2>
          <BackupLogList 
            logs={stats.recentBackups} 
            onRestoreClick={() => {}} // Pas de restauration depuis le dashboard
          />
        </section>
      </main>
    </>
  );
}

export default DashboardPage;