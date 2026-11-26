// Export only the proof, its public signals, the verification key and public choices.
import { readFileSync, writeFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const dir = '.artifacts/zk/main/';
const snapshot = {
  vk: read(dir + 'verification_key.json'), proof: read(dir + 'proof.json'),
  signals: read(dir + 'public.json'), needs: read('.local/round.json').needs
};
writeFileSync('app/ballot.json', JSON.stringify(snapshot, null, 2) + '\n');
