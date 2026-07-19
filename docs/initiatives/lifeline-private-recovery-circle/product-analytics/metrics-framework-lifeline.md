# Metrics framework — Lifeline

**North star (proposto):** % de ciclos fechados com inspeção de ledger/indexer sem campos sensíveis  
**OMTM hackathon:** demos Preprod bem-sucedidas no script de aceitação

## Funnel (agregado, privacy-safe)

| Step | Event name (proposed) | Properties allowed |
|------|----------------------|--------------------|
| 1 | `app_open` | `mode` (demo\|midnight), `role` |
| 2 | `lace_connect_result` | `success` bool, `network` |
| 3 | `cycle_publish_result` | `success` bool, `mode` |
| 4 | `invite_copied` | `mode` |
| 5 | `vote_cast_result` | `success` bool, `rejected_nullifier` bool |
| 6 | `cycle_closed` | `success` bool |

## Guardrails

- No need titles, amounts, creditors, invite ciphertext, secrets, addresses beyond truncated non-PII if required for support.
- Default: analytics off until opt-in pós-MVP (task 5.6).

## Quality / reliability

| Metric | Source | Target |
|--------|--------|--------|
| Automated tests passing | CI / `npm test` | 100% |
| Preprod acceptance checklist | Runbook manual | All boxes |
| Demo vs on-chain mislabel incidents | Review | 0 |

## Discovery metrics (qual)

| Metric | Target |
|--------|--------|
| Interview snapshots | ≥5 |
| LoFA tests run | 3 |
| A1 forced-choice private circle | ≥6/8 |

## ICE / assumption linkage

Use estes números para mover assumptions no mapa (Evidence axis) via `/analyze-metrics` quando houver dados.
