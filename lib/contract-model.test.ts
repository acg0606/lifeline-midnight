import { describe, expect, it } from "vitest";
import { LifelineContractModel } from "./contract-model";

describe("Lifeline Compact contract invariants", () => {
  it("accepts one private credential per cycle", () => {
    const contract = new LifelineContractModel();
    contract.createCycle("july-2026");
    contract.registerNeed("need-energy");
    contract.castVote("supporter-secret", "need-energy", 80);
    expect(contract.totalFor("need-energy")).toBe(80);
    expect(() => contract.castVote("supporter-secret", "need-energy", 20)).toThrow("credential already used");
  });

  it("enforces the democratic voting cap", () => {
    const contract = new LifelineContractModel();
    contract.createCycle("july-2026");
    contract.registerNeed("need-card");
    expect(() => contract.castVote("supporter", "need-card", 101)).toThrow("invalid voting weight");
  });

  it("rejects unregistered needs and votes after closing", () => {
    const contract = new LifelineContractModel();
    contract.createCycle("july-2026");
    contract.registerNeed("need-energy");
    expect(() => contract.castVote("supporter", "fake", 10)).toThrow("unknown need");
    contract.closeCycle("need-energy");
    expect(() => contract.castVote("another", "need-energy", 10)).toThrow("cycle is closed");
  });
});
