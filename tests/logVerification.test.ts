import { describe, it, expect } from "vitest";
import { verifyLog } from "../lib/logVerification";

describe("verifyLog", () => {
  it("should return pass when intent matches outcome", () => {
    const result = verifyLog({
      id: "1",
      agentId: "agent-test",
      intent: "transfer funds to user account",
      outcome: "transfer completed successfully",
      toolsCalled: ["bank-api"],
      responseTime: 320,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    expect(result.status).toBe("pass");
  });
});

describe("verifyLog", () => {
  it("should return fail when outcome contains failure signals", () => {
    const result = verifyLog({
      id: "1",
      agentId: "agent-test",
      intent: "transfer funds to user account",
      outcome: "transfer failed due to timeout",
      toolsCalled: ["bank-api"],
      responseTime: 320,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    expect(result.status).toBe("fail");
  });
});

describe("verifyLog", () => {
  it("should return fail when intent keywords don't appear in outcome", () => {
    const result = verifyLog({
      id: "1",
      agentId: "agent-test",
      intent: "transfer funds to user account",
      outcome: "weather is bad",
      toolsCalled: ["bank-api"],
      responseTime: 320,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    expect(result.status).toBe("fail");
  });
});
