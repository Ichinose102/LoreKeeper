export interface Note {
  id: string;
  title: string;
  type: NoteType;
  content: string;
  url: string | null;
  era: string | null;
  created_at: number;
  updated_at: number;
}

export type NoteType = 'note' | 'wiki' | 'video' | 'ocr';

// Type utilitaire pour les inputs
export type NoteDbInput = Omit<Note, 'id' | 'created_at' | 'updated_at'> & {
  created_at: Date;
  updated_at: Date;
};

export interface Tag {
  id: string;
  name: string;
}

export interface NoteLink {
  source_id: string;
  target_id: string;
}

export interface TimelineEvent {
  id: string;
  note_id: string;
  era: string;
  title: string;
  event_type: string;
  position: number;
}

export interface TranscriptionChunk {
  id: string;
  note_id: string;
  timestamp_ms: number;
  text: string;
}

export interface NoteInput {
  title: string;
  type: NoteType;
  content?: string;
  url?: string;
  era?: string;
}

export interface SearchResult {
  note: Note;
  score: number;
  highlights?: string[];
}

export interface OracleMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
