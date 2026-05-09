-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "AgentLog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationLog_logId_key" ON "VerificationLog"("logId");
