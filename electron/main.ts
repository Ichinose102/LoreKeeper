import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
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
  CHANNEL_SEARCH_QUERY,
  CHANNEL_MEDIA_TRANSCRIBE,
  CHANNEL_MEDIA_TRANSCRIBE_FILE,
  CHANNEL_MEDIA_GET_CHUNKS,
} from '../shared/ipc-channels';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getAllTags,
  createTag,
  addTagToNote,
  removeTagFromNote,
  linkNotes,
  unlinkNotes,
  getDb,
} from './services/db.service';
import { searchService } from './services/search.service';
import { transcribeYouTubeVideo, transcribeFile, performOCR } from './services/media.service';
import { NoteInput } from '../shared/types';
import { FileData } from './services/media.service';
import { transcriptionChunks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // 🟢 NOUVEAU: Initialisation du moteur de recherche < 100ms au démarrage
  try {
    const notes = getAllNotes();
    searchService.initializeIndex(notes);
    console.log(`[Main] Moteur de recherche initialisé avec ${notes.length} notes.`);
  } catch (error) {
    console.error(`[Main] Erreur lors de l'initialisation de la recherche :`, error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==========================================
// IPC Handlers - Search (🟢 NOUVEAU)
// ==========================================
ipcMain.handle(CHANNEL_SEARCH_QUERY, (_, query: string) => {
  try {
    const results = searchService.search(query);
    return { ok: true, data: results };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

// ==========================================
// IPC Handlers - Notes
// ==========================================
ipcMain.handle(CHANNEL_NOTES_GET_ALL, () => {
  try {
    const notes = getAllNotes();
    return { ok: true, data: notes };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_NOTES_GET_BY_ID, (_, id: string) => {
  try {
    const note = getNoteById(id);
    if (!note) {
      return { ok: false, error: 'Note not found' };
    }
    return { ok: true, data: note };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_NOTES_CREATE, (_, input: NoteInput) => {
  try {
    const note = createNote(input);
    // 🟢 NOUVEAU: On met à jour l'index en RAM après une création !
    searchService.addNoteToIndex(note); 
    return { ok: true, data: note };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_NOTES_UPDATE, (_, { id, patch }: { id: string; patch: Partial<NoteInput> }) => {
  try {
    const note = updateNote(id, patch);
    if (!note) {
      return { ok: false, error: 'Note not found' };
    }
    // 🟢 NOUVEAU: On met à jour l'index en RAM après modification !
    searchService.updateNoteInIndex(note);
    return { ok: true, data: note };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_NOTES_DELETE, (_, id: string) => {
  try {
    deleteNote(id);
    // 🟢 NOUVEAU: On retire la note de l'index en RAM
    searchService.removeNoteFromIndex(id);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_NOTES_LINK, (_, { sourceId, targetId }: { sourceId: string; targetId: string }) => {
  try {
    linkNotes(sourceId, targetId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_NOTES_UNLINK, (_, { sourceId, targetId }: { sourceId: string; targetId: string }) => {
  try {
    unlinkNotes(sourceId, targetId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

// ==========================================
// IPC Handlers - Tags
// ==========================================
ipcMain.handle(CHANNEL_TAGS_GET_ALL, () => {
  try {
    const tags = getAllTags();
    return { ok: true, data: tags };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_TAGS_CREATE, (_, name: string) => {
  try {
    const tag = createTag(name);
    return { ok: true, data: tag };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_TAGS_ADD_TO_NOTE, (_, { noteId, tagId }: { noteId: string; tagId: string }) => {
  try {
    addTagToNote(noteId, tagId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_TAGS_REMOVE_FROM_NOTE, (_, { noteId, tagId }: { noteId: string; tagId: string }) => {
  try {
    removeTagFromNote(noteId, tagId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

// ==========================================
// IPC Handlers - Media
// ==========================================
ipcMain.handle(CHANNEL_MEDIA_TRANSCRIBE, async (_, url: string) => {
  try {
    const result = await transcribeYouTubeVideo(url);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_MEDIA_GET_CHUNKS, (_, noteId: string) => {
  try {
    const db = getDb();
    const chunks = db.select().from(transcriptionChunks).where(eq(transcriptionChunks.note_id, noteId)).all();
    return { ok: true, data: chunks };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_MEDIA_TRANSCRIBE_FILE, async (_, file: File) => {
  try {
    const result = await transcribeFile(file);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});

ipcMain.handle(CHANNEL_MEDIA_OCR, async (_, file: File) => {
  try {
    const result = await performOCR(file);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
});