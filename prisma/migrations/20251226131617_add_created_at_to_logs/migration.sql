-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CropLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cropId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "note" TEXT,
    "aiAnalysis" TEXT,
    CONSTRAINT "CropLog_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CropLog" ("aiAnalysis", "cropId", "date", "id", "imageUrl", "note") SELECT "aiAnalysis", "cropId", "date", "id", "imageUrl", "note" FROM "CropLog";
DROP TABLE "CropLog";
ALTER TABLE "new_CropLog" RENAME TO "CropLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
