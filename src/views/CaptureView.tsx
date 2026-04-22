import { useState } from 'react';
import styles from './CaptureView.module.css';
import { MonitorPlay, Image as ImageIcon, DownloadCloud } from 'lucide-react';

interface TranscriptionChunk {
  timestamp_ms: number;
  text: string;
}

interface TranscriptionResult {
  note: {
    id: string;
    title: string;
    type: string;
    content: string;
    url: string | null;
  };
  chunks: TranscriptionChunk[];
}

export default function CaptureView() {
  const [url, setUrl] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranscribe = async () => {
    if (!url.trim()) return;

    setIsTranscribing(true);
    setError(null);
    setTranscriptionResult(null);

    try {
      const response = await window.electronAPI.media.transcribeYouTube(url);

      if (!response.ok) {
        throw new Error(response.error || 'Erreur lors de la transcription');
      }

      setTranscriptionResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Acquisition de Lore</h1>
        <p className={styles.subtitle}>Importez vos sources depuis l'extérieur</p>
      </header>

      <div className={styles.grid}>
        {/* Module YouTube / Twitch */}
        <div className={styles.captureCard}>
          <div className={styles.iconWrapper}>
            <MonitorPlay size={32} color="var(--accent-teal)" />
          </div>
          <h3>Extraction Vidéo</h3>
          <p>Transcrivez l'audio d'une vidéo YouTube ou Twitch via l'IA (Whisper).</p>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Collez l'URL de la vidéo ici..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={styles.input}
              disabled={isTranscribing}
            />
            <button
              className={styles.actionBtn}
              onClick={handleTranscribe}
              disabled={isTranscribing || !url.trim()}
            >
              {isTranscribing ? 'Extraction en cours...' : 'Extraire'}
            </button>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
            </div>
          )}

          {transcriptionResult && (
            <div className={styles.resultBox}>
              <h4>Transcription réussie</h4>
              <p className={styles.noteTitle}>
                <strong>Titre :</strong> {transcriptionResult.note.title}
              </p>
              <p className={styles.noteUrl}>
                <strong>URL :</strong>{' '}
                <a href={transcriptionResult.note.url ?? ''} target="_blank" rel="noopener noreferrer">
                  {transcriptionResult.note.url ?? 'N/A'}
                </a>
              </p>
              <div className={styles.chunksList}>
                <strong>Segments ({transcriptionResult.chunks.length}) :</strong>
                <ul>
                  {transcriptionResult.chunks.map((chunk, index) => {
                    const minutes = Math.floor(chunk.timestamp_ms / 60000);
                    const seconds = Math.floor((chunk.timestamp_ms % 60000) / 1000);
                    const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    return (
                      <li key={index}>
                        <span className={styles.timestamp}>{timeLabel}</span>
                        <span className={styles.text}>{chunk.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Module Image / OCR */}
        <div className={styles.captureCard}>
          <div className={styles.iconWrapper}>
            <ImageIcon size={32} color="var(--accent-gold)" />
          </div>
          <h3>Reconnaissance d'Image (OCR)</h3>
          <p>
            Uploadez une capture d'écran d'un jeu, l'IA extraira le texte automatiquement.
          </p>
          <div className={styles.uploadArea}>
            <DownloadCloud size={24} color="var(--text-muted)" />
            <span>Glissez une image ici ou cliquez pour parcourir</span>
          </div>
        </div>
      </div>
    </div>
  );
}
