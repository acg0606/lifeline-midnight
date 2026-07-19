export function cappedVotingWeight(contribution: number, cap = 100) {
  if (!Number.isFinite(contribution) || contribution < 0) throw new Error("Invalid contribution");
  return Math.min(Math.floor(contribution), cap);
}

export function chooseWinner<T extends { id: string; votes: number }>(options: T[]) {
  if (!options.length) throw new Error("No options");
  return [...options].sort((a, b) => b.votes - a.votes || a.id.localeCompare(b.id))[0];
}
