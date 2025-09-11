/*
  Warnings:

  - Added the required column `actionType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performedById` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "actorId", "actorRole", "createdAt", "id", "metadata", "reason", "targetId", "targetType") SELECT "action", "actorId", "actorRole", "createdAt", "id", "metadata", "reason", "targetId", "targetType" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'citizen',
    "cityId" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("cityId", "createdAt", "email", "id", "password", "role", "updatedAt", "username") SELECT "cityId", "createdAt", "email", "id", "password", "role", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
