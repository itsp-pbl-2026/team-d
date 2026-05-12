CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`deadline` integer NOT NULL,
	`estimatedMinutes` integer NOT NULL,
	`actualMinutes` integer DEFAULT 0,
	`priority` integer,
	`progress` integer,
	`status` text
);
