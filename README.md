# Lifeline

**Private support. Collective decisions. A safer way to start over.**

Lifeline is a privacy-first financial recovery circle built for the 2026 MLH Midnight Hackathon. A beneficiary shares selected needs with trusted supporters, supporters contribute demo credits and cast capped, weighted votes, and the group produces a verifiable decision without publishing financial or social data.

## What works

- Beneficiary and supporter journeys
- Add private needs locally and register only their commitments on Midnight
- Demo contribution credits
- Real Preprod contract deployment from Lace
- Real `createCycle`, `registerNeed`, `castPrivateVote` and `closeCycle` calls
- Weighted voting capped at 100 credits by the Compact contract
- Cycle-scoped nullifier that rejects credential reuse on-chain
- Live indexer state in the interface
- Encrypted, fragment-only invitation links for trusted supporters
- Local proof server integration through the Lace configuration
- Privacy explainer and responsive mobile interface
- Persistent browser state with one-click reset
- Seven automated tests plus a Vite production build

## Hackathon track

Lifeline targets the **Midnight DeFi Track**. Its core contract is [`contracts/lifeline.compact`](contracts/lifeline.compact), and the complete submission narrative is in [`docs/HACKATHON_SUBMISSION.md`](docs/HACKATHON_SUBMISSION.md).

## Scope and honest boundaries

With Lace on Preprod, the interface deploys or joins the real Compact contract and presents finalized transaction identifiers. Without Lace, it remains an explicitly labelled local fallback and never labels a demo receipt as an on-chain transaction.

Contribution credits model the governance flow and have no economic value. No fiat, PIX, boleto, debt document, seed phrase or economically valuable token is transferred or uploaded. A production payment rail is deliberately outside this hackathon MVP.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo script

1. Start the local proof server and open the app in Chrome.
2. Connect Lace on Midnight Preprod.
3. Click **Publicar na Preprod** and approve the wallet operations.
4. Copy the encrypted supporter invitation.
5. Use **Ver como apoiador**, open **Votação**, and prioritize one need.
6. Attempt a second vote to demonstrate nullifier rejection.
7. Return to beneficiary mode and close the cycle.
8. Show the transaction receipt, verified ledger state, and privacy page.

## Verification

```bash
npm test
npm run build
```

## Midnight Preprod

```bash
npm run midnight:compile
npm install
npm run build
npm run dev
```

The Compact compiler output must exist at `contracts/managed/lifeline`. The Vite build copies its proving keys and ZKIR files into the static site. Configure an already deployed contract, when desired, with:

```env
VITE_LIFELINE_MODE=midnight
VITE_MIDNIGHT_NETWORK=preprod
VITE_LIFELINE_CONTRACT_ADDRESS=<contract-address>
```

## Privacy boundary

Private/local: need descriptions and amounts, supporter identity and local secret, invitation payload, documents and payment data.

Public/minimal: opaque need commitments, cycle status, aggregate vote totals, winning commitment and cycle-scoped nullifiers.
