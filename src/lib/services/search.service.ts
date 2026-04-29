import MiniSearch from 'minisearch';
import { Note } from '../../../shared/types';
import { getAllNotes } from './db.service';

class SearchService {
  private miniSearch: MiniSearch<Note>;
  private initialized: boolean = false;

  constructor() {
    this.miniSearch = new MiniSearch({
      fields: ['title', 'content', 'type', 'tags'],
      storeFields: ['title', 'type', 'content'],
      searchOptions: { prefix: true, fuzzy: 0.2 }
    });
  }

  public async initializeIndex() {
    if (this.initialized) return;

    const notesFromDb = await getAllNotes();
    this.miniSearch.removeAll();
    this.miniSearch.addAll(notesFromDb);
    this.initialized = true;
  }

  public async search(query: string) {
    if (!this.initialized) {
      await this.initializeIndex();
    }

    if (!query || query.trim() === '') return [];
    return this.miniSearch.search(query);
  }

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
