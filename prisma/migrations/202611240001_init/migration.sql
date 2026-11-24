CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL CHECK (length(trim("name")) BETWEEN 1 AND 100 AND "name" = trim("name")),
    "name_key" TEXT NOT NULL CHECK (length("name_key") > 0),
    "code" TEXT CHECK (length("code") <= 30),
    "lecturer" TEXT CHECK (length("lecturer") <= 100),
    "color" TEXT NOT NULL DEFAULT '#6366F1' CHECK ("color" GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
    "is_archived" BOOLEAN NOT NULL DEFAULT false CHECK ("is_archived" IN (0, 1)),
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL CHECK (length(trim("name")) BETWEEN 1 AND 100 AND "name" = trim("name")),
    "name_key" TEXT NOT NULL CHECK (length("name_key") > 0),
    "description" TEXT CHECK (length("description") <= 500),
    "color" TEXT NOT NULL DEFAULT '#64748B' CHECK ("color" GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
    "is_archived" BOOLEAN NOT NULL DEFAULT false CHECK ("is_archived" IN (0, 1)),
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL CHECK (length(trim("title")) BETWEEN 1 AND 150 AND "title" = trim("title")),
    "description" TEXT CHECK (length("description") <= 5000),
    "task_type" TEXT NOT NULL CHECK ("task_type" IN ('ACADEMIC', 'NONACADEMIC')),
    "course_id" TEXT,
    "category_id" TEXT,
    "assigned_date" TEXT NOT NULL CHECK ("assigned_date" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    "due_date" TEXT NOT NULL CHECK ("due_date" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND "due_date" >= "assigned_date"),
    "due_time" TEXT CHECK ("due_time" GLOB '[0-2][0-9]:[0-5][0-9]' AND "due_time" < '24:00'),
    "difficulty_level" INTEGER NOT NULL DEFAULT 0 CHECK (typeof("difficulty_level") = 'integer' AND "difficulty_level" BETWEEN 0 AND 5),
    "status" TEXT NOT NULL DEFAULT 'TODO' CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    "notes" TEXT CHECK (length("notes") <= 2000),
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    CHECK (("status" = 'COMPLETED') = ("completed_at" IS NOT NULL)),
    CHECK (("task_type" = 'ACADEMIC' AND "course_id" IS NOT NULL AND "category_id" IS NULL) OR
           ("task_type" = 'NONACADEMIC' AND "category_id" IS NOT NULL AND "course_id" IS NULL)),
    CONSTRAINT "tasks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT "tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE "app_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY CHECK ("id" = 1),
    "theme" TEXT NOT NULL DEFAULT 'light' CHECK ("theme" IN ('light', 'dark')),
    "language" TEXT NOT NULL DEFAULT 'id' CHECK ("language" IN ('id', 'en')),
    "sidebar_collapsed" BOOLEAN NOT NULL DEFAULT false CHECK ("sidebar_collapsed" IN (0, 1)),
    "seeded_defaults" BOOLEAN NOT NULL DEFAULT false CHECK ("seeded_defaults" IN (0, 1)),
    "updated_at" DATETIME NOT NULL
);

INSERT INTO "app_settings" ("id", "updated_at") VALUES (1, CURRENT_TIMESTAMP);

CREATE UNIQUE INDEX "courses_name_key_key" ON "courses"("name_key");
CREATE UNIQUE INDEX "categories_name_key_key" ON "categories"("name_key");
CREATE INDEX "tasks_status_due_date_due_time_idx" ON "tasks"("status", "due_date", "due_time");
CREATE INDEX "tasks_course_id_idx" ON "tasks"("course_id");
CREATE INDEX "tasks_category_id_idx" ON "tasks"("category_id");
CREATE INDEX "tasks_completed_at_idx" ON "tasks"("completed_at");
CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at");
