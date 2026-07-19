# Lifeline — Midnight Hackathon submission

## Track

**DeFi Track.** Lifeline protects a beneficiary's financial obligations, supporters' identities, individual contribution weights, and social graph while making collective prioritization mathematically verifiable.

## One sentence

Lifeline is a private financial recovery circle where trusted supporters coordinate which urgent need to prioritize without putting a vulnerable person's financial hardship on a public ledger.

## Problem

People facing unemployment or temporary hardship often need recurring help rather than a one-time donation. Existing crowdfunding products force them to choose between receiving support and exposing debts, creditors, balances, and personal relationships.

## Solution

The beneficiary keeps need details locally and publishes only opaque commitments. Trusted supporters receive an encrypted fragment-only link, contribute demo voting weight, and cast a cycle-scoped private vote using a local secret witness. A nullifier prevents the same local credential from voting twice. The ledger contains only minimal coordination state and aggregate totals.

## Why Midnight

This is not a normal database problem. The group must verify one-vote-per-local-credential, the voting cap, registered choices and the aggregate result without centralizing the underlying financial and social data. Compact witnesses and zero-knowledge proofs are the product primitive, not an ornamental blockchain integration.

## Privacy table

| Information | Location | Public? |
|---|---|---|
| Need description, creditor, value, due date | Beneficiary device | No |
| Supporter identity and local secret | Supporter device | No |
| Local credential secret | Witness/proof input | No |
| Vote state transition | Midnight ledger | Aggregate change is public; no real identity is attached |
| Salted need commitment | Midnight ledger | Yes |
| Cycle status and aggregate weight | Midnight ledger | Yes |
| Cycle-scoped nullifier | Midnight ledger | Yes, unlinkable to real identity |
| Winning need commitment | Midnight ledger | Yes |

## Contract invariants

1. Only registered need commitments may receive votes.
2. A local member secret produces one nullifier for each cycle.
3. A nullifier can be consumed only once.
4. Voting weight must be between 1 and 100.
5. Closed cycles cannot receive registrations or votes.
6. The winner must be a registered need commitment.

## Live demo

1. Open the deployed Lifeline interface.
2. Show beneficiary mode and protected values.
3. Add a need; explain that details stay on-device and only the commitment goes on-chain.
4. Copy the encrypted invitation, open supporter mode and connect Lace on Preprod.
5. Cast a vote with a local witness secret.
6. Attempt to vote again and show nullifier rejection.
7. Close the cycle and show the winning commitment and transaction identifier.
8. Open the privacy page and compare private versus public data.

## Honest fallback

If Preprod or the proof server is unavailable during judging, use the clearly labelled local demo adapter. Never present a `demo_*` receipt as a Midnight transaction. Show the Compact source and the contract-invariant test suite alongside the fallback.

## Submission links

- Live demo: https://ac990f9f0776.vercel.app
- Source repository: add public GitHub URL
- Demo video: add video URL
- Contract: `contracts/lifeline.compact`

## Pitch

Financial hardship should not become a permanent public record. Lifeline lets a person create a private recovery circle, share selected needs through an encrypted invitation, and coordinate which obligation to prioritize. Midnight proves that a local voting credential was not reused, that no vote exceeded the democratic cap, and that the result came from registered need commitments. The ledger sees commitments and aggregate outcomes—not names, creditors, debt descriptions, or the person's social graph. Lifeline does not put financial hardship on-chain. It puts proof of fair support on-chain.
