import React from 'react';
import styles from './DashboardView.module.css';
import { Search, PenTool, Share2, Book } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

export default function DashboardView() {
  const { query, setQuery, results, isSearching } = useSearch();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <img src="../assets/logo.png" alt="LoreKeeper" className={styles.logo} />
        <h1 className={styles.title}>LoreKeeper</h1>
        <p className={styles.subtitle}>Votre encyclopédie personnelle</p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.omnibox}>
          <Search className={styles.searchIcon} size={24} />
          <input 
            type="text" 
            placeholder="Rechercher dans le Lore... [Ctrl+K]" 
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {query.trim().length > 0 && (
          <div className={styles.searchResults}>
            {isSearching ? <p className={styles.loading}>Analyse...</p> : (
              results.length > 0 ? results.map(res => (
                <div key={res.id} className={styles.resultItem} onClick={() => navigate('/vault')}>
                  <span className={styles.tag}>{res.type}</span>
                  <strong>{res.title}</strong>
                </div>
              )) : <p className={styles.empty}>Aucun savoir trouvé.</p>
            )}
          </div>
        )}
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.shortcutCard} onClick={() => navigate('/script')}>
          <PenTool size={32} color="var(--accent-teal)" />
          <h3>Derniers Scripts</h3>
        </div>
        <div className={styles.shortcutCard} onClick={() => navigate('/vault')}>
          <Book size={32} color="var(--accent-gold)" />
          <h3>Sources Récentes</h3>
        </div>
        <div className={styles.shortcutCard} onClick={() => navigate('/graph')}>
          <Share2 size={32} color="var(--text-muted)" />
          <h3>Graphe de Lore</h3>
        </div>
      </div>
    </div>
  );
}