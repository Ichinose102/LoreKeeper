import { create } from 'zustand';
import { Note, NoteInput, Tag } from '../../shared/types';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

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
      const response = await fetch('/api/notes');
      const data: ApiResponse<Note[]> = await response.json();
      if (data.ok) {
        set({ notes: data.data ?? [], isLoading: false });
      } else {
        set({ error: data.error ?? 'Failed to load notes', isLoading: false });
      }
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  createNote: async (input: NoteInput) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data: ApiResponse<Note> = await response.json();
      if (data.ok && data.data) {
        set((state) => ({ notes: [...state.notes, data.data!] }));
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to create note:', err);
      return null;
    }
  },

  updateNote: async (id: string, patch: Partial<NoteInput>) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data: ApiResponse<Note> = await response.json();
      if (data.ok && data.data) {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? data.data! : n)),
        }));
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to update note:', err);
      return null;
    }
  },

  deleteNote: async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      const data: ApiResponse<void> = await response.json();
      if (data.ok) {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  },

  loadTags: async () => {
    try {
      const response = await fetch('/api/tags');
      const data: ApiResponse<Tag[]> = await response.json();
      if (data.ok) {
        set({ tags: data.data ?? [] });
      }
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  },

  createTag: async (name: string) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data: ApiResponse<Tag> = await response.json();
      if (data.ok && data.data) {
        set((state) => ({ tags: [...state.tags, data.data!] }));
        return data.data;
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