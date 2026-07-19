# Midnight Preprod runbook

This is the shortest path from the Vercel demo to a real Midnight transaction.

## 1. Workstation

Use Linux, macOS, or Windows through WSL2. Install:

- Node.js 22+
- Docker Desktop with WSL integration enabled
- Google Chrome
- Lace wallet extension
- Compact toolchain and compiler 0.31.1 or the version required by the current template

Run:

```bash
bash scripts/midnight-preflight.sh
```

## 2. Wallet

1. In Lace, enable Midnight and select **Preprod**.
2. Copy the **Unshielded** Midnight address.
3. Request tNIGHT from `https://midnight-tmnight-preprod.nethermind.dev/`.
4. In Lace, select **Generate tDUST** and confirm.
5. Wait until the tDUST balance is non-zero.

Never commit a seed phrase, private key, wallet database, faucet secret, or Vercel token.

## 3. Proof server

```bash
docker compose -f proof-server/docker-compose.yml up -d
docker compose -f proof-server/docker-compose.yml logs -f
```

In Lace, configure the Midnight proof server as:

```text
http://localhost:6300
```

## 4. Compile

```bash
npm run midnight:compile
```

Keep the generated `contracts/managed/lifeline` bindings, ZKIR and proving/verifying keys in the deployment bundle. Vercel does not run the Compact compiler.

## 5. Deploy and configure

Run the browser DApp and click **Publicar na Preprod**. The app uses Lace Connector API 4.x, MidnightJS 4.1.1 and the local proof server reported by Lace. After the first successful deployment, record the Preprod contract address in:

```env
VITE_LIFELINE_MODE=midnight
VITE_MIDNIGHT_NETWORK=preprod
VITE_LIFELINE_CONTRACT_ADDRESS=<contract-address>
```

## 6. Acceptance test

- Lace connects and reports Preprod.
- tDUST is non-zero.
- An encrypted invitation link opens in supporter mode without sending its fragment to Vercel.
- `createCycle` returns a real transaction identifier.
- Four need commitments are registered.
- Supporter A casts one vote.
- The same supporter is rejected on a second vote in the same cycle.
- Supporter B casts a vote.
- `closeCycle` records a registered winning commitment.
- Indexer state matches the aggregate displayed by the UI.
- No need description, creditor, amount, supporter identity, or local secret appears in ledger/indexer inspection.
