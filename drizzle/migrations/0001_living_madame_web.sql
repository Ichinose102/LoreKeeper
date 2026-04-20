PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_note_links` (
	`source_id` text NOT NULL,
	`target_id` text NOT NULL,
	PRIMARY KEY(`source_id`, `target_id`),
	FOREIGN KEY (`source_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_note_links`("source_id", "target_id") SELECT "source_id", "target_id" FROM `note_links`;--> statement-breakpoint
DROP TABLE `note_links`;--> statement-breakpoint
ALTER TABLE `__new_note_links` RENAME TO `note_links`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_notes_tags` (
	`note_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`note_id`, `tag_id`),
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notes_tags`("note_id", "tag_id") SELECT "note_id", "tag_id" FROM `notes_tags`;--> statement-breakpoint
DROP TABLE `notes_tags`;--> statement-breakpoint
ALTER TABLE `__new_notes_tags` RENAME TO `notes_tags`;