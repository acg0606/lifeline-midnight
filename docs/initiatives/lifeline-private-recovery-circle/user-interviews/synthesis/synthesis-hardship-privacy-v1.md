# Synthesis — Hardship & financial privacy

**Version:** v1  
**Date:** 2026-07-19  
**Sources:** problem framing do hackathon, padrões de crowdfunding público vs ajuda privada, comportamento observado no MVP demo  
**Confidence:** Low–Medium (hypothesis-driven; substituir após 5+ snapshots reais)

## Themes

### T1 — Exposição é o custo escondido do pedido de ajuda

Pedir suporte em público exige narrativa, valores e credores. O custo social (vergonha, empregadores, família ampliada) compete com o benefício financeiro.

**Implication:** Produto deve minimizar o que sai do device do beneficiário.

### T2 — Círculos pequenos já coordenam off-line; falta fairness verificável

WhatsApp + planilha resolvem privacidade social, mas geram suspeita: “quem votou o quê?”, “alguém votou duas vezes?”, “por que aquela conta ganhou?”.

**Implication:** Valor de Midnight está na prova de processo, não em substituir a confiança social.

### T3 — Apoiadores querem ajudar sem se tornar “gestores de dívida”

Apoiadores hesitam quando precisam ver boletos e negociar credores. Preferem sinalizar prioridade e contribuir peso/recursos sem administrar a vida financeira do outro.

**Implication:** UI de apoiador deve ser curta: convite → (opcional) créditos → um voto.

### T4 — Ferramentas cripto falham no momento de vulnerabilidade

Proof servers, wallets e faucets aumentam fricção exatamente quando o usuário está sob estresse.

**Implication:** Fallback honesto + onboarding Lace documentado; nunca fingir que a fricção sumiu.

## Opportunity seeds (para OST)

1. Priorizar obrigação urgente sem publicar detalhes
2. Impedir reuso de credencial de voto sem revelar identidade
3. Convidar só pessoas de confiança sem vazar o grafo social
4. Entender o resultado sem auditar planilhas manuais

## Gaps de evidência

- Frequência real de ciclos de priorização vs doação única
- Tolerância a commitments opacos (“confio sem ver o valor?”)
- Disposição de apoiadores a instalar Lace / usar Preprod
