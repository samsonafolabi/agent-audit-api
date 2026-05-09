-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "executionTrace" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
