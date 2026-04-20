import { contextBridge, ipcRenderer } from 'electron';
import {
  CHANNEL_NOTES_GET_ALL,
  CHANNEL_NOTES_GET_BY_ID,
  CHANNEL_NOTES_CREATE,
  CHANNEL_NOTES_UPDATE,
  CHANNEL_NOTES_DELETE,
  CHANNEL_NOTES_LINK,
  CHANNEL_NOTES_UNLINK,
  CHANNEL_TAGS_GET_ALL,
  CHANNEL_TAGS_CREATE,
  CHANNEL_TAGS_ADD_TO_NOTE,
  CHANNEL_TAGS_REMOVE_FROM_NOTE,
} from '../shared/ipc-channels';
import { Note, NoteInput, Tag } from '../shared/types';

// Types pour l'API exposée
interface IpcResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const notesApi = {
  getAll: () => ipcRenderer.invoke(CHANNEL_NOTES_GET_ALL) as Promise<IpcResponse<Note[]>>,
  getById: (id: string) => ipcRenderer.invoke(CHANNEL_NOTES_GET_BY_ID, id) as Promise<IpcResponse<Note>>,
  create: (input: NoteInput) => ipcRenderer.invoke(CHANNEL_NOTES_CREATE, input) as Promise<IpcResponse<Note>>,
  update: (id: string, patch: Partial<NoteInput>) =>
    ipcRenderer.invoke(CHANNEL_NOTES_UPDATE, { id, patch }) as Promise<IpcResponse<Note>>,
  delete: (id: string) => ipcRenderer.invoke(CHANNEL_NOTES_DELETE, id) as Promise<IpcResponse<void>>,
  link: (sourceId: string, targetId: string) =>
    ipcRenderer.invoke(CHANNEL_NOTES_LINK, { sourceId, targetId }) as Promise<IpcResponse<void>>,
  unlink: (sourceId: string, targetId: string) =>
    ipcRenderer.invoke(CHANNEL_NOTES_UNLINK, { sourceId, targetId }) as Promise<IpcResponse<void>>,
};

const tagsApi = {
  getAll: () => ipcRenderer.invoke(CHANNEL_TAGS_GET_ALL) as Promise<IpcResponse<Tag[]>>,
  create: (name: string) => ipcRenderer.invoke(CHANNEL_TAGS_CREATE, name) as Promise<IpcResponse<Tag>>,
  addToNote: (noteId: string, tagId: string) =>
    ipcRenderer.invoke(CHANNEL_TAGS_ADD_TO_NOTE, { noteId, tagId }) as Promise<IpcResponse<void>>,
  removeFromNote: (noteId: string, tagId: string) =>
    ipcRenderer.invoke(CHANNEL_TAGS_REMOVE_FROM_NOTE, { noteId, tagId }) as Promise<IpcResponse<void>>,
};

contextBridge.exposeInMainWorld('electronAPI', {
  notes: notesApi,
  tags: tagsApi,
});
