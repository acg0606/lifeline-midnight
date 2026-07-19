import { deployContract, findDeployedContract, type FoundContract } from "@midnight-ntwrk/midnight-js-contracts";
import type { ContractAddress } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import { toHex } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { map, type Observable } from "rxjs";
import * as Lifeline from "@/contracts/managed/lifeline/contract/index.js";
import {
  CompiledLifelineContract,
  createLifelinePrivateState,
  setVoteWitness,
  type LifelinePrivateState,
} from "@/contracts/src/index";

export const lifelinePrivateStateKey = "lifelinePrivateState" as const;
export type LifelinePrivateStateId = typeof lifelinePrivateStateKey;
export type LifelineCircuitKey = "createCycle" | "registerNeed" | "castPrivateVote" | "closeCycle";
export type LifelineProviders = MidnightProviders<LifelineCircuitKey, LifelinePrivateStateId, LifelinePrivateState>;
export type DeployedLifelineContract = FoundContract<any>;

export type LifelineChainState = {
  readonly cycleOpen: boolean;
  readonly cycleNumber: number;
  readonly cycleId: string;
  readonly registeredNeeds: readonly string[];
  readonly voteTotalFor: (commitment: Uint8Array) => number;
  readonly totalVotingWeight: number;
  readonly winningNeed: string;
};

export type LifelineTxReceipt = {
  readonly transactionId: string;
  readonly contractAddress: string;
};

const extractTransactionId = (result: unknown): string => {
  const value = result as {
    public?: { txId?: { toString(): string }; transactionId?: { toString(): string } };
    txId?: { toString(): string };
  };
  return (
    value?.public?.txId?.toString?.() ??
    value?.public?.transactionId?.toString?.() ??
    value?.txId?.toString?.() ??
    "confirmada-no-indexador"
  );
};

export class LifelineMidnightAPI {
  private constructor(
    public readonly deployedContract: DeployedLifelineContract,
    providers: LifelineProviders,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = providers.publicDataProvider
      .contractStateObservable(this.deployedContractAddress, { type: "latest" })
      .pipe(
        map((contractState) => Lifeline.ledger(contractState.data)),
        map((ledger): LifelineChainState => {
          const registeredNeeds: string[] = [];
          for (const [commitment, registered] of ledger.registeredNeeds) {
            if (registered) registeredNeeds.push(toHex(commitment));
          }
          return {
            cycleOpen: ledger.cycleOpen,
            cycleNumber: Number(ledger.cycleNumber),
            cycleId: toHex(ledger.cycleId),
            registeredNeeds,
            voteTotalFor: (commitment) =>
              ledger.voteTotals.member(commitment) ? Number(ledger.voteTotals.lookup(commitment).read()) : 0,
            totalVotingWeight: Number(ledger.totalVotingWeight),
            winningNeed: toHex(ledger.winningNeed),
          };
        }),
      );
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<LifelineChainState>;

  async createCycle(cycleId: Uint8Array): Promise<LifelineTxReceipt> {
    const result = await (this.deployedContract as any).callTx.createCycle(cycleId);
    return { transactionId: extractTransactionId(result), contractAddress: this.deployedContractAddress };
  }

  async registerNeed(commitment: Uint8Array): Promise<LifelineTxReceipt> {
    const result = await (this.deployedContract as any).callTx.registerNeed(commitment);
    return { transactionId: extractTransactionId(result), contractAddress: this.deployedContractAddress };
  }

  async castPrivateVote(commitment: Uint8Array, votingWeight: number): Promise<LifelineTxReceipt> {
    setVoteWitness(commitment, votingWeight);
    const result = await (this.deployedContract as any).callTx.castPrivateVote();
    return { transactionId: extractTransactionId(result), contractAddress: this.deployedContractAddress };
  }

  async closeCycle(winnerCommitment: Uint8Array): Promise<LifelineTxReceipt> {
    const result = await (this.deployedContract as any).callTx.closeCycle(winnerCommitment);
    return { transactionId: extractTransactionId(result), contractAddress: this.deployedContractAddress };
  }

  static async deploy(providers: LifelineProviders, memberSecret: Uint8Array): Promise<LifelineMidnightAPI> {
    const contract = await deployContract(providers as any, {
      compiledContract: CompiledLifelineContract,
      privateStateId: lifelinePrivateStateKey,
      initialPrivateState: createLifelinePrivateState(memberSecret),
    });
    return new LifelineMidnightAPI(contract as DeployedLifelineContract, providers);
  }

  static async join(
    providers: LifelineProviders,
    contractAddress: ContractAddress,
    memberSecret: Uint8Array,
  ): Promise<LifelineMidnightAPI> {
    const contract = await findDeployedContract(providers as any, {
      contractAddress,
      compiledContract: CompiledLifelineContract,
      privateStateId: lifelinePrivateStateKey,
      initialPrivateState: createLifelinePrivateState(memberSecret),
    });
    return new LifelineMidnightAPI(contract as DeployedLifelineContract, providers);
  }
}
