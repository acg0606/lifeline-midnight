# Solutions for O1.2 — Needs stay private, priority is verifiable

**Topic:** private-recovery-circle  
**Version:** v1  
**Target Opportunity:** O1.2 — valores/credores fora do ledger com priorização verificável  
**Source Documents:** `opportunities-financial-privacy-v1.md`, síntese v1  
**Total Ideas:** 12 (retrospectiva do MVP + alternativas)  
**Final Selected:** 3

## Problem Definition

- **Target Opportunity Statement:** Coordenar prioridade de obrigações sem publicar detalhes financeiros.
- **Who:** Beneficiário + apoiadores de confiança (3–12 pessoas).
- **When:** Aperto temporário com várias contas urgentes.
- **Current Solutions:** Crowdfunding público; WhatsApp/planilha; DAO voting público.
- **Success Criteria:** Ciclo fecha com winner commitment registrado; zero campos sensíveis no ledger; segundo voto rejeitado.

## Ideation Process

- Sessão individual (hackathon build): commitments + votos privados + nullifier.
- Alternativas exploradas: multisig custodial, servidor trusted, NFT gating, votação off-chain assinado.
- Total: 12 ideias filtradas para 3.

## Idea Evaluation

| Idea | Addresses Opportunity | Feasibility | Uniqueness | Evidence-Based |
|------|----------------------|-------------|------------|----------------|
| S1 Private ZK voting circle (Midnight) | Yes | High (shipped) | High | Contract + tests |
| S2 Encrypted shared notebook + human facilitator | Partial | High | Low | Common practice |
| S3 Public crowdfunding with blur/redaction | Weak | High | Low | Incumbents |
| S4 Custodial server tally | Partial | Medium | Low | Trust regress |
| S5 Off-chain signed ballots + public hash | Partial | Medium | Medium | Weaker anti-reuse |

## Selected Solutions (×3)

### Solution 1: Private ZK voting circle on Midnight (SELECTED / SHIPPED)

**Type:** Feature + protocol  
**Approach:** Necessidades locais → salted commitments on-chain → convite criptografado → `castPrivateVote` com witness + nullifier → `closeCycle`.  
**Key Features:** cap 100, cycle-scoped nullifier, indexer aggregates, Lace Preprod, fallback demo rotulado.  
**UX:** Beneficiário publica ciclo; apoiador abre link e vota uma vez.  
**Why Selected:** Única opção que entrega O1.2 + O2.1 sem custodiante.  
**Implementation:** Feasibility alta (código existe). Risks: fricção wallet/proof.

### Solution 2: Trusted facilitator notebook (BACKUP)

**Type:** Process  
**Approach:** Facilitador humano mantém planilha criptografada e declara resultado.  
**Why Selected as backup:** Serve círculos sem Lace; sem prova matemática.  
**Risks:** Confiança concentrada; não usa Midnight.

### Solution 3: Hybrid — decide off-chain, anchor result hash (EXPERIMENT)

**Type:** Process + light chain  
**Approach:** Votação em app web2; só hash do resultado no ledger.  
**Why Selected for experiment:** Menos fricção; prova fraca de fairness.  
**Risks:** Não previne voto duplicado on-chain.

## Next Steps

1. Manter S1 como caminho do produto.
2. Testar LoFA de usability (Lace) e desirability (círculo vs crowdfunding).
3. Não investir em S3 até S1 falhar testes de usabilidade com usuários reais.
