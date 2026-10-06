CREATE TABLE "tess_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tess_account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tess_session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tess_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "tess_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tess_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tess_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tess_user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tess_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tess_verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tess_account" ADD CONSTRAINT "tess_account_user_id_tess_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tess_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tess_session" ADD CONSTRAINT "tess_session_user_id_tess_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tess_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tess_account_user_idx" ON "tess_account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tess_account_provider_unique" ON "tess_account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "tess_session_user_idx" ON "tess_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tess_verification_identifier_idx" ON "tess_verification" USING btree ("identifier");