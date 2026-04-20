import React from 'react';
import styles from './Sidebar.module.css';
import logo from '../../assets/logo.png'; 
import { Home, Book, PenTool, Share2, Clock, Zap, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home size={22} />, label: 'Accueil', path: '/' },
    { icon: <Book size={22} />, label: 'Bibliothèque', path: '/vault' },
    { icon: <PenTool size={22} />, label: 'Scripts', path: '/script' },
    { icon: <Share2 size={22} />, label: 'Graphe', path: '/graph' },
    { icon: <Clock size={22} />, label: 'Chronologie', path: '/timeline' },
    { icon: <Zap size={22} />, label: 'Capture', path: '/capture' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.logoWrapper}>
          <img src={logo} alt="LoreKeeper" className={styles.logo} />
        </div>
        
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button 
              key={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.footer}>
        <button 
          className={`${styles.navItem} ${location.pathname === '/settings' ? styles.active : ''}`}
          onClick={() => navigate('/settings')}
        >
          <span className={styles.icon}><Settings size={22} /></span>
          <span className={styles.label}>Paramètres</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;