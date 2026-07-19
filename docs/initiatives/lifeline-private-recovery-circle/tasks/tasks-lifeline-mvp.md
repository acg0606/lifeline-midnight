# Tasks — Lifeline MVP

**Source PRD:** `prd/prd-lifeline-mvp.md`  
**Scope:** Full (FRs 1–18)  
**Date:** 2026-07-19  
**Generated with:** `/generate-tasks`  
**Processed with:** `/process-task-list` on 2026-07-19

## Process log

| When | Result |
|------|--------|
| 2026-07-19 | Verified implementation against codebase; `npm test` → 7/7 pass; `npm run build` → green |
| 2026-07-19 | Tasks 0.0–6.2 marked complete; 6.3–6.5 remain open (require live Lace Preprod + human inspection) |

## Relevant Files

- `contracts/lifeline.compact` — circuitos on-chain (`createCycle`, `registerNeed`, `castPrivateVote`, `closeCycle`), nullifier e cap 1–100.
- `contracts/src/witnesses.ts` — witnesses locais (`localMemberSecret`, `localNeedCommitment`, `localVotingWeight`).
- `lib/contract-model.ts` — espelho TypeScript das invariantes do contrato.
- `lib/contract-model.test.ts` — testes das invariantes Compact.
- `lib/voting.ts` — `cappedVotingWeight` e escolha do vencedor off-chain.
- `lib/voting.test.ts` — testes de cap e desempate.
- `lib/private-invite.ts` — convite AES-GCM só no fragmento da URL.
- `lib/private-invite.test.ts` — testes de encrypt/decrypt e isolamento do fragmento.
- `lib/lifeline-midnight-api.ts` — chamadas MidnightJS aos circuitos + stream do indexer.
- `lib/lifeline-browser-manager.ts` — deploy/join, commitments, secrets locais, orchestration browser.
- `lib/midnight-wallet.ts` — Lace Connector API 4.x.
- `lib/midnight-config.ts` — `VITE_LIFELINE_MODE`, network, contract address.
- `lib/proof.ts` — adapter demo local e recibos `demo_*`.
- `lib/store.ts` — persistência `lifeline-demo-v1` + reset.
- `lib/demo-data.ts` — seed do círculo demo.
- `lib/types.ts` — `CircleState`, `Need`, roles.
- `components/lifeline-app.tsx` — UI das jornadas (Overview, Needs, Voting, Results, Privacy).
- `package.json` — scripts `test`, `build`, `midnight:assets`, `midnight:compile`.
- `scripts/midnight-preflight.sh` — preflight do ambiente Preprod.
- `proof-server/docker-compose.yml` — proof server local para Lace.
- `docs/PREPROD_RUNBOOK.md` — checklist de aceitação Preprod.

### Notes

- Co-localize testes em `lib/*.test.ts` (Vitest).
- Rodar: `npm test`, `npm run build`, `npm run dev`.
- Compilar contrato: `npm run midnight:compile` (artefatos em `contracts/managed/lifeline`).
- Non-goals do PRD: fiat/PIX/token com valor, marketplace, KYC, multi-circle, custody production, storage server-side de payloads.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch (e.g. `git checkout -b feature/lifeline-mvp`)
    - Verified: MVP shipped on `main` (`bf29e65`); active work branch `docs/product-pm-workspace`

- [x] 1.0 Modelo local: roles, persistência, necessidades privadas e reset
  - [x] 1.1 Definir tipos `beneficiary` | `supporter`, `Need` e `CircleState` em `lib/types.ts` (FR1, FR3)
  - [x] 1.2 Implementar seed demo em `lib/demo-data.ts` (círculo + necessidades locais sem ir ao ledger)
  - [x] 1.3 Persistir estado em `localStorage` com chave `lifeline-demo-v1` em `lib/store.ts` (FR2)
  - [x] 1.4 Expor load/save + one-click reset que restaura o seed sem apagar secrets Midnight por engano (FR2, US9)
    - Verified: `resetState()` removes only `lifeline-demo-v1`; secrets stay in `lifeline-midnight-member-secret-v1` / contract key
  - [x] 1.5 Garantir que description, creditor, amount e due date existem só no estado local (FR3)
    - Verified: `Need` keeps `title`/`amount`/`dueDate` local; ledger only gets commitments
  - [x] 1.6 Implementar switch de role na UI e forçar `supporter` ao abrir convite válido (FR1, US4)

- [x] 2.0 Contrato Compact: circuitos, cap 1–100, nullifier e invariantes
  - [x] 2.1 Declarar ledger fields: `cycleId`, `cycleOpen`, `registeredNeeds`, `usedNullifiers`, `voteTotals`, `winningNeed`, etc. em `contracts/lifeline.compact`
  - [x] 2.2 Implementar `createCycle(newCycleId)` com assert de ciclo não aberto (FR6, Appx5)
  - [x] 2.3 Implementar `registerNeed(needCommitment)` só com ciclo aberto e commitment único (FR7, Appx1)
  - [x] 2.4 Implementar `memberNullifier(secret, cycleId)` e `castPrivateVote` com witnesses (FR10, Appx2–3)
  - [x] 2.5 Assertar peso `> 0` e `<= 100` no circuito (FR11, Appx4)
  - [x] 2.6 Rejeitar nullifier já consumido no ciclo (FR12, Appx3)
  - [x] 2.7 Implementar `closeCycle(winnerCommitment)` exigindo need registrado e fechando o ciclo (FR13, Appx5–6)
  - [x] 2.8 Espelhar invariantes em `lib/contract-model.ts` e cobrir com testes em `lib/contract-model.test.ts`
  - [x] 2.9 Compilar com `npm run midnight:compile` e versionar `contracts/managed/lifeline` (keys/ZKIR/bindings)
    - Verified: `contracts/managed/lifeline/{compiler,contract,keys,zkir}` present

