# Assumptions — Private coordination without ledger exposure

**Topic:** private-coordination  
**Version:** v1  
**Target Opportunity:** O1.2 — valores/credores fora do ledger com priorização verificável

## Story Map Snapshot

- **Actors:** Beneficiário, Apoiador, Ledger Midnight, Lace/Proof server  
- **Key Steps:**
  1. Beneficiário — cria necessidades locais e abre ciclo  
  2. Beneficiário — compartilha convite criptografado  
  3. Apoiador — abre link, conecta Lace, obtém créditos demo  
  4. Apoiador — vota uma necessidade (witness + nullifier)  
  5. Sistema — rejeita segundo voto  
  6. Beneficiário — encerra ciclo e vê commitment vencedor  
  7. Qualquer auditor — inspeciona ledger sem ver dados sensíveis

## Assumption Log

| ID | Category | Assumption | Evidence | Importance | Evidence Known | LoFA |
|----|----------|------------|----------|------------|----------------|------|
| A1 | Desirability | Beneficiários preferem círculo privado a campanha pública para priorizar contas | Proxies + framing | High | Weak | **Yes** |
| A2 | Usability | Apoiadores completam Lace + proof server + 1 voto em uma sessão | Runbook interno | High | Weak–Med | **Yes** |
| A3 | Desirability | Beneficiários aceitam commitments opacos (apoiadores votam sem ver valores) | Hipótese | High | Weak | **Yes** |
| A4 | Feasibility | Circuitos Compact + MidnightJS 4.x suportam o fluxo na Preprod | Código + demos | High | Strong | No |
| A5 | Feasibility | Nullifier cycle-scoped impede reuso de credencial | Testes + contrato | High | Strong | No |
| A6 | Viability | Créditos sem valor econômico bastam para demo/governança no hackathon | Submission policy | Med | Strong | No |
| A7 | Viability | Juízes DeFi valorizam prova ZK mais que rail de pagamento | Track brief | Med | Med | No |
| A8 | Usability | Convite no fragmento da URL não vaza para o host | `private-invite` tests | High | Strong | No |
| A9 | Ethical | Usuários entendem que o modo demo não move valor real | UI labels | High | Med | No |
| A10 | Ethical | Produto não incentiva exposição forçada de vulnerabilidade | Design non-goals | High | Med | No |

## Assumption Map Summary

- **LoFA (max 3):** A1, A2, A3  
- **Clusters:** Feasibility forte; desirability/usability humanas fracas

## Test Cards (per LoFA)

### A1 — Preferência por círculo privado

- **Simulation:** Comparar duas opções de pedido de ajuda (público vs círculo)  
- **Method:** Entrevista + escolha forçada  
- **Audience:** Pessoas que pediram ou consideraram ajuda financeira nos últimos 12 meses  
- **Sample & Window:** 8 participantes / 2 semanas  
- **Success Criteria:** ≥6 de 8 escolhem círculo privado para priorização de contas  
- **If pass:** manter messaging privacy-first  
- **If fail:** reframe para “fairness em grupos que já são privados”

### A2 — Completar fluxo Lace

- **Simulation:** Session guiada com Preprod  
- **Method:** Moderated usability (tarefas)  
- **Audience:** Apoiadores tech-comfortable  
- **Sample & Window:** 5 sessões / 1 semana  
- **Success Criteria:** ≥3 de 5 completam voto sem intervenção do moderador além do runbook escrito  
- **If pass:** reduzir copy de onboarding  
- **If fail:** investir em checklist in-app + vídeo; manter fallback rotulado

### A3 — Aceitar commitments opacos

- **Simulation:** Beneficiário registra 4 necessidades; apoiadores veem só títulos/categorias mínimas ou só commitments  
- **Method:** Prototype test no app atual (valores ocultáveis)  
- **Audience:** Pares beneficiário–apoiador  
- **Sample & Window:** 5 pares / 2 semanas  
- **Success Criteria:** ≥4 de 5 beneficiários autorizam o ciclo sem revelar valores aos apoiadores  
- **If pass:** default “valores protegidos” = on  
- **If fail:** permitir revelação seletiva off-chain sem gravar no ledger

## Results and Decisions

- A4, A5, A6, A8: validados pelo MVP técnico.  
- A1–A3: abertos — bloqueiam escala, não bloqueiam submissão hackathon.

## Next Steps

- [ ] Recrutar para A1–A3 (KR3.2 / KR3.3)
- [ ] Atualizar para v2 com resultados
- [ ] Compartilhar LoFA no product trio
