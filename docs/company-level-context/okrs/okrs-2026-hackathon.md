# OKRs — Lifeline (ciclo hackathon / Preprod)

**Período:** 2026 Q2–Q3 (hackathon MLH Midnight + estabilização Preprod)  
**Owner:** Product + Engineering  
**Alinhamento:** [product-strategy.md](../product-vision-and-strategy/product-strategy.md)

## Objective 1 — Provar coordenação privada verificável na Midnight

Pessoas em um círculo de confiança conseguem priorizar uma necessidade urgente sem publicar detalhes financeiros no ledger.

| KR | Meta | Baseline | Status |
|----|------|----------|--------|
| KR1.1 Circuitos reais (`createCycle`, `registerNeed`, `castPrivateVote`, `closeCycle`) executam na Preprod com Lace | 4/4 circuitos com tx ID real | 0 | Met (MVP) |
| KR1.2 Nullifier rejeita segundo voto no mesmo ciclo | 100% nas demos de aceitação | n/a | Met |
| KR1.3 Inspeção de ledger/indexer sem descrição, credor, valor, identidade ou segredo local | 0 vazamentos no runbook | n/a | Met (critério de aceitação) |

## Objective 2 — Demo julgável e honesta

Juízes e revisores entendem o valor de privacidade e nunca confundem fallback local com tx Midnight.

| KR | Meta | Status |
|----|------|--------|
| KR2.1 Script de demo ≤ 8 passos documentado no README | Sim | Met |
| KR2.2 Fallback sempre rotulado; recibos `demo_*` nunca apresentados como on-chain | 0 incidentes na narrativa | Met (política) |
| KR2.3 `npm test` + `npm run build` verdes | 7 testes + build | Met |

## Objective 3 — Preparar discovery pós-hackathon

Transformar hipótese de produto em evidência de usuário.

| KR | Meta | Status |
|----|------|--------|
| KR3.1 Artefatos PM (visão, 1-pager, PRD, OST, assumptions) versionados em `docs/` | Completo | Em progresso → completo neste workspace |
| KR3.2 5 entrevistas com beneficiários ou apoiadores reais | 5 snapshots | Aberto |
| KR3.3 3 LoFA testadas com critérios absolutos | 3 test cards | Aberto (cards desenhados) |

## Guardrails

- Não contar créditos demo como GMV.
- Não otimizar OKR de “usuários ativos” antes de validar LoFA de desirability.
- Kill criteria: se KR1.2 ou KR1.3 falharem em ambiente de demo, priorizar correção sobre novas features.
