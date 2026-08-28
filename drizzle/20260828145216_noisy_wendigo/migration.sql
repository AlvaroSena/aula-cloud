CREATE TABLE "barbershops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "barbershops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "barbershops" ADD CONSTRAINT "barbershops_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");