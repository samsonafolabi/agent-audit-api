# Agent Audit API

A production-grade observability and security layer for AI agents. Ingests execution logs, automatically verifies intent vs outcome, and detects behavioral anomalies over time.

---

## What It Does

As AI agents become more autonomous, the question of _"did it actually do what it said it would?"_ becomes critical. This API answers that question — automatically, on every run.

| Layer                 | What it does                                                                      |
| --------------------- | --------------------------------------------------------------------------------- |
| **Ingestion**         | Accepts structured execution logs from any agent system                           |
| **Verification**      | Compares declared intent vs actual outcome, flags mismatches                      |
| **Anomaly Detection** | Tracks response time and tool usage per agent over time, flags statistical spikes |
| **Querying**          | Filter logs by verification status, anomaly detection, agent ID, and time range   |

---

## Tech Stack

- **Runtime** — Next.js 16 (App Router, Route Handlers)
- **Language** — TypeScript
- **Database** — SQLite (via Prisma ORM)
- **Validation** — Zod
- **ORM** — Prisma with full migration history

---

## Data Model

```
AgentLog
  ├── VerificationLog   (intent vs outcome verdict)
  └── AnomalyLog        (behavioral anomaly result)
```

### AgentLog

| Field          | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `id`           | UUID     | Unique identifier                   |
| `agentId`      | String   | Which agent sent this log           |
| `intent`       | String   | What the agent declared it would do |
| `outcome`      | String   | What actually happened              |
| `toolsCalled`  | JSON     | List of tools the agent used        |
| `responseTime` | Int      | Execution time in milliseconds      |
| `timestamp`    | DateTime | When the run occurred               |

### VerificationLog

| Field    | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| `status` | String | `pass` or `fail`                   |
| `reason` | String | Human-readable verdict explanation |

### AnomalyLog

| Field       | Type   | Description                                                         |
| ----------- | ------ | ------------------------------------------------------------------- |
| `status`    | String | `Detected` or `None`                                                |
| `anomalies` | JSON   | Array of detected anomalies with type, average, current, and reason |

---

## API Reference

### POST `/api/ingest`

Ingest an agent execution log. Automatically runs verification and anomaly detection.

**Request Body**

```json
{
  "agentId": "agent-x",
  "intent": "transfer funds to user account",
  "outcome": "transfer completed successfully",
  "toolsCalled": ["bank-api", "auth-service"],
  "responseTime": 320,
  "timestamp": "2026-05-06T10:00:00Z"
}
```

**Response**

```json
{
  "AgentLogId": "a85b509b-...",
  "VerificationLogId": "a0f23b21-...",
  "AnomalyLogId": "d540ef46-..."
}
```

**Validation Rules**

- `agentId` — required, non-empty string
- `intent` — required, non-empty string
- `outcome` — required, non-empty string
- `toolsCalled` — required, array of strings (can be empty)
- `responseTime` — required, positive number (milliseconds)
- `timestamp` — required, valid ISO 8601 datetime string

---

### GET `/api/ingest`

Retrieve all logs. Supports filtering via query params.

**Query Params**
| Param | Description | Example |
|-------|-------------|---------|
| `agentId` | Filter by agent | `?agentId=agent-x` |
| `status` | Filter by verification status | `?status=fail` |
| `anomaly` | Filter by anomaly status | `?anomaly=Detected` |

**Examples**

```bash
# All logs
GET /api/ingest

# All failed verifications
GET /api/ingest?status=fail

# All anomalies for a specific agent (last 7 days)
GET /api/ingest?agentId=agent-x&anomaly=Detected

# Combine filters
GET /api/ingest?agentId=agent-x&status=fail
```

**Response**

```json
[
  {
    "id": "a85b509b-...",
    "agentId": "agent-test",
    "intent": "transfer funds to user account",
    "outcome": "transfer completed successfully",
    "toolsCalled": ["bank-api", "auth-service"],
    "responseTime": 320,
    "timestamp": "2026-05-04T10:00:00.000Z",
    "verification": {
      "status": "pass",
      "reason": "Agent Intent matches outcome"
    },
    "anomaly": {
      "status": "None",
      "anomalies": []
    }
  }
]
```

---

### GET `/api/ingest/:id`

Retrieve a single log by ID, including verification and anomaly results.

```bash
GET /api/ingest/a85b509b-e1fc-4e38-aa56-5b39c36d6852
```

---

## How Verification Works

On every ingestion, the system automatically runs a verification check:

1. **Keyword extraction** — extracts meaningful words from `intent`, filtering stop words
2. **Action match** — checks if intent keywords appear in the outcome
3. **Sentiment analysis** — checks outcome for success signals (`completed`, `success`, `done`) or failure signals (`failed`, `error`, `timeout`, `cancelled`)

A run is flagged as `fail` when:

- Intent keywords don't appear in the outcome, OR
- The outcome contains failure signals despite action match

---

## How Anomaly Detection Works

On every ingestion, the system compares the current run against all historical runs for that agent:

| Anomaly Type           | Logic                                                 |
| ---------------------- | ----------------------------------------------------- |
| `ResponseTime Anomaly` | Current responseTime is >50% above historical average |
| `ToolsCalled Anomaly`  | Current tool count is >300% above historical average  |

First-time agents (no history) are skipped — no false positives on new agents.

**Example anomaly result:**

```json
{
  "status": "Detected",
  "anomalies": [
    {
      "type": "ResponseTime Anomaly",
      "average": 320,
      "current": 5000,
      "reason": "Current response time is 1462% higher than the average response time"
    }
  ]
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/samsonafolabi/agent-audit-api
cd agent-audit-api
npm install
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run Development Server

```bash
npm run dev
```

API is available at `http://localhost:3000`

### View Database

```bash
npx prisma studio
```

---

## Project Structure

```
agent-audit-api/
├── app/
│   └── api/
│       └── ingest/
│           ├── route.ts          # POST + GET all
│           └── [id]/
│               └── route.ts      # GET by ID
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── logVerification.ts        # Intent vs outcome verification logic
│   └── anomalyDetection.ts       # Behavioral anomaly detection logic
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
```

---

## Roadmap

- [ ] Query agents by highest mismatch rate
- [ ] API key authentication middleware
- [ ] Switch to PostgreSQL for production
- [ ] Deploy to Railway with live URL
- [ ] Testing suite

---

## Author

**Afolabi Samson** — Backend Developer  
[LinkedIn](https://www.linkedin.com/in/afolabi-samson-089997345) · [GitHub](https://github.com/samsonafolabi) · [Email](mailto:afolabisamson20@gmail.com)
