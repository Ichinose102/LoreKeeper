import { Note } from '../../shared/types';
import './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => Promise<void>;
}

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const typeColors: Record<Note['type'], string> = {
    note: 'var(--accent-gold)',
    wiki: 'var(--teal)',
    video: '#9b59b6',
    ocr: '#e67e22',
  };

  return (
    <div className="note-card card">
      <div className="note-card-header">
        <span
          className="note-type-badge"
          style={{ backgroundColor: typeColors[note.type] }}
        >
          {note.type}
        </span>
        <button className="btn-delete" onClick={() => onDelete(note.id)}>
          ×
        </button>
      </div>
      <h3 className="note-title">{note.title}</h3>
      {note.era && <p className="note-era">{note.era}</p>}
      <p className="note-preview">
        {note.content.slice(0, 100)}
        {note.content.length > 100 ? '...' : ''}
      </p>
      <div className="note-meta">
        <span className="note-date">
          {new Date(note.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
