import React from 'react';
import styles from './ExportView.module.css';
import { FileText, Download } from 'lucide-react';

export default function ExportView() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Exportation</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.exportCard}>
          <div className={styles.cardHeader}>
            <FileText size={24} color="var(--accent-gold)" />
            <h2>Script : L'Origine de la Guerre</h2>
          </div>
          
          <div className={styles.biblioPreview}>
            <h3>Bibliographie Générée :</h3>
            <ul>
              <li>[1] Wiki: La Fracture (Extrait)</li>
              <li>[2] Vidéo: VaatiVidya (Timestamp 12:04)</li>
              <li>[3] Jeu: Description "Marteau de Marika"</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnPrimary}><Download size={18} /> Exporter en Markdown (.md)</button>
            <button className={styles.btnSecondary}>Copier la Bibliographie</button>
          </div>
        </div>
      </div>
    </div>
  );
}