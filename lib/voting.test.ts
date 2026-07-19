import { describe, expect, it } from "vitest";
import { cappedVotingWeight, chooseWinner } from "./voting";

describe("Lifeline voting rules", () => {
  it("caps voting power at 100 credits", () => {
    expect(cappedVotingWeight(500)).toBe(100);
    expect(cappedVotingWeight(50)).toBe(50);
  });

  it("chooses the highest aggregate result deterministically", () => {
    expect(chooseWinner([{ id: "b", votes: 10 }, { id: "a", votes: 10 }]).id).toBe("a");
    expect(chooseWinner([{ id: "a", votes: 10 }, { id: "b", votes: 30 }]).id).toBe("b");
  });
});
