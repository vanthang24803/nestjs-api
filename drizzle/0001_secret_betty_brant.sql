ALTER TABLE "roles" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET NOT NULL;