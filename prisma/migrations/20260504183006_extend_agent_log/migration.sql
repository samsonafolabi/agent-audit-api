/*
  Warnings:

  - You are about to drop the column `executionTrace` on the `AgentLog` table. All the data in the column will be lost.
  - You are about to alter the column `timestamp` on the `AgentLog` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Added the required column `intent` to the `AgentLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outcome` to the `AgentLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseTime` to the `AgentLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toolsCalled` to the `AgentLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "outcome" TEXT NOT NULL,
    "toolsCalled" JSONB NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AgentLog" ("agentId", "createdAt", "id", "timestamp") SELECT "agentId", "createdAt", "id", "timestamp" FROM "AgentLog";
DROP TABLE "AgentLog";
ALTER TABLE "new_AgentLog" RENAME TO "AgentLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
