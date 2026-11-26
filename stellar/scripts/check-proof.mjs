import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dir = '.artifacts/zk/main/';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const signals = read(dir + 'public.json');
assert.deepEqual(signals, read('.local/expected.json'), 'Circom and fixture signal ordering');
const altered = [...signals];
altered[4] = read('.local/round.json').needs[1];

const { groth16, wtns } = await import('snarkjs');
const vk = read(dir + 'verification_key.json');
const proof = read(dir + 'proof.json');
assert.equal(await groth16.verify(vk, signals, proof), true);
assert.equal(await groth16.verify(vk, altered, proof), false);
console.log('Groth16 accepted original ballot and rejected the same proof for the other registered need.');

const wasm = dir + 'main_js/main.wasm';
const input = read('circuits/input.json');
for (const invalid of [
  {weight: 0}, {weight: input.allowance + 1}, {allowance: 101}, {directions: [2, 0]}
]) {
  await assert.rejects(wtns.calculate({...input, ...invalid}, wasm, {type: 'mem'}));
}
const changed = {type: 'mem'};
await wtns.calculate({...input, secret: (BigInt(input.secret) + 1n).toString()}, wasm, changed);
const values = await wtns.exportJson(changed);
assert.notEqual(values[1].toString(), signals[0], 'unissued credential derives another root');
console.log('Witness rejected invalid ranges and path directions. An unissued credential changes the root.');
process.exit(0);
