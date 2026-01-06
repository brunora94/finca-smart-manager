-- AlterTable
ALTER TABLE "Crop" ADD COLUMN "latitude" REAL;
ALTER TABLE "Crop" ADD COLUMN "longitude" REAL;

-- AlterTable
ALTER TABLE "Tree" ADD COLUMN "latitude" REAL;
ALTER TABLE "Tree" ADD COLUMN "longitude" REAL;

-- CreateTable
CREATE TABLE "WeatherLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precipitation" REAL NOT NULL,
    "tempMax" REAL,
    "tempMin" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "WeatherLog_date_key" ON "WeatherLog"("date");
