import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  localMemberSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localNeedCommitment(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localVotingWeight(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  createCycle(context: __compactRuntime.CircuitContext<PS>,
              newCycleId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerNeed(context: __compactRuntime.CircuitContext<PS>,
               needCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castPrivateVote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeCycle(context: __compactRuntime.CircuitContext<PS>,
             winnerCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createCycle(context: __compactRuntime.CircuitContext<PS>,
              newCycleId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerNeed(context: __compactRuntime.CircuitContext<PS>,
               needCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castPrivateVote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeCycle(context: __compactRuntime.CircuitContext<PS>,
             winnerCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  memberNullifier(secret_0: Uint8Array, currentCycle_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  memberNullifier(context: __compactRuntime.CircuitContext<PS>,
                  secret_0: Uint8Array,
                  currentCycle_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  createCycle(context: __compactRuntime.CircuitContext<PS>,
              newCycleId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerNeed(context: __compactRuntime.CircuitContext<PS>,
               needCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castPrivateVote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeCycle(context: __compactRuntime.CircuitContext<PS>,
             winnerCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly cycleId: Uint8Array;
  readonly cycleOpen: boolean;
  readonly cycleNumber: bigint;
  registeredNeeds: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  usedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  voteTotals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { read(): bigint }
  };
  readonly totalVotingWeight: bigint;
  readonly winningNeed: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
