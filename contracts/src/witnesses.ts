export type LifelinePrivateState = {
  readonly memberSecret: Uint8Array;
};

let selectedNeedCommitment: Uint8Array = new Uint8Array(32);
let selectedVotingWeight = 1n;

export const createLifelinePrivateState = (memberSecret: Uint8Array): LifelinePrivateState => ({
  memberSecret,
});

export const setVoteWitness = (needCommitment: Uint8Array, votingWeight: number): void => {
  if (needCommitment.length !== 32) throw new Error("O compromisso da necessidade deve ter 32 bytes.");
  if (!Number.isInteger(votingWeight) || votingWeight < 1 || votingWeight > 100) {
    throw new Error("O peso de voto deve estar entre 1 e 100.");
  }
  selectedNeedCommitment = needCommitment;
  selectedVotingWeight = BigInt(votingWeight);
};

export const createWitnesses = () => ({
  localMemberSecret: ({ privateState }: { privateState: LifelinePrivateState }): [LifelinePrivateState, Uint8Array] => [
    privateState,
    privateState.memberSecret,
  ],
  localNeedCommitment: ({ privateState }: { privateState: LifelinePrivateState }): [LifelinePrivateState, Uint8Array] => [
    privateState,
    selectedNeedCommitment,
  ],
  localVotingWeight: ({ privateState }: { privateState: LifelinePrivateState }): [LifelinePrivateState, bigint] => [
    privateState,
    selectedVotingWeight,
  ],
});
