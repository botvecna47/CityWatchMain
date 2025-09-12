-- AlterTable
ALTER TABLE "reports" ADD COLUMN "latitude" REAL;
ALTER TABLE "reports" ADD COLUMN "longitude" REAL;

-- CreateIndex
CREATE INDEX "reports_latitude_longitude_idx" ON "reports"("latitude", "longitude");
