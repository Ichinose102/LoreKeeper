import { Note, NoteInput, Tag } from '../../shared/types';

interface IpcResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface NotesApi {
  getAll: () => Promise<IpcResponse<Note[]>>;
  getById: (id: string) => Promise<IpcResponse<Note>>;
  create: (input: NoteInput) => Promise<IpcResponse<Note>>;
  update: (id: string, patch: Partial<NoteInput>) => Promise<IpcResponse<Note>>;
  delete: (id: string) => Promise<IpcResponse<void>>;
  link: (sourceId: string, targetId: string) => Promise<IpcResponse<void>>;
  unlink: (sourceId: string, targetId: string) => Promise<IpcResponse<void>>;
}

interface TagsApi {
  getAll: () => Promise<IpcResponse<Tag[]>>;
  create: (name: string) => Promise<IpcResponse<Tag>>;
  addToNote: (noteId: string, tagId: string) => Promise<IpcResponse<void>>;
  removeFromNote: (noteId: string, tagId: string) => Promise<IpcResponse<void>>;
}

interface SearchApi {
  query: (query: string) => Promise<IpcResponse<any>>;
}

interface MediaApi {
  transcribeYouTube: (url: string) => Promise<IpcResponse<any>>;
  getChunks: (noteId: string) => Promise<IpcResponse<any>>;
}

interface ElectronAPI {
  notes: NotesApi;
  tags: TagsApi;
  search: SearchApi;
  media: MediaApi;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
