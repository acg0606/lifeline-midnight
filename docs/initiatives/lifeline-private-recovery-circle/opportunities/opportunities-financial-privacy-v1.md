# Opportunities — Financial privacy in recovery circles

**Topic:** financial-privacy  
**Version:** v1  
**Source documents:**  
- `user-interviews/synthesis/synthesis-hardship-privacy-v1.md`  
- `user-interviews/snapshots/snapshot-proxy-*.md`  
- `docs/HACKATHON_SUBMISSION.md`  
**Context sources:** `company-level-context/product-vision-and-strategy/`, `okrs/okrs-2026-hackathon.md`  
**Total opportunities:** 8

## Opportunity Solution Tree (Snapshot)

```
Outcome: Beneficiário prioriza obrigação urgente com círculo de confiança,
         sem publicar detalhes financeiros
│
├─ O1 Evitar exposição ao pedir ajuda
│  ├─ O1.1 Compartilhar necessidades só com convidados
│  └─ O1.2 Manter valores/credores fora do ledger  ← Target
│
├─ O2 Coordenar decisão coletiva com fairness
│  ├─ O2.1 Impedir voto duplicado sem revelar identidade
│  └─ O2.2 Teto democrático de influência
│
└─ O3 Reduzir carga operacional do apoiador
   ├─ O3.1 Entrar por convite curto
   └─ O3.2 Opinar sem virar gestor de dívida
```

## Candidate Opportunities (Pre-Review)

| ID | Parent | Statement | Evidence Count | Quotes / signals | Notes |
|----|--------|-----------|----------------|------------------|-------|
| O1 | Outcome | Quero pedir ajuda sem transformar minha crise em vitrine pública | 2 proxies + submission | “sem virar vitrine” | Parent |
| O1.1 | O1 | Quero compartilhar necessidades só com quem eu convidar | 2 | convite privado no MVP | |
| O1.2 | O1 | Quero que valores e credores nunca apareçam no ledger | 2 + contract model | privacy table submission | **Target** |
| O2 | Outcome | Quero uma decisão coletiva que o grupo aceite como justa | 2 | fairness theme T2 | Parent |
| O2.1 | O2 | Quero que ninguém vote duas vezes sem expor quem é | 1 + invariant tests | nullifier | Selected sibling |
| O2.2 | O2 | Quero limitar o peso de quem contribui mais | 1 + cap 100 | democratic cap | |
| O3 | Outcome | Quero ajudar sem administrar a vida financeira do outro | 1 | supporter proxy | Parent |
| O3.1 | O3 | Quero entrar no círculo por um link e agir rápido | 1 | invite flow | |
| O3.2 | O3 | Quero priorizar uma necessidade sem negociar com credores | 1 | voting UI | |

## Review Notes #1

Hipótese de hackathon: mesclar O1.1 e O1.2 como “privacidade de necessidade”; manter O1.2 como leaf target porque é o diferencial Midnight.

## Assessment (Sibling Comparisons)

### Sibling set O1.x

| Candidates | Sizing | Market | Company | Customer | Winner |
|------------|--------|--------|---------|----------|--------|
| O1.1 vs O1.2 | Ambos amplos | O1.2 diferencia vs apps web2 | Alinha DeFi Midnight | Ambos críticos | **O1.2** |

### Sibling set O2.x

| Candidates | Factors | Winner |
|------------|---------|--------|
| O2.1 vs O2.2 | Ambos table-stakes de governança justa; O2.1 é o “aha” da demo | O2.1 como secondary focus |

## Proposed Target Opportunity

**O1.2 —** “Quero que valores e credores nunca apareçam no ledger, mas ainda assim o grupo consiga priorizar com regras verificáveis.”

**Rationale:** Maximiza alinhamento com Compact/ZK, com a visão e com o track DeFi. O2.1/O2.2 são requisitos de solução anexos.

**Next steps:** `/generate-solutions` → `/identify-test-assumptions` → validar LoFA com entrevistas reais.
