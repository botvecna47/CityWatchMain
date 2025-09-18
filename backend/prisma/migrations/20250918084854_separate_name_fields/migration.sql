/*
  Warnings:

  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "dob" DATETIME,
    "mobile" TEXT,
    "agreedTos" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiry" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'citizen',
    "cityId" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "profilePicture" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("agreedTos", "bio", "cityId", "createdAt", "dob", "email", "id", "isBanned", "mobile", "otpCode", "otpExpiry", "password", "profilePicture", "role", "updatedAt", "username", "verified") SELECT "agreedTos", "bio", "cityId", "createdAt", "dob", "email", "id", "isBanned", "mobile", "otpCode", "otpExpiry", "password", "profilePicture", "role", "updatedAt", "username", "verified" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_cityId_idx" ON "users"("cityId");
CREATE INDEX "users_isBanned_idx" ON "users"("isBanned");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
