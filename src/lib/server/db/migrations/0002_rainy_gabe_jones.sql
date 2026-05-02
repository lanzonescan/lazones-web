CREATE TABLE `evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`respondent_role` text NOT NULL,
	`responses` text NOT NULL,
	`comments` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
