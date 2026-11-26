import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFixture, permute, member, parent, pair } from '../scripts/credentials.mjs';

test('matches the published BLS12-381 Poseidon2 width-three vector', () => {
  const expected = [
    '1b152349b1950b6a8ca75ee4407b6e26ca5cca5650534e56ef3fd45761fbf5f0',
    '4c5793c87d51bdc2c08a32108437dc0000bd0275868f09ebc5f36919af5b3891',
    '1fc8ed171e67902ca49863159fe5ba6325318843d13976143b8125f08b50dc6b'
  ];
  assert.deepEqual(permute([0n,1n,2n]).map(x => x.toString(16)), expected);
});

for (const index of [0, 1, 2, 3]) {
  test('credential opens the authorized tree at position ' + index, () => {
    const { input, publicRound } = buildFixture(31, index);
    let leaf = member(input.secret, input.allowance);
    for (let i = 0; i < 2; i++) {
      leaf = input.directions[i] ? parent(input.siblings[i], leaf) : parent(leaf, input.siblings[i]);
    }
    assert.equal(leaf, publicRound.root);
    assert.notEqual(pair(input.secret, 31n, 3), pair(input.secret, 32n, 3));
  });
}
