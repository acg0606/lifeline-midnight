import { mkdirSync, writeFileSync } from 'node:fs';
import { buildFixture, json } from './credentials.mjs';

const { input, publicRound, signals } = buildFixture();
mkdirSync('.local', { recursive: true, mode: 0o700 });
writeFileSync('circuits/input.json', json(input), {mode: 0o600});
writeFileSync('.local/round.json', json(publicRound));
writeFileSync('.local/expected.json', json(signals));
console.log('Created a synthetic four-supporter round. Private witness saved locally.');
