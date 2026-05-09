import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const log = await prisma.agentLog.findUnique({
      where: { id },
      include: {
        verification: true,
        anomaly: true,
      },
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json(log, { status: 200 });
  } catch (e) {
    console.error("Find by Id Error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
