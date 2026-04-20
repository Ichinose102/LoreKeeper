import { NavLink } from 'react-router-dom';
import './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">LoreKeeper</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📚</span>
          <span>Vault</span>
        </NavLink>
        <NavLink to="/capture" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📥</span>
          <span>Capture</span>
        </NavLink>
        <NavLink to="/graph" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">🕸️</span>
          <span>Graph</span>
        </NavLink>
        <NavLink to="/timeline" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">⏳</span>
          <span>Timeline</span>
        </NavLink>
        <NavLink to="/script" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📜</span>
          <span>Script</span>
        </NavLink>
        <NavLink to="/export" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📤</span>
          <span>Export</span>
        </NavLink>
      </nav>
    </aside>
  );
}
