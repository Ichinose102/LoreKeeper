import { create } from 'zustand';
import { Note, NoteInput, Tag } from '../../shared/types';

interface VaultState {
  notes: Note[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadNotes: () => Promise<void>;
  createNote: (input: NoteInput) => Promise<Note | null>;
  updateNote: (id: string, patch: Partial<NoteInput>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  loadTags: () => Promise<void>;
  createTag: (name: string) => Promise<Tag | null>;
}

const initialState = {
  notes: [],
  tags: [],
  isLoading: false,
  error: null,
};

export const useVaultStore = create<VaultState>((set) => ({
  ...initialState,

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.electronAPI.notes.getAll();
      if (response.ok) {
        set({ notes: response.data ?? [], isLoading: false });
      } else {
        set({ error: response.error ?? 'Failed to load notes', isLoading: false });
      }
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  createNote: async (input: NoteInput) => {
    try {
      const response = await window.electronAPI.notes.create(input);
      if (response.ok && response.data) {
        set((state) => ({ notes: [...state.notes, response.data!] }));
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to create note:', err);
      return null;
    }
  },

  updateNote: async (id: string, patch: Partial<NoteInput>) => {
    try {
      const response = await window.electronAPI.notes.update(id, patch);
      if (response.ok && response.data) {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? response.data! : n)),
        }));
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to update note:', err);
      return null;
    }
  },

  deleteNote: async (id: string) => {
    try {
      const response = await window.electronAPI.notes.delete(id);
      if (response.ok) {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  },

  loadTags: async () => {
    try {
      const response = await window.electronAPI.tags.getAll();
      if (response.ok) {
        set({ tags: response.data ?? [] });
      }
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  },

  createTag: async (name: string) => {
    try {
      const response = await window.electronAPI.tags.create(name);
      if (response.ok && response.data) {
        set((state) => ({ tags: [...state.tags, response.data!] }));
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to create tag:', err);
      return null;
    }
  },
}));

// Context provider pour l'initialisation
import { createContext, useContext, useEffect, ReactNode } from 'react';

const VaultContext = createContext<VaultState | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const store = useVaultStore();

  useEffect(() => {
    store.loadNotes();
    store.loadTags();
  }, []);

  return <VaultContext.Provider value={store}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within VaultProvider');
  }
  return context;
}