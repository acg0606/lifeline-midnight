# Lifeline on Stellar

A beneficiary opens a private recovery circle. Four demo supporters each receive a credential with an allowance of 1–100 voting credits. A supporter chooses between two registered needs. Soroban verifies eligibility and weight and counts each credential once per round. The React interface lets reviewers verify a public sample in their browser and inspect confirmed testnet receipts.

The public [testnet receipt log](evidence/1795727221965.json) records the accepted ballot, altered ballot and replay. The [Caatinga friction log](FRICTION.md) documents the build and deploy observations.

## Try the interface

From the repository root, with Node 22.12 or later:

```sh
cd stellar
npm ci
npm run dev
```

Choose the electricity or transport bill and verify the same proof locally. The on-chain demonstration uses the CLI below. `npm run web:build` produces the static site in `dist/`.

## Reproduce a new testnet deployment

Install Rust 1.91.1, the `wasm32v1-none` target and Stellar CLI 28.0.0. The workspace uses Caatinga 3.14.0. The project was initialized with `ctg zk init lifeline-stellar-starter --minimal` and the example circuit was replaced. Run the following from `stellar/` in a fresh checkout:

```sh
rustup target add wasm32v1-none
npm ci
npm test
npm run fixture
npm run zk:build
npm run zk:prove
npm run test:proof
npm run build
cargo test --locked --manifest-path contracts/verifier/Cargo.toml
```

Set up a local **testnet** signing identity. Use an existing funded alias or create a new one:

```sh
export CAATINGA_SOURCE=lifeline-dev
stellar keys generate "$CAATINGA_SOURCE" --network testnet --fund
npx ctg doctor --network testnet --source "$CAATINGA_SOURCE"
npx ctg deploy verifier --network testnet --source "$CAATINGA_SOURCE" --force --no-generate
npm run demo:testnet
node scripts/export-ballot.mjs
npm run web:build
```

The repository contains the original deployment artifact. In a fresh checkout, `--force` creates your own contract instance and updates your **local** artifact, so you can administer your demo round. Caatinga embeds a fresh verification key on every development build. Use the proof, key and WASM from the same build. Preserve released artifacts when reproducing the project.

The testnet script opens the round, submits a valid proof, changes the public destination and resubmits the same proof, repeats the original vote and closes the round. It checks transaction finality via Stellar RPC, the contract return values and both totals after each attempt. Logical rejections are finalized transactions returning `InvalidProof` or `AlreadyVoted`. Receipts are stored under `evidence/`. For a new demo on the same instance, use `npm run fixture` and `npm run zk:prove` to prepare a fresh cycle after the previous one closes.

## Circuit and contract

`circuits/main.circom` opens a depth-two Merkle path for a leaf committing to the member secret and allowance. It enforces a positive vote bounded by that allowance and a maximum allowance of 100. A domain-separated nullifier binds the secret to the cycle. Another hash binds the ballot to its public need commitment. The circuit exposes the root, nullifier, ballot tag, cycle, need and weight in that order.

`contracts/verifier/src/circle.rs` checks the active root, cycle, need and canonical field encoding. Only the contract's embedded verification key can authorize a tally update. The count and spent marker change atomically. The administrator opens and closes rounds. Each instance holds the current round, and testnet receipts preserve prior decisions. The verifiable result is the pair of totals. Equal totals represent a tie.

The hash uses the width-three BLS12-381 scalar-field Poseidon2 parameters from [HorizenLabs](https://github.com/HorizenLabs/poseidon2/tree/055bde3f4782731ba5f5ce5888a440a94327eaf3), with distinct domains for credentials, tree nodes, nullifiers and ballots. The unit tests use the upstream known-answer vector. The verifier scaffold comes from [Caatinga](https://github.com/Dione-b/caatinga). Both notices are included alongside the corresponding sources.

## Privacy and trust assumptions

- The organizer controls the roster, allowances, contract upgrade and round boundaries. The proof establishes one vote per issued credential per round. One human can hold several credentials if the organizer issues them.
- The synthetic fixture acts as both issuer and supporter on one development machine. A production enrollment flow would have holders generate their own secrets and send commitments to the issuer. The proving script reads the witness locally. Treat a shared credential as a bearer credential.
- An observer can see the submitting wallet, timing, weight, opaque need ID, nullifier and totals. The sender can be correlated with other wallet activity. A copied proof can be submitted first, but cannot redirect the vote or count it twice. Reusing the same secret and cycle ID in other instances can correlate nullifiers.
- The demo assigns salted commitments to sample bill labels. The proof says nothing about the existence, balance or payment of a real debt. There are no transfers. The public sample explicitly reveals its two fictional labels for demonstration.
- The single-party Groth16 setup is for testnet. Private input, local secrets and proving intermediate files are excluded from Git. The public ballot includes the verification key, proof and public signals needed to independently replay the verification.
