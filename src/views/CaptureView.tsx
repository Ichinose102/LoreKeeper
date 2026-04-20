import React, { useState } from 'react';
import styles from './CaptureView.module.css';
import { MonitorPlay, Image as ImageIcon, DownloadCloud } from 'lucide-react';

export default function CaptureView() {
  const [url, setUrl] = useState('');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Acquisition de Lore</h1>
        <p className={styles.subtitle}>Importez vos sources depuis l'extérieur</p>
      </header>

      <div className={styles.grid}>
        {/* Module YouTube / Twitch */}
        <div className={styles.captureCard}>
          <div className={styles.iconWrapper}><MonitorPlay size={32} color="var(--accent-teal)" /></div>
          <h3>Extraction Vidéo</h3>
          <p>Transcrivez l'audio d'une vidéo YouTube ou Twitch via l'IA (Whisper).</p>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder="Collez l'URL de la vidéo ici..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={styles.input}
            />
            <button className={styles.actionBtn}>Extraire</button>
          </div>
        </div>

        {/* Module Image / OCR */}
        <div className={styles.captureCard}>
          <div className={styles.iconWrapper}><ImageIcon size={32} color="var(--accent-gold)" /></div>
          <h3>Reconnaissance d'Image (OCR)</h3>
          <p>Uploadez une capture d'écran d'un jeu, l'IA extraira le texte automatiquement.</p>
          <div className={styles.uploadArea}>
            <DownloadCloud size={24} color="var(--text-muted)" />
            <span>Glissez une image ici ou cliquez pour parcourir</span>
          </div>
        </div>
      </div>
    </div>
  );
}