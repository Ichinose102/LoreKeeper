import React from 'react';
import styles from './SettingsView.module.css';
import { Database, Moon, Search, Key } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Paramètres</h1>
      </header>

      <div className={styles.settingsLayout}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}><Moon size={20}/> Apparence & Général</h2>
          <div className={styles.row}>
            <div>
              <span className={styles.label}>Thème Sombre Forcé</span>
              <p className={styles.desc}>LoreKeeper utilise un design natif adapté aux longues sessions.</p>
            </div>
            <span className={styles.badge}>Activé par défaut</span>
          </div>
          <div className={styles.row}>
            <div>
              <span className={styles.label}>Raccourci Moteur de Recherche</span>
            </div>
            <code className={styles.shortcut}>Ctrl + K</code>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}><Database size={20}/> Stockage Local (SQLite)</h2>
          <div className={styles.row}>
            <div>
              <span className={styles.label}>Emplacement de l'Archive</span>
            </div>
            <code className={styles.path}>C:/Users/Lore/Documents/lorekeeper.db</code>
          </div>
          <div className={styles.row}>
            <button className={styles.btnSecondary}>Sauvegarder l'Index</button>
            <button className={styles.btnDanger}>Purger la mémoire</button>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}><Key size={20}/> Intelligence Artificielle (Oracle)</h2>
          <div className={styles.row}>
            <div style={{width: '100%'}}>
              <span className={styles.label}>Clé API Anthropic (Claude)</span>
              <p className={styles.desc}>Nécessaire pour les analyses narratives et la transcription Whisper.</p>
              <input type="password" placeholder="sk-ant-..." className={styles.input} />
            </div>
          </div>
          <button className={styles.btnPrimary}>Valider la clé</button>
        </section>
      </div>
    </div>
  );
}