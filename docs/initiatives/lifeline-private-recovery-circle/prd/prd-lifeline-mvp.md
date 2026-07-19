# PRD — Lifeline MVP (Private Recovery Circle)

**Filename:** prd-lifeline-mvp  
**Version:** 1.0  
**Date:** 2026-07-19  
**Status:** Implemented (hackathon MVP) — use for regression, handoff e próximos incrementos  
**Related:** [1-pager](./1-pager-lifeline-private-recovery-circle.md), [solutions v1](../solutions/solutions-private-recovery-circle-v1.md)

## 1. Introduction / Overview

Lifeline permite que um beneficiário registre necessidades financeiras no device, publique apenas commitments na Midnight, convide apoiadores por link criptografado e obtenha uma priorização coletiva verificável. O MVP prova o fluxo DeFi-privacy na Preprod com Lace, com fallback local explicitamente rotulado.

## 2. Goals

1. Executar `createCycle`, `registerNeed`, `castPrivateVote` e `closeCycle` com identificadores de transação reais na Preprod.
2. Garantir um voto por credencial local por ciclo via nullifier.
3. Limitar peso de voto a 1–100 no contrato.
4. Manter descrição, credor, valor, vencimento, identidade e segredo local fora do ledger.
5. Permitir demo sem Lace sem rotular recibos `demo_*` como on-chain.

## 3. User Stories

1. Como **beneficiário**, quero adicionar necessidades só no meu device para não expor valores publicamente.
2. Como **beneficiário**, quero publicar o ciclo na Preprod para obter prova on-chain das regras.
3. Como **beneficiário**, quero copiar um convite criptografado para chamar só pessoas de confiança.
4. Como **apoiador**, quero abrir o convite e entrar no modo apoiador sem o servidor ler o payload.
5. Como **apoiador**, quero contribuir créditos demo e votar uma necessidade com meu peso limitado.
6. Como **apoiador**, quero ser impedido de votar de novo no mesmo ciclo.
7. Como **beneficiário**, quero encerrar o ciclo e ver o commitment vencedor + recibo.
8. Como **qualquer usuário**, quero uma página que explique o que é privado vs público.
9. Como **demo operator**, quero resetar o estado local e repetir o script de julgagem.

## 4. Functional Requirements

1. The system must support roles `beneficiary` and `supporter`, with UI switch and invite-forced supporter mode.
2. The system must persist circle state in browser storage (`lifeline-demo-v1`) and offer one-click reset.
3. The system must keep need description, creditor, amount, and due date in local state only.
4. The system must derive a salted `Bytes<32>` commitment per need for on-chain registration.
5. The system must deploy or join the Compact contract via Lace Connector API on Midnight Preprod when Lace is available.
6. The system must call `createCycle` with a new cycle id when the beneficiary publishes.
7. The system must call `registerNeed` for each need commitment in an open cycle.
8. The system must generate an encrypted fragment-only invitation URL that does not send the payload to the hosting server.
9. The system must allow supporters to add demo contribution credits that affect voting weight display, with no economic value.
10. The system must call `castPrivateVote` using local member secret, need commitment, and capped weight witnesses.
11. The system must enforce voting weight between 1 and 100 in the Compact contract.
12. The system must reject a second vote from the same local credential in the same cycle via nullifier.
13. The system must call `closeCycle` with a registered winning need commitment.
14. The system must display live indexer-backed aggregates when in Midnight mode.
15. The system must use a clearly labelled local demo adapter when Lace/Preprod is unavailable, with `demo_*` receipt ids.
16. The system must provide Overview, Needs, Voting, Results, and Privacy views on desktop and mobile.
17. The system must allow toggling protected values in the UI.
18. The system must copy proving keys / ZKIR into the static site build (`midnight:assets`).

## 5. Non-Goals (Out of Scope)

1. Fiat, PIX, boleto, debt document upload, or economically valuable token transfer.
2. Public marketplace of needs or open crowdfunding pages.
3. KYC / real-world identity on-chain.
4. Multi-circle portfolio, reputation across circles, or secondary markets for votes.
5. Production custody, recovery of lost local secrets, or institutional compliance suite.
6. Server-side storage of need payloads.

## 6. Design Considerations

- Primary journeys: beneficiary publish → invite; supporter vote → nullifier demo; close → privacy page.
- Visual language: calm recovery product (Manrope), not neon-crypto casino.
- Mobile-responsive; touch targets usable for voting actions.
- Network strip must make Preprod vs demo unmistakable.
- Existing UI lives in `components/lifeline-app.tsx`.

## 7. Technical Considerations

- Stack: Vite + React 19, MidnightJS 4.1.1, Compact contract `contracts/lifeline.compact`.
- Local proof server via Docker; Lace configured to `http://localhost:6300`.
- Env: `VITE_LIFELINE_MODE`, `VITE_MIDNIGHT_NETWORK`, `VITE_LIFELINE_CONTRACT_ADDRESS`.
- Tests: `lib/contract-model.test.ts`, `lib/voting.test.ts`, `lib/private-invite.test.ts`.
- Vercel does not compile Compact; ship `contracts/managed/lifeline` artifacts.

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Circuitos reais na Preprod | 4/4 no script de aceitação |
| Rejeição de segundo voto | 100% nas demos |
| Vazamentos sensíveis no ledger/indexer | 0 |
| Testes automatizados | ≥7 passando |
| Build produção | `npm run build` verde |
| Clareza demo vs on-chain | 0 recibos `demo_*` apresentados como Midnight |

## 9. Open Questions

1. A1 — Beneficiários reais preferem círculo privado a campanha pública? (untested)
2. A2 — Qual % de apoiadores completa Lace sem moderação? (untested)
3. A3 — Commitments opacos são aceitáveis sem revelar valores off-chain? (untested)
4. Qual rail de settlement off-chain entra depois do hackathon, se algum?
5. Como recuperar círculo se o beneficiário perder o browser state?

## Appendix — Contract invariants (product requirements)

1. Only registered need commitments may receive votes.
2. A local member secret produces one nullifier per cycle.
3. A nullifier can be consumed only once.
4. Voting weight must be between 1 and 100.
5. Closed cycles cannot receive registrations or votes.
6. The winner must be a registered need commitment.
