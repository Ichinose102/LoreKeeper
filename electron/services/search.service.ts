import MiniSearch from 'minisearch';
import { Note } from '../../shared/types';

class SearchService {
  private miniSearch: MiniSearch<Note>;

  constructor() {
    this.miniSearch = new MiniSearch({
      fields: ['title', 'content', 'type', 'tags'],
      storeFields: ['title', 'type', 'content'],
      searchOptions: { prefix: true, fuzzy: 0.2 }
    });
  }

  public initializeIndex(notesFromDb: Note[]) {
    this.miniSearch.removeAll();
    this.miniSearch.addAll(notesFromDb);
  }

  public search(query: string) {
    if (!query || query.trim() === '') return [];
    return this.miniSearch.search(query);
  }

  // 🟢 AJOUTE CES 3 FONCTIONS CRUCIALES POUR LA SYNCHRONISATION
  public addNoteToIndex(note: Note) {
    if (!this.miniSearch.has(note.id)) {
      this.miniSearch.add(note);
    }
  }

  public updateNoteInIndex(note: Note) {
    if (this.miniSearch.has(note.id)) {
      this.miniSearch.replace(note);
    }
  }

  public removeNoteFromIndex(noteId: string) {
    if (this.miniSearch.has(noteId)) {
      this.miniSearch.discard(noteId);
    }
  }
}

export const searchService = new SearchService();