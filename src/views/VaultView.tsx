import React, { useState } from 'react';
import { useVault } from '../store/vault.store';
import NoteCard from '../components/NoteCard';
import { NoteType } from '../../shared/types';
import styles from './VaultView.module.css';
import { Plus, Search } from 'lucide-react'; 
import { useSearch } from '../hooks/useSearch'; // 🟢 1. On importe le moteur

export default function VaultView() {
  const { notes, createNote, deleteNote } = useVault();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'note' | 'wiki' | 'video' | 'ocr'>('note');

  // 🟢 2. On initialise la recherche
  const { query, setQuery, results, isSearching } = useSearch();

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createNote({ title: newTitle, type: newType });
    setNewTitle('');
    setIsCreating(false);
  };

  // 🟢 3. On détermine ce qu'on affiche : les résultats de recherche OU toutes les notes
  const displayedNotes = query.trim().length > 0 ? results : notes;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bibliothèque</h1>
        
        {/* 🟢 4. La barre de recherche intégrée au header */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '5px 15px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Rechercher (< 100ms)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'white', outline: 'none', marginLeft: '10px' }}
          />
        </div>

        <button className={styles.primaryBtn} onClick={() => setIsCreating(true)}>
          <Plus size={18} /> Nouvelle Source
        </button>
      </header>

      {/* Formulaire de création (inchangé) */}
      {isCreating && (
         /* ... ton code existant pour .createCard ... */
         <div className={styles.createCard}>
          <input
            className={styles.input}
            type="text"
            placeholder="Titre de la note ou de la source..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <select className={styles.select} value={newType} onChange={(e) => setNewType(e.target.value as NoteType)}>
            <option value="note">Note de Script</option>
            <option value="wiki">Extrait Wiki</option>
            <option value="video">Vidéo / Audio</option>
            <option value="ocr">Capture OCR</option>
          </select>
          <div className={styles.actions}>
            <button className={styles.submitBtn} onClick={handleCreate}>Créer</button>
            <button className={styles.cancelBtn} onClick={() => setIsCreating(false)}>Annuler</button>
          </div>
        </div>
      )}

      {/* 🟢 5. Affichage dynamique : Indicateur de recherche */}
      {isSearching && <p style={{ color: 'var(--accent-teal)' }}>Analyse en cours...</p>}

      <div className={styles.grid}>
        {displayedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            {query.trim().length > 0 
              ? `Aucun résultat trouvé pour "${query}"` 
              : "Le lore est vide. Commencez à capturer des sources !"}
          </div>
        ) : (
          displayedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={deleteNote} />
          ))
        )}
      </div>
    </div>
  );
}