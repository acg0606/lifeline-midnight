# 1-Pager — Lifeline Private Recovery Circle

**Date:** 2026-07-19  
**Owner:** Product  
**Status:** Approved for MVP hackathon; pending discovery gates for scale

## Outcome

Hoje, pedir ajuda financeira em público exige expor dívidas, credores e relações. Em grupos privados, a coordenação existe mas sem prova de fairness. Lifeline busca que um círculo de confiança feche um ciclo de priorização com regras verificáveis e zero dados sensíveis no ledger, medido por ciclos Preprod com tx reais, rejeição de voto duplicado e inspeção limpa do indexer.

- Problema atual: exposição forçada ou coordenação opaca
- Meta: ciclo completo com KR1.1–KR1.3 verdes
- Impacto: dignidade para o beneficiário + confiança processual para apoiadores

## Opportunity

A oportunidade não é “tokenizar doações”. É deixar pessoas vulneráveis coordenarem prioridade sem escolher entre vergonha pública e planilha sem auditoria. O whitespace está entre crowdfunding (alcance, exposição) e chats privados (privacidade social, zero prova). Midnight torna a prova de governança uma feature de produto, não um add-on.

- Target opportunity: O1.2 (detalhes fora do ledger, prioridade verificável)
- Timing: hackathon Midnight DeFi + necessidade real de recovery circles
- Diferenciação: commitments + nullifiers + cap democrático

## Lessons

Builds anteriores de crowdfunding on-chain falham quando o payload é a dor da pessoa. Ferramentas cripto falham quando a fricção de wallet aparece no pior momento emocional. O MVP ensinou que honesty do fallback e invariantes testáveis importam mais que narrativa de tokenomics.

- Exposição do payload mata o job do usuário
- Demo sem Lace precisa ser rotulada, nunca disfarçada
- Feasibility ZK está mais madura que desirability humana documentada

## Solutions & Assumptions

A solução selecionada (S1) publica só commitments e agregados; votos usam witness local e nullifier por ciclo; créditos modelam peso sem valor econômico. Riscos:

| Axis | Risk | Test |
|------|------|------|
| Value | Usuários preferem campanha pública | Test card A1 |
| Viability | Juízes exigem rail de pagamento | Narrativa DeFi + non-goals explícitos |
| Feasibility | Preprod/proof server instável | Runbook + fallback |
| Usability | Lace demais para apoiador | Test card A2 |

LoFA abertas: A1 desirability círculo, A2 usabilidade Lace, A3 aceitação de commitments opacos.

- Solução: Private ZK voting circle (shipped)
- Non-goal: PIX/fiat/token com valor no MVP
- Assunção crítica: privacidade > alcance público para este job

## Decision Requests

1. **Confirmar** S1 como caminho oficial pós-hackathon (vs hybrid hash-only).
2. **Aprovar** non-goal de settlement econômico até LoFA A1–A3 passarem.
3. **Alocar** tempo de discovery (5–8 entrevistas) antes de novas features de contrato.
4. **Escolher** messaging: “prova de suporte justo” vs “DeFi recovery” — recomendação: liderar com dignidade/privacidade, Midnight como mecanismo.
