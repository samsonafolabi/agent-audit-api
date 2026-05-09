interface AgentLog {
  id: string;
  agentId: string;
  intent: string;
  timestamp: Date;
  outcome: string;
  toolsCalled: any;
  responseTime: number;
  createdAt: Date;
}

interface VerificationResult {
  status: "pass" | "fail";
  reason: string;
}

export function verifyLog(data: AgentLog): VerificationResult {
  const stopWords = ["to", "the", "a", "an", "of", "in", "for", "and", "or"];
  const successSignals = ["completed", "success", "done", "ok", "fulfilled"];
  const failureSignals = [
    "failed",
    "cancelled",
    "error",
    "rejected",
    "timeout",
  ];
  const keywords = data.intent
    .toLowerCase()
    .split(" ")
    .filter((w) => !stopWords.includes(w));

  const outcomeText = data.outcome.toLowerCase();
  const actionMatch = keywords.some((k) => outcomeText.includes(k));
  const successCheck = successSignals.some((a) => outcomeText.includes(a));
  const failureCheck = failureSignals.some((a) => outcomeText.includes(a));
  if (actionMatch && failureCheck) {
    return {
      status: "fail",
      reason: "Agent Intent does not match outcome",
    };
  } else if (!actionMatch && !successCheck) {
    return {
      status: "fail",
      reason: "Agent Intent does not match outcome",
    };
  }
  return {
    status: "pass",
    reason: "Agent Intent matches outcome",
  };
}
