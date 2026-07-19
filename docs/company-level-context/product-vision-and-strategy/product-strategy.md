# Estratégia de produto — Lifeline

**Versão:** 1.0  
**Janela:** 2026 H1 (hackathon → pós-MVP)  
**Última atualização:** 2026-07-19

## Thesis

A coordenação de suporte financeiro entre pessoas de confiança é um problema de **prova sem exposição**. Midnight (Compact + witnesses + nullifiers) é a primitiva certa: o grupo verifica regras de governança sem publicar necessidades, identidades ou pesos individuais.

## Diagnóstico do problema

| Sintoma | Causa | Efeito |
|---------|-------|--------|
| Campanhas públicas de crowdfunding | Ledger/social feed exige narrativa e valores | Vergonha, estigma, risco de credores/empregadores |
| Grupos privados (WhatsApp/planilha) | Sem prova de justiça | Suspeita de favoritismo, reuso de “voto”, falta de auditabilidade |
| DAO / on-chain voting genérico | Identidade e payload públicos | Incompatível com vulnerabilidade financeira |

## Reframe da oportunidade

Não competir com GoFundMe em alcance público. Competir em **dignidade + coordenação verificável** para círculos pequenos (família, amigos próximos, comunidade de confiança).

Whitespace: produtos DeFi raramente modelam “quem ajuda quem” sem doxxing; produtos sociais raramente oferecem prova matemática de fairness.

## Apostas intencionais (bets)

1. **Bet A — Commitments + votos privados (MVP hackathon):** necessidades ficam no device; ledger guarda commitments, agregados e nullifiers. *Trade-off:* UX de wallet/proof server vs simplicidade web2.
2. **Bet B — Créditos de governança sem valor econômico (agora):** modelar peso de voto sem rail de pagamento. *Trade-off:* demos mais honestas, menos narrativa de “tokenomics”.
3. **Bet C — Convite fragment-only criptografado:** apoiadores entram sem o servidor ver o payload. *Trade-off:* complexidade de deep link vs privacidade.

### Non-goals (estratégicos)

- Transferência fiat/PIX/boleto/token com valor no MVP
- Marketplace público de necessidades
- Identidade KYC on-chain
- Multi-ciclo avançado / reputação cross-circle

## Execução sistematizada

| Ritmo | Prática |
|-------|---------|
| Demo loop | Lace Preprod → publicar → convite → voto → rejeição nullifier → close |
| Qualidade | `npm test` (invariantes) + `npm run build` + runbook Preprod |
| Discovery pós-hackathon | Entrevistas com pessoas em recuperação e apoiadores de círculos reais |
| Kill-switch | Se Preprod/proof UX bloquear >50% dos juízes/usuários piloto → manter fallback rotulado e pivô para “proof-as-a-service” local-first |

## Momentum

- **Parar:** tratar créditos demo como se tivessem valor econômico; esconder o modo fallback.
- **Continuar:** invariantes Compact testáveis; honesty na narrativa de submissão.
- **Começar (pós-MVP):** interviews reais, rail de settlement opt-in off-chain, métricas de conclusão de ciclo.

## Evidência atual

- Contrato e invariantes: `contracts/lifeline.compact`, `lib/contract-model.test.ts`
- Demo live: ver `docs/HACKATHON_SUBMISSION.md`
- Runbook de aceitação: `docs/PREPROD_RUNBOOK.md`
- Assumptions abertas: `docs/initiatives/lifeline-private-recovery-circle/assumptions/`
