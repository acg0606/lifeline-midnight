import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { buildStellarVerifyProofArgs } from '@caatinga/zk';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const id = read('caatinga.artifacts.json').networks.testnet.contracts.verifier.contractId;
const source = process.env.CAATINGA_SOURCE;
if (!source) throw new Error('Set CAATINGA_SOURCE to a funded testnet Stellar CLI identity alias.');
const setup = read('.local/round.json');
const signals = read('.artifacts/zk/main/public.json');
assert.deepEqual(signals, read('.local/expected.json'));
const proof = read('.artifacts/zk/main/proof.json');
const receipts = [];
const rpc = 'https://soroban-testnet.stellar.org';

function call(method, args, send) {
  const child = spawnSync('stellar', ['contract', 'invoke', '--id', id, '--network', 'testnet',
    '--source', source, '--send', send ? 'yes' : 'no', '--', method, ...args], {encoding:'utf8'});
  if (child.status !== 0) throw new Error(child.error?.message || child.stderr.trim());
  if (!send) return JSON.parse(child.stdout);
  const hash = child.stderr.match(/\/tx\/([a-f0-9]{64})/i)?.[1]
    ?? child.stderr.match(/(?:transaction hash is|transaction hash:|submitting transaction:)\s*([a-f0-9]{64})/i)?.[1];
  if (!hash) throw new Error('Missing transaction receipt: ' + child.stderr);
  return { hash, value: child.stdout.trim() ? JSON.parse(child.stdout) : null };
}

async function send(label, method, args) {
  const {hash, value} = call(method, args, true);
  let confirmed;
  for (let i = 0; i < 8; i++) {
    const response = await fetch(rpc, {method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({jsonrpc:'2.0', id: Date.now(), method:'getTransaction', params:{hash}})});
    if (!response.ok) throw new Error('RPC returned HTTP ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    if (data.result?.status === 'SUCCESS') { confirmed = data.result; break; }
    if (data.result?.status === 'FAILED') throw new Error('Transaction failed: ' + hash);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  if (!confirmed) throw new Error('Unconfirmed transaction: ' + hash);
  const receipt = {label, method, hash, ledger:confirmed.ledger, result:value};
  receipts.push(receipt);
  console.log(label, JSON.stringify(value), hash);
  return value;
}

const current = call('round', [], false);
if (current?.open && String(current.cycle) !== String(setup.cycle)) {
  throw new Error('An earlier round is still open. Close it with its admin before running another demo.');
}
if (!current || String(current.cycle) !== String(setup.cycle)) {
  await send('open', 'open_round', ['--cycle',String(setup.cycle),'--root',setup.root,
    '--first',setup.needs[0],'--second',setup.needs[1]]);
} else {
  assert.equal(current.open, true);
  assert.equal(String(current.root), setup.root);
  assert.equal(current.first_total, 0, 'Use a fresh round after a completed or partially counted demo.');
}

function ballotArgs(publicSignals) {
  return buildStellarVerifyProofArgs({proof, publicSignals, embedVk:true});
}
const tally = () => {
  const state = call('round', [], false);
  return [state.first_total, state.second_total];
};
function outcome(value) {
  return Array.isArray(value) ? value[0] : typeof value === 'string' ? value : Object.keys(value)[0];
}

assert.deepEqual(tally(), [0,0]);
assert.equal(outcome(await send('valid', 'cast_vote', ballotArgs(signals))), 'Counted');
const counted = [Number(signals[5]), 0];
assert.deepEqual(tally(), counted);
const wrongNeed = [...signals];
wrongNeed[4] = setup.needs[1];
assert.equal(outcome(await send('invalid', 'cast_vote', ballotArgs(wrongNeed))), 'InvalidProof');
assert.deepEqual(tally(), counted);
assert.equal(outcome(await send('repeat', 'cast_vote', ballotArgs(signals))), 'AlreadyVoted');
assert.deepEqual(tally(), counted);
await send('close', 'close_round', []);
mkdirSync('evidence', {recursive:true});
writeFileSync('evidence/' + setup.cycle + '.json', JSON.stringify({
  network:'testnet', contractId:id, cycle:setup.cycle, tally:counted, receipts
}, null, 2) + '\n');
