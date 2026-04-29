import { db } from '../lib/db';
import { notes, tags, notesTags, noteLinks } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { Note, NoteInput, Tag } from '../../../shared/types';

// Notes CRUD
export async function getAllNotes(): Promise<Note[]> {
  const result = await db.select().from(notes);
  return result.map(row => ({
    ...row,
    created_at: row.created_at.getTime(),
    updated_at: row.updated_at.getTime(),
  })) as unknown as Note[];
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const result = await db.select().from(notes).where(eq(notes.id, id));
  if (result.length === 0) return undefined;
  const row = result[0];
  return {
    ...row,
    created_at: row.created_at.getTime(),
    updated_at: row.updated_at.getTime(),
  } as unknown as Note;
}

export async function createNote(input: NoteInput): Promise<Note> {
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

  await db.insert(notes).values({
    ...note,
    created_at: now,
    updated_at: now,
  });

  return note;
}

export async function updateNote(id: string, patch: Partial<NoteInput>): Promise<Note | undefined> {
  const now = new Date();
  await db
    .update(notes)
    .set({ ...patch, updated_at: now })
    .where(eq(notes.id, id));

  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<void> {
  await db.delete(notes).where(eq(notes.id, id));
}

// Tags
export async function getAllTags(): Promise<Tag[]> {
  const result = await db.select().from(tags);
  return result as unknown as Tag[];
}

export async function createTag(name: string): Promise<Tag> {
  const id = crypto.randomUUID();
  const tag = { id, name };
  await db.insert(tags).values(tag);
  return tag;
}

export async function addTagToNote(noteId: string, tagId: string): Promise<void> {
  await db.insert(notesTags).values({ note_id: noteId, tag_id: tagId });
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  await db
    .delete(notesTags)
    .where(and(eq(notesTags.note_id, noteId), eq(notesTags.tag_id, tagId)));
}

// Note links
export async function linkNotes(sourceId: string, targetId: string): Promise<void> {
  await db.insert(noteLinks).values({ source_id: sourceId, target_id: targetId });
}

export async function unlinkNotes(sourceId: string, targetId: string): Promise<void> {
  await db
    .delete(noteLinks)
    .where(and(eq(noteLinks.source_id, sourceId), eq(noteLinks.target_id, targetId)));
}

export async function getLinkedNotes(noteId: string): Promise<string[]> {
  const result = await db
    .select({ target_id: noteLinks.target_id })
    .from(noteLinks)
    .where(eq(noteLinks.source_id, noteId));

  return result.map(r => r.target_id);
}
