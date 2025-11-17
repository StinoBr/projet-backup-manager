import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; // <-- MODIFIÉ
import { 
  LayoutDashboard, 
  Database, 
  CalendarClock, 
  History, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

// --- MODIFICATION ---
// On utilise NavLink au lieu de 'a'
// 'active' est maintenant géré automatiquement par NavLink
const NavItem = ({ icon, to, text, expanded }) => {
  const Icon = icon; 
  
  return (
    <NavLink 
      to={to} 
      // 'className' peut être une fonction pour détecter l'état 'active'
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />
      {expanded && <span className="nav-text">{text}</span>}
      {!expanded && <div className="tooltip">{text}</div>}
    </NavLink>
  );
};

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isExpanded && <span className="logo">BackupMgr</span>}
        <button className="toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      {/* --- MODIFICATION DES NAVITEMS --- */}
      {/* On remplace 'a href' par 'to' pour le routing */}
      <nav className="sidebar-nav">
        <NavItem 
          icon={LayoutDashboard} 
          text="Dashboard" 
          to="/dashboard" // Lien de route
          expanded={isExpanded} 
        />
        <NavItem 
          icon={Database} 
          text="Configurations" 
          to="/configurations" // Lien de route
          expanded={isExpanded} 
        />
        <NavItem 
          icon={CalendarClock} 
          text="Tâches planifiées" 
          to="/jobs" // Lien de route
          expanded={isExpanded} 
        />
        <NavItem 
          icon={History} 
          text="Historique" 
          to="/history" // Lien de route
          expanded={isExpanded} 
        />
      </nav>
    </aside>
  );
}

export default Sidebar;