import { pgTable, text, timestamp, integer, primaryKey, pgEnum } from 'drizzle-orm/pg-core';

// Enum pour les types de notes
export const noteTypeEnum = pgEnum('note_type', ['note', 'wiki', 'video', 'ocr']);

// Notes - sources de lore
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: noteTypeEnum('type').notNull(),
  content: text('content').default('').notNull(),
  url: text('url'),
  era: text('era'),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});

// Tags
export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

// Relation many-to-many notes <-> tags
export const notesTags = pgTable('notes_tags', {
  note_id: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.note_id, table.tag_id] }),
}));

// Liens bidirectionnels entre notes [[Note]]
export const noteLinks = pgTable('note_links', {
  source_id: text('source_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  target_id: text('target_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.source_id, table.target_id] }),
}));

// Timeline events
export const timelineEvents = pgTable('timeline_events', {
  id: text('id').primaryKey(),
  note_id: text('note_id').references(() => notes.id, { onDelete: 'set null' }),
  era: text('era').notNull(),
  title: text('title').notNull(),
  event_type: text('event_type').notNull(),
  position: integer('position').notNull(),
});

// Chunks de transcription vidéo
export const transcriptionChunks = pgTable('transcription_chunks', {
  id: text('id').primaryKey(),
  note_id: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  timestamp_ms: integer('timestamp_ms').notNull(),
  text: text('text').notNull(),
});
