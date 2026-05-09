interface AnomalyResult {
  status: "Detected" | "None";
  anomalies: Anomaly[];
}

interface Anomaly {
  type: string;
  average: number;
  current: number;
  reason: string;
}

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

export function anomalyDetector(
  currentLog: AgentLog,
  history: Array<AgentLog>,
): AnomalyResult {
  if (history.length === 0) {
    return {
      status: "None",
      anomalies: [],
    };
  }
  const anomalies: Anomaly[] = [];
  const RESPONSE_TIME_THRESHOLD = 50;
  const TOOLS_CALLED_THRESHOLD = 300;

  const currentToolsCalled = currentLog.toolsCalled.length;

  const currentResponseTime = currentLog.responseTime;
  const responseTime: number[] = history.map((log) => log.responseTime);
  const toolsCalled: number[] = history.map((log) => log.toolsCalled.length);

  const averageToolsCalled =
    toolsCalled.reduce((total, toolnumb) => total + toolnumb, 0) /
    toolsCalled.length;

  const averageResponseTime =
    responseTime.reduce((total, time) => total + time, 0) / responseTime.length;

  const percentageIncreaseTool =
    ((currentToolsCalled - averageToolsCalled) / averageToolsCalled) * 100;
  const percentageIncreaseTime =
    ((currentResponseTime - averageResponseTime) / averageResponseTime) * 100;
  const responseTimeIsAnomalous =
    percentageIncreaseTime > RESPONSE_TIME_THRESHOLD;
  const toolsCalledIsAnamolous =
    percentageIncreaseTool > TOOLS_CALLED_THRESHOLD;

  if (responseTimeIsAnomalous) {
    anomalies.push({
      type: "ResponseTime Anomaly",
      average: averageResponseTime,
      current: currentResponseTime,
      reason: `Current response time is ${percentageIncreaseTime}% higher than the average response time`,
    });
  }
  if (toolsCalledIsAnamolous) {
    anomalies.push({
      type: "ToolsCalled Anomaly",
      average: averageToolsCalled,
      current: currentToolsCalled,
      reason: `The amount of tools called is ${percentageIncreaseTool}% higher than the average tool calls`,
    });
  }

  return {
    status: anomalies.length > 0 ? "Detected" : "None",
    anomalies: anomalies,
  };
}
