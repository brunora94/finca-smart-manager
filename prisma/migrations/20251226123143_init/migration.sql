-- CreateTable
CREATE TABLE "Crop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "status" TEXT NOT NULL,
    "plantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestDate" DATETIME,
    "location" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "CropLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cropId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "note" TEXT,
    "aiAnalysis" TEXT,
    CONSTRAINT "CropLog_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tree" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "plantedYear" INTEGER,
    "location" TEXT,
    "health" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "TreeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "treeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "note" TEXT,
    CONSTRAINT "TreeLog_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME,
    "periodicity" TEXT,
    "category" TEXT NOT NULL,
    "cropId" INTEGER,
    CONSTRAINT "Task_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop" TEXT
);
