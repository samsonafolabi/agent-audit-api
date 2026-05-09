require("dotenv/config");
const path = require("path");
const { PrismaClient } = require("../app/generated/prisma");
const p = new PrismaClient({
  datasources: {
    db: { url: "file:" + path.resolve(__dirname, "../prisma/dev.db") },
  },
});
p.agentLog
  .findMany()
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch(console.error)
  .finally(() => p["$disconnect"]());
