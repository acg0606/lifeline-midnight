# Strategy Review (PRISM) — Lifeline

**Product:** Lifeline  
**Owner:** Product  
**Review window:** 2026-06-01 → 2026-07-19  
**Evidence hub:** `docs/initiatives/lifeline-private-recovery-circle/`  
**Decision:** Conditional Approve

## Executive Summary

A estratégia acerta o reframe (prova sem exposição) e as apostas do MVP estão implementadas na Preprod. A fraqueza é evidência de usuário: assumptions de desirability ainda são LoFA. Aprovar o caminho técnico do hackathon; condicionar escala pós-MVP a entrevistas e testes das LoFA.

## Evidence readiness gate

| Item | Presente? | Cite |
|------|-----------|------|
| Sinais recentes (demo, testes, runbook) | Sim | [[ev-01\|docs/PREPROD_RUNBOOK.md\|1-75\|2026-07-19]] |
| 2+ riskiest assumptions | Sim | [[ev-02\|docs/initiatives/.../assumptions/...\|LoFA\|2026-07-19]] |
| Success criterion | Sim | KR1.3 zero vazamentos; demo 8 passos |
| Discovery plan / OKR | Sim | [[ev-03\|docs/company-level-context/okrs/okrs-2026-hackathon.md\|1-50\|2026-07-19]] |
| Evidence hub versionado | Sim | `docs/initiatives/lifeline-private-recovery-circle/` |

**Gate:** PROCEED (≥4 core, inclui #2 e #3).

## Impact × Confidence

| Bet | Impact | Confidence | Nota |
|-----|--------|------------|------|
| A Commitments + votos ZK | Alto | Alta (código + Preprod) | Core do produto |
| B Créditos sem valor econômico | Médio | Alta | Honesty boa; limita storytelling DeFi |
| C Convite fragment-only | Médio | Média-Alta | Testes unitários; UX de deep link a validar com usuários |

## PRISM Scores

| Dimensão | Score | Rationale |
|----------|-------|-----------|
| P — Problem Diagnosis | 3.5 | Causalidade clara; falta comportamento observado de usuários reais |
| R — Reframe Opportunity | 4.0 | Whitespace bem definido vs crowdfunding e DAO público |
| I — Intentional Bets | 4.0 | Trade-offs e non-goals explícitos; MVP entregue |
| S — Systemized Execution | 3.0 | OKRs e runbook existem; ritmo de discovery ainda fraco |
| M — Momentum | 3.0 | “Parar/continuar/começar” escrito; sem retros trimestrais ainda |
| **Overall** | **3.5** | |

## Pre-mortem / Kill-switch

Top falhas:

1. UX Lace/proof server impede demos e adoção → kill: se <3 demos Preprod bem-sucedidas em 2 semanas de juízes/piloto, congelar features e investir em onboarding.
2. Usuários não confiam em “commitment opaco” → pivot messaging + pesquisa.
3. Pressão por tokenomics quebra honesty → kill qualquer rail econômico até LoFA de desirability passar.
4. Vazamento acidental via analytics/URL → zero telemetria de payloads sensíveis.
5. Escopo creep para pagamentos → bloquear até KR3.x.

## Bias guardrails

- **Confirmation:** MVP técnico não prova desire do beneficiário.
- **Availability:** hackathon Midnight enviesa para ZK even when a planilha privada bastaria para alguns círculos.
- **Overconfidence:** 7 testes cobrem invariantes, não usabilidade.

## Next review date

2026-08-15 — após primeiras entrevistas (KR3.2) ou falha de demo Preprod.
