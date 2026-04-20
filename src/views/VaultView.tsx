import { useState } from 'react';
import { useVault } from '../store/vault.store';
import NoteCard from '../components/NoteCard';
import { NoteType } from '../../shared/types';
import './VaultView.module.css';

export default function VaultView() {
  const { notes, createNote, deleteNote } = useVault();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'note' | 'wiki' | 'video' | 'ocr'>('note');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createNote({ title: newTitle, type: newType });
    setNewTitle('');
    setIsCreating(false);
  };

  return (
    <div className="vault-view">
      <header className="view-header">
        <h2>Vault</h2>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          + New Note
        </button>
      </header>

      {isCreating && (
        <div className="create-note-form card">
          <input
            type="text"
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <select value={newType} onChange={(e) => setNewType(e.target.value as NoteType)}>
            <option value="note">Note</option>
            <option value="wiki">Wiki</option>
            <option value="video">Video</option>
            <option value="ocr">OCR</option>
          </select>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="empty-state">No notes yet. Create your first note!</p>
        ) : (
          notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={deleteNote} />
          ))
        )}
      </div>
    </div>
  );
}
