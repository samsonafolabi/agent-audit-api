-- CreateTable
CREATE TABLE "AnomalyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "anomalies" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnomalyLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "AgentLog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AnomalyLog_logId_key" ON "AnomalyLog"("logId");
