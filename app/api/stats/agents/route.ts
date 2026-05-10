import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const totalRuns = await prisma.agentLog.groupBy({
      by: ["agentId"],
      _count: { id: true },
    });

    const mismatches = await prisma.agentLog.groupBy({
      by: ["agentId"],
      where: {
        verification: {
          status: "fail",
        },
      },
      _count: { id: true },
    });

    const result = [];

    for (const agent of totalRuns) {
      const mismatch = mismatches.find((m) => m.agentId === agent.agentId);

      const mismatchCount = mismatch ? mismatch._count.id : 0;

      const total = agent._count.id;

      result.push({
        agentId: agent.agentId,
        totalRuns: total,
        mismatches: mismatchCount,
        mismatchRate: mismatchCount / total,
      });
    }

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (e) {
    console.error("Error:", e);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
