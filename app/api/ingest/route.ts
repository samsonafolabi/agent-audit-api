import { prisma } from "@/lib/prisma";

import { z } from "zod";

import { NextRequest, NextResponse } from "next/server";

import { verifyLog } from "@/lib/logVerification";

import { anomalyDetector } from "@/lib/anomalyDetection";

// export async function GET() {
//   return NextResponse.json({ status: "ingest endpoint alive" });
// }

const AgentLogSchema = z.object({
  agentId: z.string().min(1),
  intent: z.string().min(1),
  outcome: z.string().min(1),
  timestamp: z.string().datetime(),
  toolsCalled: z.array(z.string()),
  responseTime: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const body = JSON.parse(raw);

    const result = AgentLogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid log format",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const log = result.data;

    const createdLog = await prisma.agentLog.create({
      data: {
        agentId: log.agentId,
        timestamp: log.timestamp,
        intent: log.intent,
        outcome: log.outcome,
        toolsCalled: log.toolsCalled,
        responseTime: log.responseTime,
      },
    });

    const history = await prisma.agentLog.findMany({
      where: {
        agentId: createdLog.agentId,
        id: {
          not: createdLog.id,
        },
      },
    });

    const anomalyResult = anomalyDetector(createdLog, history);
    const AnomalyLog = await prisma.anomalyLog.create({
      data: {
        logId: createdLog.id,
        status: anomalyResult.status,
        anomalies: anomalyResult.anomalies as any,
      },
    });
    const verifiedresult = verifyLog(createdLog);
    const VerificationLog = await prisma.verificationLog.create({
      data: {
        logId: createdLog.id,
        status: verifiedresult.status,
        reason: verifiedresult.reason,
      },
    });

    return NextResponse.json(
      {
        AgentLogId: createdLog.id,
        VerificationLogId: VerificationLog.id,
        AnomalyLog: AnomalyLog.id,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("FULL ERROR:", e);

    return NextResponse.json(
      {
        error: "Something failed",
        details: String(e),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const agentId = request.nextUrl.searchParams.get("agentId");
    const status = request.nextUrl.searchParams.get("status");
    const anomaly = request.nextUrl.searchParams.get("anomaly");
    const where: any = {};
    if (agentId) {
      where.agentId = agentId;
    }
    if (status) {
      where.verification = { status: status };
    }
    if (anomaly) {
      where.anomaly = { status: anomaly };
      where.timestamp = { gte: sevenDaysAgo };
    }

    const log = await prisma.agentLog.findMany({
      where,

      include: {
        verification: true,
        anomaly: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(log, { status: 200 });
  } catch (e) {
    console.error("Error:", e);

    return NextResponse.json(
      {
        error: "failed to get logs",
      },
      {
        status: 500,
      },
    );
  }
}
