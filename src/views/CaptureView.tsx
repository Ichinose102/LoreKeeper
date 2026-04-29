import { useState, useCallback } from 'react';
import styles from './CaptureView.module.css';
import { MonitorPlay, Image as ImageIcon, DownloadCloud, FileAudio, FileText, X, Check } from 'lucide-react';

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

interface DragDropState {
  isDragging: boolean;
  file: File | null;
  isProcessing: boolean;
  result: TranscriptionResult | null;
  error: string | null;
}

export default function CaptureView() {
  // YouTube state
  const [url, setUrl] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag & Drop state
  const [dragDrop, setDragDrop] = useState<DragDropState>({
    isDragging: false,
    file: null,
    isProcessing: false,
    result: null,
    error: null,
  });

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

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDrop(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDrop(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = async (file: File) => {
    setDragDrop(prev => ({ ...prev, file, isProcessing: true, error: null, result: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Déterminer le type de fichier et appeler le bon endpoint
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const isText = file.type === 'text/plain' || file.name.endsWith('.txt');

      if (isAudio || isVideo) {
        // Transcription audio/vidéo
        const response = await window.electronAPI.media.transcribeFile(file);
        if (!response.ok) {
          throw new Error(response.error || 'Erreur lors de la transcription');
        }
        setDragDrop(prev => ({ ...prev, result: response.data, isProcessing: false }));
      } else if (isImage) {
        // OCR
        const response = await window.electronAPI.media.performOCR(file);
        if (!response.ok) {
          throw new Error(response.error || 'Erreur lors de l\'OCR');
        }
        // Adapter le résultat pour correspondre à l'interface
        setDragDrop(prev => ({
          ...prev,
          result: {
            note: response.data.note,
            chunks: [{ timestamp_ms: 0, text: response.data.text }]
          },
          isProcessing: false
        }));
      } else if (isText) {
        // Import texte direct
        const text = await file.text();
        const response = await window.electronAPI.notes.create({
          title: file.name.replace('.txt', ''),
          type: 'note',
          content: text,
        });
        if (!response.ok) {
          throw new Error(response.error || 'Erreur lors de l\'import');
        }
        setDragDrop(prev => ({
          ...prev,
          result: {
            note: response.data,
            chunks: []
          },
          isProcessing: false
        }));
      } else {
        throw new Error(`Type de fichier non supporté : ${file.type}`);
      }
    } catch (err) {
      setDragDrop(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        isProcessing: false
      }));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDrop(prev => ({ ...prev, isDragging: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const clearDragDrop = () => {
    setDragDrop({
      isDragging: false,
      file: null,
      isProcessing: false,
      result: null,
      error: null,
    });
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

        {/* Module Drag & Drop */}
        <div className={styles.captureCard}>
          <div className={styles.iconWrapper}>
            <DownloadCloud size={32} color="var(--accent-gold)" />
          </div>
          <h3>Import de Fichiers</h3>
          <p>
            Glissez-déposez un fichier audio, vidéo, image ou texte pour l'importer automatiquement.
          </p>

          <div
            className={`${styles.uploadArea} ${dragDrop.isDragging ? styles.dragging : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <DownloadCloud size={24} color="var(--text-muted)" />
            <span>Glissez un fichier ici ou cliquez pour parcourir</span>
            <input
              type="file"
              id="fileInput"
              accept=".mp3,.wav,.ogg,.mp4,.webm,.png,.jpg,.jpeg,.txt"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <button
              className={styles.actionBtn}
              onClick={() => document.getElementById('fileInput')?.click()}
              style={{ marginTop: '10px' }}
            >
              Parcourir
            </button>
          </div>

          {/* File being processed */}
          {dragDrop.file && (
            <div className={styles.fileStatus}>
              <FileAudio size={16} />
              <span>{dragDrop.file.name}</span>
              {dragDrop.isProcessing && <span className={styles.processing}>Traitement en cours...</span>}
            </div>
          )}

          {/* Error */}
          {dragDrop.error && (
            <div className={styles.errorMessage}>
              <X size={16} />
              <p>{dragDrop.error}</p>
              <button onClick={clearDragDrop} className={styles.clearBtn}><X size={14} /></button>
            </div>
          )}

          {/* Success result */}
          {dragDrop.result && (
            <div className={styles.resultBox}>
              <div className={styles.resultHeader}>
                <h4>Import réussi</h4>
                <button onClick={clearDragDrop} className={styles.clearBtn}><X size={16} /></button>
              </div>
              <p className={styles.noteTitle}>
                <strong>Titre :</strong> {dragDrop.result.note.title}
              </p>
              <p className={styles.noteType}>
                <strong>Type :</strong> {dragDrop.result.note.type}
              </p>
              {dragDrop.result.note.url && (
                <p className={styles.noteUrl}>
                  <strong>URL :</strong>{' '}
                  <a href={dragDrop.result.note.url} target="_blank" rel="noopener noreferrer">
                    {dragDrop.result.note.url}
                  </a>
                </p>
              )}
              {dragDrop.result.chunks.length > 0 && (
                <div className={styles.chunksList}>
                  <strong>Contenu ({dragDrop.result.chunks.length} segment{dragDrop.result.chunks.length > 1 ? 's' : ''}) :</strong>
                  <ul>
                    {dragDrop.result.chunks.map((chunk, index) => {
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
