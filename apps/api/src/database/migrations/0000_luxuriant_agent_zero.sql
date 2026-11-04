CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(32) DEFAULT 'ACCOUNT_MANAGER' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"has_delegated_resolution_permission" boolean DEFAULT false NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"city" varchar(128) NOT NULL,
	"address" text NOT NULL,
	"radius_meters" integer DEFAULT 500 NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"geog" "GEOGRAPHY(Point, 4326)" NOT NULL,
	"status" varchar(16) DEFAULT 'Active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "manager_location_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manager_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_type" varchar(32) NOT NULL,
	"actor_name" varchar(255),
	"action" varchar(64) NOT NULL,
	"target_id" uuid,
	"target_type" varchar(64),
	"details" jsonb,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_code" varchar(32) NOT NULL,
	"name" varchar(255) NOT NULL,
	"department" varchar(128),
	"role" varchar(128),
	"email" varchar(255),
	"phone" varchar(32),
	"assigned_location_id" uuid,
	"reporting_manager_name" varchar(255),
	"reporting_manager_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"location_id" uuid,
	"attempted_check_in_at" timestamp with time zone NOT NULL,
	"selfie_captured_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"gps_accuracy_meters" numeric(6, 2) NOT NULL,
	"is_mock_location" boolean DEFAULT false NOT NULL,
	"distance_from_boundary_meters" numeric(8, 2) DEFAULT '0',
	"selfie_storage_key" text,
	"selfie_deleted_at" timestamp with time zone,
	"liveness_passed" boolean DEFAULT false NOT NULL,
	"blink_attempt_count" integer DEFAULT 1 NOT NULL,
	"status" varchar(16) NOT NULL,
	"site_name_snapshot" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exception_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exception_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"reviewer_name" varchar(255),
	"decision" varchar(16) NOT NULL,
	"note" text,
	"supervisor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_record_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "report_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requested_by_id" uuid NOT NULL,
	"requested_by_name" varchar(255),
	"date_range_start" varchar(16) NOT NULL,
	"date_range_end" varchar(16) NOT NULL,
	"location_id" varchar(64) DEFAULT 'all',
	"employee_scope" varchar(64) DEFAULT 'all',
	"status_filter" varchar(32) DEFAULT 'all',
	"job_status" varchar(16) DEFAULT 'PENDING' NOT NULL,
	"file_format" varchar(8) DEFAULT 'CSV' NOT NULL,
	"estimated_rows" integer,
	"actual_rows" integer,
	"storage_key" text,
	"display_title" varchar(255),
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(32) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link_url" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_location_assignments" ADD CONSTRAINT "manager_location_assignments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_assigned_location_id_locations_id_fk" FOREIGN KEY ("assigned_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_reviews" ADD CONSTRAINT "exception_reviews_exception_id_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_attendance_record_id_attendance_records_id_fk" FOREIGN KEY ("attendance_record_id") REFERENCES "public"."attendance_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;