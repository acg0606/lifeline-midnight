import { CompiledContract } from "@midnight-ntwrk/compact-js";
import * as LifelineContract from "../managed/lifeline/contract/index.js";
import { createWitnesses } from "./witnesses";

export * as Lifeline from "../managed/lifeline/contract/index.js";
export { createLifelinePrivateState, createWitnesses, setVoteWitness } from "./witnesses";
export type { LifelinePrivateState } from "./witnesses";

export const CompiledLifelineContract = CompiledContract.make("lifeline", LifelineContract.Contract).pipe(
  CompiledContract.withWitnesses(createWitnesses()),
  CompiledContract.withCompiledFileAssets("./managed/lifeline"),
);
