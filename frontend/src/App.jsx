import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DatabaseConfigPage from './pages/DatabaseConfigPage';
import BackupJobsPage from './pages/BackupJobsPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage'; // On importe la VRAIE page
import './App.css'; 

/**
 * App.jsx gère la disposition générale ET le routing.
 */
function App() {
  
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Routes pour changer le contenu principal */}
        <Routes>
          
          {/* Page par défaut (redirige vers le dashboard ou les configs) */}
          <Route path="/" element={<DashboardPage />} /> 
          
          {/* Nos pages */}
          <Route path="/configurations" element={<DatabaseConfigPage />} />
          <Route path="/jobs" element={<BackupJobsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />

          {/* Vous pouvez ajouter une route "catch-all" 404 si vous voulez */}
          {/* <Route path="*" element={<h1>Page non trouvée</h1>} /> */}

        </Routes>
      </div>
    </div>
  );
}

export default App;