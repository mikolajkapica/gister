CREATE TABLE `jwks` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
