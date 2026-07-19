# ICE Score — Private ZK voting circle

**Idea:** Private ZK voting circle on Midnight (Solution 1)  
**Version:** v1  
**Date:** 2026-07-19  
**Target metric:** Taxa de ciclos concluídos sem vazamento de dados sensíveis no ledger  
**Expected change:** De ~0% (status quo crowdfunding público) para ≥80% dos ciclos piloto com KR1.3 verde  
**Effort estimate:** ~3–4 person-weeks já investidos no MVP; +2 weeks polish pós-hackathon

## Scoring

### Impact

Mudança esperada na métrica-alvo: de exposição quase certa em crowdfunding público para exposição zero no ledger em ciclos Lifeline → mapeado como **>50%** redução de exposição no contexto do job → **Impact = 10**  
*Nota:* impacto é sobre o job de privacidade do círculo, não sobre GMV.

### Ease

MVP já shipped; polish estimado 1–2 semanas → **Ease = 9**

### Confidence (evidence-weighted)

| Evidence | Type | Weight applied |
|----------|------|----------------|
| Contrato Compact + invariantes testadas | Empirical | 0.50 |
| Runbook Preprod de aceitação | Empirical | 0.50 (cap group) → use 0.50 total empirical bucket |
| Narrativa de problema / proxies | Opinions / directional | 0.10 + 0.05 |
| Planos de discovery | Estimates | 0.30 |

**Confidence (raw sum capped by groups) ≈ 0.95 → score scale 1–10 ≈ 9**  
(ajustado para **8** por falta de entrevistas primárias)

### ICE

**ICE = 10 × 8 × 9 = 720**

## Priority interpretation

Score alto justifica continuar investimento no caminho S1. O gargalo não é impacto/ease do protocolo; é **confidence de desirability/usability com humanos**. Próximo euro/hora deve ir para testes de LoFA, não para features econômicas.

## Next steps

1. Rodar test cards A1–A3 em `assumptions/`.
2. Re-score como v2 após 5 entrevistas.
3. Se Confidence cair abaixo de 5, pausar scope de settlement e aprofundar discovery.