- [x] 3.0 Integração Midnight/Lace: deploy/join, circuitos, indexer e assets ZK
  - [x] 3.1 Configurar env (`VITE_LIFELINE_MODE`, `VITE_MIDNIGHT_NETWORK`, `VITE_LIFELINE_CONTRACT_ADDRESS`) em `lib/midnight-config.ts`
  - [x] 3.2 Conectar Lace via Connector API 4.x em `lib/midnight-wallet.ts` (FR5)
  - [x] 3.3 Implementar deploy/join do contrato no browser manager (FR5)
  - [x] 3.4 Derivar salted `Bytes<32>` commitment por necessidade antes de `registerNeed` (FR4)
  - [x] 3.5 Orquestrar publish: `createCycle` + `registerNeed` para cada commitment, com tx id real (FR6, FR7, Goal1)
  - [x] 3.6 Implementar `castPrivateVote` com secret local, need commitment e peso capped (FR10–12)
  - [x] 3.7 Implementar `closeCycle` com commitment vencedor registrado (FR13)
  - [x] 3.8 Assinar `state$` do indexer e refletir agregados na UI em modo Midnight (FR14)
  - [x] 3.9 Copiar keys/ZKIR para `public/` via script `midnight:assets` no build (FR18)
  - [x] 3.10 Documentar proof server `http://localhost:6300` e preflight (`scripts/midnight-preflight.sh`)
    - Verified: `proof-server/docker-compose.yml` maps 6300; runbook + README document Lace proof URL

- [x] 4.0 Fallback demo rotulado (`demo_*`) sem parecer on-chain
  - [x] 4.1 Implementar adapter local em `lib/proof.ts` quando Lace/Preprod indisponível (FR15)
  - [x] 4.2 Gerar recibos com prefixo `demo_*` e nunca rotulá-los como tx Midnight (FR15, Goal5)
    - Verified: network string `"Recibo local · não enviado à Midnight"`
  - [x] 4.3 Mostrar network strip inequívoco: Preprod+Lace vs demo local (Design)
  - [x] 4.4 Cobrir helpers de votação off-chain em `lib/voting.test.ts` (cap + winner)

- [x] 5.0 UI das jornadas: Overview, Needs, Voting, Results, Privacy, convite
  - [x] 5.1 Criar views Overview, Needs, Voting, Results e Privacy responsivas em `components/lifeline-app.tsx` (FR16)
  - [x] 5.2 Modal “Nova necessidade” gravando só localmente (US1, FR3)
  - [x] 5.3 CTA “Publicar na Preprod” com aprovação Lace e feedback de tx id (US2)
  - [x] 5.4 Gerar e copiar convite criptografado fragment-only (`lib/private-invite.ts`) sem enviar payload ao host (FR8, US3)
  - [x] 5.5 Testar encrypt/decrypt do convite em `lib/private-invite.test.ts` (FR8)
  - [x] 5.6 Modal de créditos demo sem valor econômico; peso exibido capped (FR9, US5)
  - [x] 5.7 Ação “Priorizar” no Voting; bloquear segundo voto e surfacer erro de nullifier (US5–6, FR12)
  - [x] 5.8 Encerrar ciclo (beneficiário) e mostrar commitment vencedor + recibo em Results (US7)
  - [x] 5.9 Página Privacy com matriz privado / provado / público (US8)
  - [x] 5.10 Toggle de valores protegidos na UI (FR17)
  - [x] 5.11 Touch targets usáveis no mobile para voto e CTAs principais (Design)
    - Verified: responsive shell + primary CTAs; media queries in `app/globals.css`

- [x] 6.0 Qualidade: testes, build e aceitação Preprod zero-vazamento
  - [x] 6.1 Garantir ≥7 testes passando com `npm test` (contract-model, voting, private-invite)
    - Verified 2026-07-19: **7 passed**
  - [x] 6.2 Garantir `npm run build` verde (inclui `midnight:assets` + `tsc --noEmit`)
    - Verified 2026-07-19: build preprod succeeded
  - [ ] 6.3 Executar checklist de `docs/PREPROD_RUNBOOK.md`: create → 4 needs → voto A → rejeição → voto B → close
    - **Blocked:** requires Lace + tDUST + local proof server; human demo session
  - [ ] 6.4 Inspecionar ledger/indexer e confirmar 0 campos sensíveis (Goal4, Success Metrics)
    - **Blocked:** depends on 6.3 live session
  - [ ] 6.5 Validar script de demo do README (8 passos) sem rotular `demo_*` como Midnight
    - **Blocked:** depends on 6.3 live session (demo path without Lace is code-verified via 4.x)

## Remaining work

Complete **6.3 → 6.4 → 6.5** with a live Preprod session using `docs/PREPROD_RUNBOOK.md`, then check them off.
