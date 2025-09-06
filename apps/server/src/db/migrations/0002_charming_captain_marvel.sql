PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jwks` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_jwks`("id", "public_key", "private_key", "created_at", "updated_at") SELECT "id", "public_key", "private_key", "created_at", "updated_at" FROM `jwks`;--> statement-breakpoint
DROP TABLE `jwks`;--> statement-breakpoint
ALTER TABLE `__new_jwks` RENAME TO `jwks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;