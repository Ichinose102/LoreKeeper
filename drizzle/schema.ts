import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// Notes - sources de lore
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type', { enum: ['note', 'wiki', 'video', 'ocr'] }).notNull(),
  content: text('content').default('').notNull(),
  url: text('url'),
  era: text('era'),
  created_at: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

// Tags
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

// Relation many-to-many notes <-> tags
export const notesTags = sqliteTable('notes_tags', {
  note_id: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.note_id, table.tag_id] }),
}));

// Liens bidirectionnels entre notes [[Note]]
export const noteLinks = sqliteTable('note_links', {
  source_id: text('source_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  target_id: text('target_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.source_id, table.target_id] }),
}));

// Timeline events
export const timelineEvents = sqliteTable('timeline_events', {
  id: text('id').primaryKey(),
  note_id: text('note_id').references(() => notes.id, { onDelete: 'set null' }),
  era: text('era').notNull(),
  title: text('title').notNull(),
  event_type: text('event_type').notNull(),
  position: integer('position').notNull(),
});

// Chunks de transcription vidéo
export const transcriptionChunks = sqliteTable('transcription_chunks', {
  id: text('id').primaryKey(),
  note_id: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  timestamp_ms: integer('timestamp_ms').notNull(),
  text: text('text').notNull(),
});
