CREATE TABLE "device_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"device_id" varchar(128) NOT NULL,
	"device_model" varchar(128) DEFAULT 'Generic Mobile Device' NOT NULL,
	"os_version" varchar(64) DEFAULT 'Android' NOT NULL,
	"app_version" varchar(32) DEFAULT '1.0.2' NOT NULL,
	"platform" varchar(16) DEFAULT 'ANDROID' NOT NULL,
	"fcm_token" varchar(512),
	"refresh_token_hash" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "radius_meters" SET DEFAULT 800;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "password_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "activation_voucher_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "is_activated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exceptions" ADD COLUMN "employee_note" text;--> statement-breakpoint
ALTER TABLE "device_registry" ADD CONSTRAINT "device_registry_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;