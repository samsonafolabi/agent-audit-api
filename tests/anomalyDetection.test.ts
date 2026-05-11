import { describe, it, expect } from "vitest";
import { anomalyDetector } from "../lib/anomalyDetection";

describe("anomalyDetector", () => {
  it("should return None when history is empty", () => {
    const result = anomalyDetector(
      {
        id: "1",
        agentId: "agent-test",
        intent: "transfer funds to user account",
        outcome: "transfer completed successfully",
        toolsCalled: ["bank-api"],
        responseTime: 320,
        timestamp: new Date(),
        createdAt: new Date(),
      },
      [],
    );

    expect(result.status).toBe("None");
  });

  it("should return Detected when responseTime spikes above threshold", () => {
    const result = anomalyDetector(
      {
        id: "1",
        agentId: "agent-test",
        intent: "transfer funds to user account",
        outcome: "transfer completed successfully",
        toolsCalled: ["bank-api"],
        responseTime: 10000,
        timestamp: new Date(),
        createdAt: new Date(),
      },
      [
        {
          id: "1",
          agentId: "agent-test",
          intent: "transfer funds to user account",
          outcome: "transfer completed successfully",
          toolsCalled: ["bank-api"],
          responseTime: 320,
          timestamp: new Date(),
          createdAt: new Date(),
        },
        {
          id: "1",
          agentId: "agent-test",
          intent: "transfer funds to user account",
          outcome: "transfer completed successfully",
          toolsCalled: ["bank-api"],
          responseTime: 320,
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ],
    );

    expect(result.status).toBe("Detected");
  });

  it("should return None when responseTime is within threshold", () => {
    const result = anomalyDetector(
      {
        id: "1",
        agentId: "agent-test",
        intent: "transfer funds to user account",
        outcome: "transfer completed successfully",
        toolsCalled: ["bank-api"],
        responseTime: 200,
        timestamp: new Date(),
        createdAt: new Date(),
      },
      [
        {
          id: "1",
          agentId: "agent-test",
          intent: "transfer funds to user account",
          outcome: "transfer completed successfully",
          toolsCalled: ["bank-api"],
          responseTime: 320,
          timestamp: new Date(),
          createdAt: new Date(),
        },
        {
          id: "1",
          agentId: "agent-test",
          intent: "transfer funds to user account",
          outcome: "transfer completed successfully",
          toolsCalled: ["bank-api"],
          responseTime: 320,
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ],
    );

    expect(result.status).toBe("None");
  });
});
