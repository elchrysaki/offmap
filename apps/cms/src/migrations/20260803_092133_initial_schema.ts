import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_opportunities_audience_groups" AS ENUM('secondary-students', 'university-students', 'graduate-students', 'researchers', 'early-career', 'all-students');
  CREATE TYPE "public"."enum_opportunities_eligibility_academic_levels" AS ENUM('secondary-school', 'undergraduate', 'graduate', 'doctoral', 'postdoctoral', 'early-career', 'any');
  CREATE TYPE "public"."enum_opportunities_eligibility_fields" AS ENUM('arts-humanities', 'business-economics', 'computing-ai-data', 'education', 'engineering-technology', 'environment-sustainability', 'health-life-sciences', 'law-policy', 'natural-sciences', 'social-sciences', 'multidisciplinary');
  CREATE TYPE "public"."enum_opportunities_funding_filter_labels" AS ENUM('free', 'scholarship', 'travel-support', 'accommodation', 'meals', 'stipend-or-salary', 'prizes', 'not-confirmed');
  CREATE TYPE "public"."enum_opportunities_moderation_flags" AS ENUM('missing-application-link', 'unnormalized-deadline', 'missing-funding', 'category-mismatch', 'stale', 'expired', 'needs-verification');
  CREATE TYPE "public"."enum_opportunities_main_category" AS ENUM('events', 'internships', 'competitions', 'research', 'fellowships', 'scholarships', 'courses', 'innovation', 'creative-calls', 'exchanges', 'volunteering', 'other');
  CREATE TYPE "public"."enum_opportunities_category" AS ENUM('conference', 'summit', 'forum', 'workshop-seminar', 'networking-event', 'congress', 'cultural-program', 'internship', 'apprenticeship', 'traineeship', 'competition', 'challenge', 'hackathon', 'research-program', 'research-placement', 'research-internship', 'fellowship', 'leadership-program', 'scholarship', 'grant', 'travel-grant', 'academy', 'summer-school', 'winter-school', 'course-training', 'bootcamp', 'startup-program', 'accelerator', 'incubator', 'entrepreneurship-program', 'creative-call', 'media-call', 'writing-call', 'design-call', 'exchange-program', 'mobility-program', 'volunteering-program', 'service-program', 'other');
  CREATE TYPE "public"."enum_opportunities_format" AS ENUM('in-person', 'online', 'hybrid', 'not-confirmed');
  CREATE TYPE "public"."enum_opportunities_audience_classification_source" AS ENUM('submitted-dropdown-only', 'legacy-explicit');
  CREATE TYPE "public"."enum_opportunities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opportunities_v_version_audience_groups" AS ENUM('secondary-students', 'university-students', 'graduate-students', 'researchers', 'early-career', 'all-students');
  CREATE TYPE "public"."enum__opportunities_v_version_eligibility_academic_levels" AS ENUM('secondary-school', 'undergraduate', 'graduate', 'doctoral', 'postdoctoral', 'early-career', 'any');
  CREATE TYPE "public"."enum__opportunities_v_version_eligibility_fields" AS ENUM('arts-humanities', 'business-economics', 'computing-ai-data', 'education', 'engineering-technology', 'environment-sustainability', 'health-life-sciences', 'law-policy', 'natural-sciences', 'social-sciences', 'multidisciplinary');
  CREATE TYPE "public"."enum__opportunities_v_version_funding_filter_labels" AS ENUM('free', 'scholarship', 'travel-support', 'accommodation', 'meals', 'stipend-or-salary', 'prizes', 'not-confirmed');
  CREATE TYPE "public"."enum__opportunities_v_version_moderation_flags" AS ENUM('missing-application-link', 'unnormalized-deadline', 'missing-funding', 'category-mismatch', 'stale', 'expired', 'needs-verification');
  CREATE TYPE "public"."enum__opportunities_v_version_main_category" AS ENUM('events', 'internships', 'competitions', 'research', 'fellowships', 'scholarships', 'courses', 'innovation', 'creative-calls', 'exchanges', 'volunteering', 'other');
  CREATE TYPE "public"."enum__opportunities_v_version_category" AS ENUM('conference', 'summit', 'forum', 'workshop-seminar', 'networking-event', 'congress', 'cultural-program', 'internship', 'apprenticeship', 'traineeship', 'competition', 'challenge', 'hackathon', 'research-program', 'research-placement', 'research-internship', 'fellowship', 'leadership-program', 'scholarship', 'grant', 'travel-grant', 'academy', 'summer-school', 'winter-school', 'course-training', 'bootcamp', 'startup-program', 'accelerator', 'incubator', 'entrepreneurship-program', 'creative-call', 'media-call', 'writing-call', 'design-call', 'exchange-program', 'mobility-program', 'volunteering-program', 'service-program', 'other');
  CREATE TYPE "public"."enum__opportunities_v_version_format" AS ENUM('in-person', 'online', 'hybrid', 'not-confirmed');
  CREATE TYPE "public"."enum__opportunities_v_version_audience_classification_source" AS ENUM('submitted-dropdown-only', 'legacy-explicit');
  CREATE TYPE "public"."enum__opportunities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_submissions_main_category" AS ENUM('not-sure', 'events', 'internships', 'competitions', 'research', 'fellowships', 'scholarships', 'courses', 'innovation', 'creative-calls', 'exchanges', 'volunteering', 'other');
  CREATE TYPE "public"."enum_submissions_status" AS ENUM('received', 'researching', 'draft-ready', 'in-review', 'approved', 'rejected');
  CREATE TYPE "public"."enum__submissions_v_version_main_category" AS ENUM('not-sure', 'events', 'internships', 'competitions', 'research', 'fellowships', 'scholarships', 'courses', 'innovation', 'creative-calls', 'exchanges', 'volunteering', 'other');
  CREATE TYPE "public"."enum__submissions_v_version_status" AS ENUM('received', 'researching', 'draft-ready', 'in-review', 'approved', 'rejected');
  CREATE TYPE "public"."enum_research_runs_status" AS ENUM('succeeded', 'failed');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'refresh-opportunity-lifecycle', 'research-opportunity');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'refresh-opportunity-lifecycle', 'research-opportunity');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "opportunities_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "opportunities_audience_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_opportunities_audience_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "opportunities_eligibility_geographic_regions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_eligibility_eligible_countries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_eligibility_academic_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_opportunities_eligibility_academic_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "opportunities_eligibility_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_opportunities_eligibility_fields",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "opportunities_eligibility_majors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_eligibility_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_funding_other_support" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_funding_filter_labels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_opportunities_funding_filter_labels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "opportunities_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_sources_supported_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"label" varchar,
  	"checked_at" timestamp(3) with time zone,
  	"reviewer" varchar
  );
  
  CREATE TABLE "opportunities_moderation_flags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_opportunities_moderation_flags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"organizer" varchar,
  	"edition" varchar,
  	"summary" varchar,
  	"featured" boolean DEFAULT false,
  	"main_category" "enum_opportunities_main_category",
  	"category" "enum_opportunities_category",
  	"format" "enum_opportunities_format",
  	"audience_classification_source" "enum_opportunities_audience_classification_source" DEFAULT 'submitted-dropdown-only',
  	"dates_timezone" varchar,
  	"dates_rolling" boolean DEFAULT false,
  	"dates_application_deadline_at" timestamp(3) with time zone,
  	"dates_application_deadline_display" varchar,
  	"dates_application_deadline_raw" varchar,
  	"dates_start_at" timestamp(3) with time zone,
  	"dates_start_display" varchar,
  	"dates_end_at" timestamp(3) with time zone,
  	"dates_end_display" varchar,
  	"location_display" varchar,
  	"location_city" varchar,
  	"location_country" varchar,
  	"location_country_code" varchar,
  	"location_region" varchar,
  	"eligibility_summary" varchar,
  	"funding_application_fee" varchar,
  	"funding_participation_fee" varchar,
  	"funding_scholarship" varchar,
  	"funding_travel_support" varchar,
  	"funding_accommodation" varchar,
  	"funding_meals" varchar,
  	"funding_stipend_or_salary" varchar,
  	"funding_prizes" varchar,
  	"funding_visa_support" varchar,
  	"funding_accessibility_support" varchar,
  	"official_url" varchar,
  	"application_url" varchar,
  	"last_verified_at" timestamp(3) with time zone,
  	"legacy_slug" varchar,
  	"legacy_source_issue" varchar,
  	"legacy_publication_review" jsonb,
  	"legacy_verification_notes" jsonb,
  	"legacy_imported_at" timestamp(3) with time zone,
  	"legacy_archived" boolean DEFAULT false,
  	"legacy_raw_record" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_opportunities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_opportunities_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_audience_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__opportunities_v_version_audience_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_opportunities_v_version_eligibility_geographic_regions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_eligibility_eligible_countries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_eligibility_academic_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__opportunities_v_version_eligibility_academic_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_opportunities_v_version_eligibility_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__opportunities_v_version_eligibility_fields",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_opportunities_v_version_eligibility_majors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_eligibility_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_funding_other_support" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_funding_filter_labels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__opportunities_v_version_funding_filter_labels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_opportunities_v_version_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_sources_supported_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"label" varchar,
  	"checked_at" timestamp(3) with time zone,
  	"reviewer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v_version_moderation_flags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__opportunities_v_version_moderation_flags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_opportunities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_title" varchar,
  	"version_organizer" varchar,
  	"version_edition" varchar,
  	"version_summary" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_main_category" "enum__opportunities_v_version_main_category",
  	"version_category" "enum__opportunities_v_version_category",
  	"version_format" "enum__opportunities_v_version_format",
  	"version_audience_classification_source" "enum__opportunities_v_version_audience_classification_source" DEFAULT 'submitted-dropdown-only',
  	"version_dates_timezone" varchar,
  	"version_dates_rolling" boolean DEFAULT false,
  	"version_dates_application_deadline_at" timestamp(3) with time zone,
  	"version_dates_application_deadline_display" varchar,
  	"version_dates_application_deadline_raw" varchar,
  	"version_dates_start_at" timestamp(3) with time zone,
  	"version_dates_start_display" varchar,
  	"version_dates_end_at" timestamp(3) with time zone,
  	"version_dates_end_display" varchar,
  	"version_location_display" varchar,
  	"version_location_city" varchar,
  	"version_location_country" varchar,
  	"version_location_country_code" varchar,
  	"version_location_region" varchar,
  	"version_eligibility_summary" varchar,
  	"version_funding_application_fee" varchar,
  	"version_funding_participation_fee" varchar,
  	"version_funding_scholarship" varchar,
  	"version_funding_travel_support" varchar,
  	"version_funding_accommodation" varchar,
  	"version_funding_meals" varchar,
  	"version_funding_stipend_or_salary" varchar,
  	"version_funding_prizes" varchar,
  	"version_funding_visa_support" varchar,
  	"version_funding_accessibility_support" varchar,
  	"version_official_url" varchar,
  	"version_application_url" varchar,
  	"version_last_verified_at" timestamp(3) with time zone,
  	"version_legacy_slug" varchar,
  	"version_legacy_source_issue" varchar,
  	"version_legacy_publication_review" jsonb,
  	"version_legacy_verification_notes" jsonb,
  	"version_legacy_imported_at" timestamp(3) with time zone,
  	"version_legacy_archived" boolean DEFAULT false,
  	"version_legacy_raw_record" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__opportunities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_url" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"main_category" "enum_submissions_main_category" NOT NULL,
  	"note" varchar,
  	"contact_email" varchar,
  	"consented_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_submissions_status" DEFAULT 'received' NOT NULL,
  	"request_fingerprint" varchar NOT NULL,
  	"contact_delete_after" timestamp(3) with time zone,
  	"internal_notes" varchar,
  	"linked_opportunity_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_submissions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_source_url" varchar NOT NULL,
  	"version_title" varchar NOT NULL,
  	"version_main_category" "enum__submissions_v_version_main_category" NOT NULL,
  	"version_note" varchar,
  	"version_contact_email" varchar,
  	"version_consented_at" timestamp(3) with time zone NOT NULL,
  	"version_status" "enum__submissions_v_version_status" DEFAULT 'received' NOT NULL,
  	"version_request_fingerprint" varchar NOT NULL,
  	"version_contact_delete_after" timestamp(3) with time zone,
  	"version_internal_notes" varchar,
  	"version_linked_opportunity_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "research_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"submission_id" integer NOT NULL,
  	"opportunity_id" integer,
  	"requested_by_id" integer NOT NULL,
  	"status" "enum_research_runs_status" NOT NULL,
  	"model" varchar NOT NULL,
  	"model_snapshot" varchar,
  	"prompt_version" varchar NOT NULL,
  	"proposal" jsonb,
  	"citations" jsonb,
  	"warnings" jsonb,
  	"usage" jsonb,
  	"failure" varchar,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"opportunities_id" integer,
  	"submissions_id" integer,
  	"research_runs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement" varchar,
  	"closing_soon_days" numeric DEFAULT 14 NOT NULL,
  	"public_email" varchar,
  	"about_url" varchar,
  	"privacy_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"opportunities_id" integer
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_announcement" varchar,
  	"version_closing_soon_days" numeric DEFAULT 14 NOT NULL,
  	"version_public_email" varchar,
  	"version_about_url" varchar,
  	"version_privacy_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"opportunities_id" integer
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_details" ADD CONSTRAINT "opportunities_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_audience_groups" ADD CONSTRAINT "opportunities_audience_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_eligibility_geographic_regions" ADD CONSTRAINT "opportunities_eligibility_geographic_regions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_eligibility_eligible_countries" ADD CONSTRAINT "opportunities_eligibility_eligible_countries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_eligibility_academic_levels" ADD CONSTRAINT "opportunities_eligibility_academic_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_eligibility_fields" ADD CONSTRAINT "opportunities_eligibility_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_eligibility_majors" ADD CONSTRAINT "opportunities_eligibility_majors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_eligibility_requirements" ADD CONSTRAINT "opportunities_eligibility_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_funding_other_support" ADD CONSTRAINT "opportunities_funding_other_support_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_funding_filter_labels" ADD CONSTRAINT "opportunities_funding_filter_labels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_activities" ADD CONSTRAINT "opportunities_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_benefits" ADD CONSTRAINT "opportunities_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_topics" ADD CONSTRAINT "opportunities_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_sources_supported_fields" ADD CONSTRAINT "opportunities_sources_supported_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_sources" ADD CONSTRAINT "opportunities_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_moderation_flags" ADD CONSTRAINT "opportunities_moderation_flags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_details" ADD CONSTRAINT "_opportunities_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_audience_groups" ADD CONSTRAINT "_opportunities_v_version_audience_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_eligibility_geographic_regions" ADD CONSTRAINT "_opportunities_v_version_eligibility_geographic_regions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_eligibility_eligible_countries" ADD CONSTRAINT "_opportunities_v_version_eligibility_eligible_countries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_eligibility_academic_levels" ADD CONSTRAINT "_opportunities_v_version_eligibility_academic_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_eligibility_fields" ADD CONSTRAINT "_opportunities_v_version_eligibility_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_eligibility_majors" ADD CONSTRAINT "_opportunities_v_version_eligibility_majors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_eligibility_requirements" ADD CONSTRAINT "_opportunities_v_version_eligibility_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_funding_other_support" ADD CONSTRAINT "_opportunities_v_version_funding_other_support_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_funding_filter_labels" ADD CONSTRAINT "_opportunities_v_version_funding_filter_labels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_activities" ADD CONSTRAINT "_opportunities_v_version_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_benefits" ADD CONSTRAINT "_opportunities_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_topics" ADD CONSTRAINT "_opportunities_v_version_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_sources_supported_fields" ADD CONSTRAINT "_opportunities_v_version_sources_supported_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v_version_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_sources" ADD CONSTRAINT "_opportunities_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_moderation_flags" ADD CONSTRAINT "_opportunities_v_version_moderation_flags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_parent_id_opportunities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_linked_opportunity_id_opportunities_id_fk" FOREIGN KEY ("linked_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_submissions_v" ADD CONSTRAINT "_submissions_v_parent_id_submissions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_submissions_v" ADD CONSTRAINT "_submissions_v_version_linked_opportunity_id_opportunities_id_fk" FOREIGN KEY ("version_linked_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_runs" ADD CONSTRAINT "research_runs_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_runs" ADD CONSTRAINT "research_runs_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_runs" ADD CONSTRAINT "research_runs_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_research_runs_fk" FOREIGN KEY ("research_runs_id") REFERENCES "public"."research_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "opportunities_details_order_idx" ON "opportunities_details" USING btree ("_order");
  CREATE INDEX "opportunities_details_parent_id_idx" ON "opportunities_details" USING btree ("_parent_id");
  CREATE INDEX "opportunities_audience_groups_order_idx" ON "opportunities_audience_groups" USING btree ("order");
  CREATE INDEX "opportunities_audience_groups_parent_idx" ON "opportunities_audience_groups" USING btree ("parent_id");
  CREATE INDEX "opportunities_eligibility_geographic_regions_order_idx" ON "opportunities_eligibility_geographic_regions" USING btree ("_order");
  CREATE INDEX "opportunities_eligibility_geographic_regions_parent_id_idx" ON "opportunities_eligibility_geographic_regions" USING btree ("_parent_id");
  CREATE INDEX "opportunities_eligibility_eligible_countries_order_idx" ON "opportunities_eligibility_eligible_countries" USING btree ("_order");
  CREATE INDEX "opportunities_eligibility_eligible_countries_parent_id_idx" ON "opportunities_eligibility_eligible_countries" USING btree ("_parent_id");
  CREATE INDEX "opportunities_eligibility_academic_levels_order_idx" ON "opportunities_eligibility_academic_levels" USING btree ("order");
  CREATE INDEX "opportunities_eligibility_academic_levels_parent_idx" ON "opportunities_eligibility_academic_levels" USING btree ("parent_id");
  CREATE INDEX "opportunities_eligibility_fields_order_idx" ON "opportunities_eligibility_fields" USING btree ("order");
  CREATE INDEX "opportunities_eligibility_fields_parent_idx" ON "opportunities_eligibility_fields" USING btree ("parent_id");
  CREATE INDEX "opportunities_eligibility_majors_order_idx" ON "opportunities_eligibility_majors" USING btree ("_order");
  CREATE INDEX "opportunities_eligibility_majors_parent_id_idx" ON "opportunities_eligibility_majors" USING btree ("_parent_id");
  CREATE INDEX "opportunities_eligibility_requirements_order_idx" ON "opportunities_eligibility_requirements" USING btree ("_order");
  CREATE INDEX "opportunities_eligibility_requirements_parent_id_idx" ON "opportunities_eligibility_requirements" USING btree ("_parent_id");
  CREATE INDEX "opportunities_funding_other_support_order_idx" ON "opportunities_funding_other_support" USING btree ("_order");
  CREATE INDEX "opportunities_funding_other_support_parent_id_idx" ON "opportunities_funding_other_support" USING btree ("_parent_id");
  CREATE INDEX "opportunities_funding_filter_labels_order_idx" ON "opportunities_funding_filter_labels" USING btree ("order");
  CREATE INDEX "opportunities_funding_filter_labels_parent_idx" ON "opportunities_funding_filter_labels" USING btree ("parent_id");
  CREATE INDEX "opportunities_activities_order_idx" ON "opportunities_activities" USING btree ("_order");
  CREATE INDEX "opportunities_activities_parent_id_idx" ON "opportunities_activities" USING btree ("_parent_id");
  CREATE INDEX "opportunities_benefits_order_idx" ON "opportunities_benefits" USING btree ("_order");
  CREATE INDEX "opportunities_benefits_parent_id_idx" ON "opportunities_benefits" USING btree ("_parent_id");
  CREATE INDEX "opportunities_topics_order_idx" ON "opportunities_topics" USING btree ("_order");
  CREATE INDEX "opportunities_topics_parent_id_idx" ON "opportunities_topics" USING btree ("_parent_id");
  CREATE INDEX "opportunities_sources_supported_fields_order_idx" ON "opportunities_sources_supported_fields" USING btree ("_order");
  CREATE INDEX "opportunities_sources_supported_fields_parent_id_idx" ON "opportunities_sources_supported_fields" USING btree ("_parent_id");
  CREATE INDEX "opportunities_sources_order_idx" ON "opportunities_sources" USING btree ("_order");
  CREATE INDEX "opportunities_sources_parent_id_idx" ON "opportunities_sources" USING btree ("_parent_id");
  CREATE INDEX "opportunities_moderation_flags_order_idx" ON "opportunities_moderation_flags" USING btree ("order");
  CREATE INDEX "opportunities_moderation_flags_parent_idx" ON "opportunities_moderation_flags" USING btree ("parent_id");
  CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");
  CREATE INDEX "opportunities_featured_idx" ON "opportunities" USING btree ("featured");
  CREATE INDEX "opportunities_main_category_idx" ON "opportunities" USING btree ("main_category");
  CREATE INDEX "opportunities_category_idx" ON "opportunities" USING btree ("category");
  CREATE INDEX "opportunities_format_idx" ON "opportunities" USING btree ("format");
  CREATE INDEX "opportunities_dates_dates_application_deadline_at_idx" ON "opportunities" USING btree ("dates_application_deadline_at");
  CREATE INDEX "opportunities_dates_dates_start_at_idx" ON "opportunities" USING btree ("dates_start_at");
  CREATE INDEX "opportunities_dates_dates_end_at_idx" ON "opportunities" USING btree ("dates_end_at");
  CREATE INDEX "opportunities_location_location_country_idx" ON "opportunities" USING btree ("location_country");
  CREATE INDEX "opportunities_location_location_region_idx" ON "opportunities" USING btree ("location_region");
  CREATE INDEX "opportunities_last_verified_at_idx" ON "opportunities" USING btree ("last_verified_at");
  CREATE INDEX "opportunities_legacy_legacy_slug_idx" ON "opportunities" USING btree ("legacy_slug");
  CREATE INDEX "opportunities_legacy_legacy_archived_idx" ON "opportunities" USING btree ("legacy_archived");
  CREATE INDEX "opportunities_updated_at_idx" ON "opportunities" USING btree ("updated_at");
  CREATE INDEX "opportunities_created_at_idx" ON "opportunities" USING btree ("created_at");
  CREATE INDEX "opportunities__status_idx" ON "opportunities" USING btree ("_status");
  CREATE INDEX "_opportunities_v_version_details_order_idx" ON "_opportunities_v_version_details" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_details_parent_id_idx" ON "_opportunities_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_audience_groups_order_idx" ON "_opportunities_v_version_audience_groups" USING btree ("order");
  CREATE INDEX "_opportunities_v_version_audience_groups_parent_idx" ON "_opportunities_v_version_audience_groups" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_eligibility_geographic_regions_order_idx" ON "_opportunities_v_version_eligibility_geographic_regions" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_eligibility_geographic_regions_parent_id_idx" ON "_opportunities_v_version_eligibility_geographic_regions" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_eligibility_eligible_countries_order_idx" ON "_opportunities_v_version_eligibility_eligible_countries" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_eligibility_eligible_countries_parent_id_idx" ON "_opportunities_v_version_eligibility_eligible_countries" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_eligibility_academic_levels_order_idx" ON "_opportunities_v_version_eligibility_academic_levels" USING btree ("order");
  CREATE INDEX "_opportunities_v_version_eligibility_academic_levels_parent_idx" ON "_opportunities_v_version_eligibility_academic_levels" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_eligibility_fields_order_idx" ON "_opportunities_v_version_eligibility_fields" USING btree ("order");
  CREATE INDEX "_opportunities_v_version_eligibility_fields_parent_idx" ON "_opportunities_v_version_eligibility_fields" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_eligibility_majors_order_idx" ON "_opportunities_v_version_eligibility_majors" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_eligibility_majors_parent_id_idx" ON "_opportunities_v_version_eligibility_majors" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_eligibility_requirements_order_idx" ON "_opportunities_v_version_eligibility_requirements" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_eligibility_requirements_parent_id_idx" ON "_opportunities_v_version_eligibility_requirements" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_funding_other_support_order_idx" ON "_opportunities_v_version_funding_other_support" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_funding_other_support_parent_id_idx" ON "_opportunities_v_version_funding_other_support" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_funding_filter_labels_order_idx" ON "_opportunities_v_version_funding_filter_labels" USING btree ("order");
  CREATE INDEX "_opportunities_v_version_funding_filter_labels_parent_idx" ON "_opportunities_v_version_funding_filter_labels" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_activities_order_idx" ON "_opportunities_v_version_activities" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_activities_parent_id_idx" ON "_opportunities_v_version_activities" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_benefits_order_idx" ON "_opportunities_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_benefits_parent_id_idx" ON "_opportunities_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_topics_order_idx" ON "_opportunities_v_version_topics" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_topics_parent_id_idx" ON "_opportunities_v_version_topics" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_sources_supported_fields_order_idx" ON "_opportunities_v_version_sources_supported_fields" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_sources_supported_fields_parent_id_idx" ON "_opportunities_v_version_sources_supported_fields" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_sources_order_idx" ON "_opportunities_v_version_sources" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_sources_parent_id_idx" ON "_opportunities_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_moderation_flags_order_idx" ON "_opportunities_v_version_moderation_flags" USING btree ("order");
  CREATE INDEX "_opportunities_v_version_moderation_flags_parent_idx" ON "_opportunities_v_version_moderation_flags" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_parent_idx" ON "_opportunities_v" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_version_slug_idx" ON "_opportunities_v" USING btree ("version_slug");
  CREATE INDEX "_opportunities_v_version_version_featured_idx" ON "_opportunities_v" USING btree ("version_featured");
  CREATE INDEX "_opportunities_v_version_version_main_category_idx" ON "_opportunities_v" USING btree ("version_main_category");
  CREATE INDEX "_opportunities_v_version_version_category_idx" ON "_opportunities_v" USING btree ("version_category");
  CREATE INDEX "_opportunities_v_version_version_format_idx" ON "_opportunities_v" USING btree ("version_format");
  CREATE INDEX "_opportunities_v_version_dates_version_dates_application_idx" ON "_opportunities_v" USING btree ("version_dates_application_deadline_at");
  CREATE INDEX "_opportunities_v_version_dates_version_dates_start_at_idx" ON "_opportunities_v" USING btree ("version_dates_start_at");
  CREATE INDEX "_opportunities_v_version_dates_version_dates_end_at_idx" ON "_opportunities_v" USING btree ("version_dates_end_at");
  CREATE INDEX "_opportunities_v_version_location_version_location_count_idx" ON "_opportunities_v" USING btree ("version_location_country");
  CREATE INDEX "_opportunities_v_version_location_version_location_regio_idx" ON "_opportunities_v" USING btree ("version_location_region");
  CREATE INDEX "_opportunities_v_version_version_last_verified_at_idx" ON "_opportunities_v" USING btree ("version_last_verified_at");
  CREATE INDEX "_opportunities_v_version_legacy_version_legacy_slug_idx" ON "_opportunities_v" USING btree ("version_legacy_slug");
  CREATE INDEX "_opportunities_v_version_legacy_version_legacy_archived_idx" ON "_opportunities_v" USING btree ("version_legacy_archived");
  CREATE INDEX "_opportunities_v_version_version_updated_at_idx" ON "_opportunities_v" USING btree ("version_updated_at");
  CREATE INDEX "_opportunities_v_version_version_created_at_idx" ON "_opportunities_v" USING btree ("version_created_at");
  CREATE INDEX "_opportunities_v_version_version__status_idx" ON "_opportunities_v" USING btree ("version__status");
  CREATE INDEX "_opportunities_v_created_at_idx" ON "_opportunities_v" USING btree ("created_at");
  CREATE INDEX "_opportunities_v_updated_at_idx" ON "_opportunities_v" USING btree ("updated_at");
  CREATE INDEX "_opportunities_v_latest_idx" ON "_opportunities_v" USING btree ("latest");
  CREATE INDEX "_opportunities_v_autosave_idx" ON "_opportunities_v" USING btree ("autosave");
  CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");
  CREATE INDEX "submissions_request_fingerprint_idx" ON "submissions" USING btree ("request_fingerprint");
  CREATE INDEX "submissions_contact_delete_after_idx" ON "submissions" USING btree ("contact_delete_after");
  CREATE INDEX "submissions_linked_opportunity_idx" ON "submissions" USING btree ("linked_opportunity_id");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "_submissions_v_parent_idx" ON "_submissions_v" USING btree ("parent_id");
  CREATE INDEX "_submissions_v_version_version_status_idx" ON "_submissions_v" USING btree ("version_status");
  CREATE INDEX "_submissions_v_version_version_request_fingerprint_idx" ON "_submissions_v" USING btree ("version_request_fingerprint");
  CREATE INDEX "_submissions_v_version_version_contact_delete_after_idx" ON "_submissions_v" USING btree ("version_contact_delete_after");
  CREATE INDEX "_submissions_v_version_version_linked_opportunity_idx" ON "_submissions_v" USING btree ("version_linked_opportunity_id");
  CREATE INDEX "_submissions_v_version_version_updated_at_idx" ON "_submissions_v" USING btree ("version_updated_at");
  CREATE INDEX "_submissions_v_version_version_created_at_idx" ON "_submissions_v" USING btree ("version_created_at");
  CREATE INDEX "_submissions_v_created_at_idx" ON "_submissions_v" USING btree ("created_at");
  CREATE INDEX "_submissions_v_updated_at_idx" ON "_submissions_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "research_runs_reference_idx" ON "research_runs" USING btree ("reference");
  CREATE INDEX "research_runs_submission_idx" ON "research_runs" USING btree ("submission_id");
  CREATE INDEX "research_runs_opportunity_idx" ON "research_runs" USING btree ("opportunity_id");
  CREATE INDEX "research_runs_requested_by_idx" ON "research_runs" USING btree ("requested_by_id");
  CREATE INDEX "research_runs_updated_at_idx" ON "research_runs" USING btree ("updated_at");
  CREATE INDEX "research_runs_created_at_idx" ON "research_runs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("opportunities_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_locked_documents_rels_research_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("research_runs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_opportunities_id_idx" ON "site_settings_rels" USING btree ("opportunities_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" USING btree ("order");
  CREATE INDEX "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_rels_path_idx" ON "_site_settings_v_rels" USING btree ("path");
  CREATE INDEX "_site_settings_v_rels_opportunities_id_idx" ON "_site_settings_v_rels" USING btree ("opportunities_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "opportunities_details" CASCADE;
  DROP TABLE "opportunities_audience_groups" CASCADE;
  DROP TABLE "opportunities_eligibility_geographic_regions" CASCADE;
  DROP TABLE "opportunities_eligibility_eligible_countries" CASCADE;
  DROP TABLE "opportunities_eligibility_academic_levels" CASCADE;
  DROP TABLE "opportunities_eligibility_fields" CASCADE;
  DROP TABLE "opportunities_eligibility_majors" CASCADE;
  DROP TABLE "opportunities_eligibility_requirements" CASCADE;
  DROP TABLE "opportunities_funding_other_support" CASCADE;
  DROP TABLE "opportunities_funding_filter_labels" CASCADE;
  DROP TABLE "opportunities_activities" CASCADE;
  DROP TABLE "opportunities_benefits" CASCADE;
  DROP TABLE "opportunities_topics" CASCADE;
  DROP TABLE "opportunities_sources_supported_fields" CASCADE;
  DROP TABLE "opportunities_sources" CASCADE;
  DROP TABLE "opportunities_moderation_flags" CASCADE;
  DROP TABLE "opportunities" CASCADE;
  DROP TABLE "_opportunities_v_version_details" CASCADE;
  DROP TABLE "_opportunities_v_version_audience_groups" CASCADE;
  DROP TABLE "_opportunities_v_version_eligibility_geographic_regions" CASCADE;
  DROP TABLE "_opportunities_v_version_eligibility_eligible_countries" CASCADE;
  DROP TABLE "_opportunities_v_version_eligibility_academic_levels" CASCADE;
  DROP TABLE "_opportunities_v_version_eligibility_fields" CASCADE;
  DROP TABLE "_opportunities_v_version_eligibility_majors" CASCADE;
  DROP TABLE "_opportunities_v_version_eligibility_requirements" CASCADE;
  DROP TABLE "_opportunities_v_version_funding_other_support" CASCADE;
  DROP TABLE "_opportunities_v_version_funding_filter_labels" CASCADE;
  DROP TABLE "_opportunities_v_version_activities" CASCADE;
  DROP TABLE "_opportunities_v_version_benefits" CASCADE;
  DROP TABLE "_opportunities_v_version_topics" CASCADE;
  DROP TABLE "_opportunities_v_version_sources_supported_fields" CASCADE;
  DROP TABLE "_opportunities_v_version_sources" CASCADE;
  DROP TABLE "_opportunities_v_version_moderation_flags" CASCADE;
  DROP TABLE "_opportunities_v" CASCADE;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "_submissions_v" CASCADE;
  DROP TABLE "research_runs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_rels" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_opportunities_audience_groups";
  DROP TYPE "public"."enum_opportunities_eligibility_academic_levels";
  DROP TYPE "public"."enum_opportunities_eligibility_fields";
  DROP TYPE "public"."enum_opportunities_funding_filter_labels";
  DROP TYPE "public"."enum_opportunities_moderation_flags";
  DROP TYPE "public"."enum_opportunities_main_category";
  DROP TYPE "public"."enum_opportunities_category";
  DROP TYPE "public"."enum_opportunities_format";
  DROP TYPE "public"."enum_opportunities_audience_classification_source";
  DROP TYPE "public"."enum_opportunities_status";
  DROP TYPE "public"."enum__opportunities_v_version_audience_groups";
  DROP TYPE "public"."enum__opportunities_v_version_eligibility_academic_levels";
  DROP TYPE "public"."enum__opportunities_v_version_eligibility_fields";
  DROP TYPE "public"."enum__opportunities_v_version_funding_filter_labels";
  DROP TYPE "public"."enum__opportunities_v_version_moderation_flags";
  DROP TYPE "public"."enum__opportunities_v_version_main_category";
  DROP TYPE "public"."enum__opportunities_v_version_category";
  DROP TYPE "public"."enum__opportunities_v_version_format";
  DROP TYPE "public"."enum__opportunities_v_version_audience_classification_source";
  DROP TYPE "public"."enum__opportunities_v_version_status";
  DROP TYPE "public"."enum_submissions_main_category";
  DROP TYPE "public"."enum_submissions_status";
  DROP TYPE "public"."enum__submissions_v_version_main_category";
  DROP TYPE "public"."enum__submissions_v_version_status";
  DROP TYPE "public"."enum_research_runs_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
