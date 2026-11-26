import { readFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';

export const field = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n;
const constants = readFileSync(new URL('../circuits/round-constants.circom', import.meta.url), 'utf8')
  .match(/0x[0-9a-f]{64}/g).map(BigInt);
if (constants.length !== 192) throw new Error('Incomplete Poseidon2 constants');

export function permute(input) {
  const initialSum = input.reduce((a, b) => a + b, 0n);
  let state = input.map(x => (x + initialSum) % field);
  for (let r = 0; r < 64; r++) {
    const full = r < 4 || r >= 60;
    const s = state.map((x, i) => full || i === 0 ? (x + constants[3*r+i]) ** 5n % field : x);
    const sum = s[0] + s[1] + s[2];
    state = s.map((x, i) => (sum + x * (!full && i === 2 ? 2n : 1n)) % field);
  }
  return state;
}

export const pair = (a, b, domain) => permute([a, b, BigInt(domain)])[0];
export const member = (secret, allowance) => pair(secret, BigInt(allowance), 1);
export const parent = (a, b) => pair(a, b, 2);
export const newSecret = () => BigInt('0x' + randomBytes(31).toString('hex'));

export function needCommitment(label, salt = randomBytes(32)) {
  const bytes = createHash('sha256').update('Lifeline/need/v1\0').update(salt).update(label).digest();
  return BigInt('0x' + bytes.subarray(0, 31).toString('hex'));
}

export function buildFixture(cycle = Date.now(), index = 0, weight = 12) {
  if (!Number.isSafeInteger(cycle) || cycle < 1) throw new Error('Invalid cycle');
  if (![0, 1, 2, 3].includes(index)) throw new Error('Invalid supporter index');
  const allowances = [24, 16, 70, 100];
  const secrets = allowances.map(newSecret);
  const leaves = allowances.map((a, i) => member(secrets[i], a));
  const level = [parent(leaves[0], leaves[1]), parent(leaves[2], leaves[3])];
  const needs = ['Electricity', 'Transport'].map(label => needCommitment(label));
  const input = {
    secret: secrets[index], allowance: allowances[index], siblings: [leaves[index ^ 1], level[(index >> 1) ^ 1]],
    directions: [index & 1, index >> 1], cycle, need: needs[0], weight
  };
  const nullifier = pair(input.secret, BigInt(cycle), 3);
  const root = parent(...level);
  return {
    input, publicRound: {cycle, root, needs},
    signals: [root, nullifier, pair(nullifier, needs[0], 4), BigInt(cycle), needs[0], BigInt(weight)]
  };
}
export const json = value => JSON.stringify(value, (_, x) => typeof x === 'bigint' ? x.toString() : x, 2);
