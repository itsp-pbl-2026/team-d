PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`task_id` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_schedule`("id", "title", "start_at", "end_at", "task_id") SELECT "id", "title", "start_at", "end_at", "task_id" FROM `schedule`;--> statement-breakpoint
DROP TABLE `schedule`;--> statement-breakpoint
ALTER TABLE `__new_schedule` RENAME TO `schedule`;--> statement-breakpoint
PRAGMA foreign_keys=ON;