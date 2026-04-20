import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { notes, tags, notesTags, noteLinks, timelineEvents, transcriptionChunks } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { Note, NoteInput, Tag } from '../../shared/types';

const DB_PATH = 'lorekeeper.db';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteDb: Database.Database | null = null;

export function getDb() {
  if (!dbInstance) {
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    dbInstance = drizzle(sqliteDb, {
      schema: {
        notes,
        tags,
        notesTags,
        noteLinks,
        timelineEvents,
        transcriptionChunks,
      },
    });
  }
  return dbInstance;
}

export function getSqliteDb() {
  if (!sqliteDb) {
    getDb();
  }
  return sqliteDb!;
}

// Notes CRUD
export function getAllNotes(): Note[] {
  const result = getDb().select().from(notes).all();
  return result as unknown as Note[];
}

export function getNoteById(id: string): Note | undefined {
  const result = getDb().select().from(notes).where(eq(notes.id, id)).get();
  return result as unknown as Note | undefined;
}

export function createNote(input: NoteInput): Note {
  const id = crypto.randomUUID();
  const now = new Date();
  const note: Note = {
    ...input,
    id,
    content: input.content ?? '',
    url: input.url ?? null,
    era: input.era ?? null,
    created_at: now.getTime(),
    updated_at: now.getTime(),
  };
  getDb().insert(notes).values({
    ...note,
    created_at: now,
    updated_at: now,
  }).run();
  return note;
}

export function updateNote(id: string, patch: Partial<NoteInput>): Note | undefined {
  const now = new Date();
  getDb()
    .update(notes)
    .set({ ...patch, updated_at: now })
    .where(eq(notes.id, id))
    .run();
  return getNoteById(id);
}

export function deleteNote(id: string): void {
  getDb().delete(notes).where(eq(notes.id, id)).run();
}

// Tags
export function getAllTags(): Tag[] {
  const result = getDb().select().from(tags).all();
  return result as unknown as Tag[];
}

export function createTag(name: string): Tag {
  const id = crypto.randomUUID();
  const tag = { id, name };
  getDb().insert(tags).values(tag).run();
  return tag;
}

export function addTagToNote(noteId: string, tagId: string): void {
  getDb().insert(notesTags).values({ note_id: noteId, tag_id: tagId }).run();
}

export function removeTagFromNote(noteId: string, tagId: string): void {
  getDb()
    .delete(notesTags)
    .where(and(eq(notesTags.note_id, noteId), eq(notesTags.tag_id, tagId)))
    .run();
}

// Note links
export function linkNotes(sourceId: string, targetId: string): void {
  getDb().insert(noteLinks).values({ source_id: sourceId, target_id: targetId }).run();
}

export function unlinkNotes(sourceId: string, targetId: string): void {
  getDb()
    .delete(noteLinks)
    .where(and(eq(noteLinks.source_id, sourceId), eq(noteLinks.target_id, targetId)))
    .run();
}

export function getLinkedNotes(noteId: string): string[] {
  const result = getDb()
    .select({ target_id: noteLinks.target_id })
    .from(noteLinks)
    .where(eq(noteLinks.source_id, noteId))
    .all();
  return result.map((r) => r.target_id);
}
