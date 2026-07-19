import { createHash } from "node:crypto";

export class LifelineContractModel {
  private open = false;
  private cycleId = "";
  private readonly needs = new Set<string>();
  private readonly nullifiers = new Set<string>();
  private readonly totals = new Map<string, number>();

  createCycle(cycleId: string) {
    if (this.open) throw new Error("a cycle is already open");
    this.cycleId = cycleId;
    this.open = true;
  }

  registerNeed(commitment: string) {
    if (!this.open) throw new Error("cycle is closed");
    if (this.needs.has(commitment)) throw new Error("need already registered");
    this.needs.add(commitment);
    this.totals.set(commitment, 0);
  }

  castVote(secret: string, need: string, weight: number) {
    if (!this.open) throw new Error("cycle is closed");
    if (!this.needs.has(need)) throw new Error("unknown need");
    if (!Number.isInteger(weight) || weight <= 0 || weight > 100) throw new Error("invalid voting weight");
    const nullifier = createHash("sha256").update(`lifeline:vote:${secret}:${this.cycleId}`).digest("hex");
    if (this.nullifiers.has(nullifier)) throw new Error("credential already used in this cycle");
    this.nullifiers.add(nullifier);
    this.totals.set(need, (this.totals.get(need) ?? 0) + weight);
  }

  closeCycle(winner: string) {
    if (!this.open) throw new Error("cycle is already closed");
    if (!this.needs.has(winner)) throw new Error("unknown winning need");
    this.open = false;
  }

  totalFor(need: string) { return this.totals.get(need) ?? 0; }
}
