# Companion doc — Lifeline prototype

**Input:** Necessidades locais + convite + votos  
**Output:** Ciclo fechado com commitment vencedor e prova de regras  
**Audience:** Juízes hackathon, product trio, apoiadores piloto

## 10-question FAQ

### 1. O que este protótipo prova?

Que um círculo pode priorizar uma necessidade com regras verificáveis na Midnight sem publicar detalhes financeiros.

### 2. Isso move dinheiro de verdade?

Não. Créditos são só peso de governança de demo. Não há PIX, fiat nem token com valor.

### 3. Onde rodar?

`npm run dev` → `http://localhost:3000`. Para Preprod: Lace + proof server (`docs/PREPROD_RUNBOOK.md`).

### 4. Qual o caminho feliz do beneficiário?

Overview → adicionar necessidades → Publicar na Preprod → copiar convite → acompanhar votos → encerrar ciclo → Resultados / Privacidade.

### 5. Qual o caminho feliz do apoiador?

Abrir link `#lifeline=…` → conectar Lace → (opcional) contribuir créditos → Votação → Priorizar uma vez → tentar de novo e ver rejeição.

### 6. O que fica público no ledger?

Commitments opacos, status do ciclo, totais agregados, nullifiers do ciclo, commitment vencedor.

### 7. O que nunca deve ir para o ledger?

Descrição, credor, valor, vencimento, identidade do apoiador, segredo local, documentos de pagamento.

### 8. E se não houver Lace?

O app usa adapter local rotulado. Recibos `demo_*` não são transações Midnight.

### 9. Como resetar a demo?

Use o reset da UI (estado `lifeline-demo-v1` no `localStorage`).

### 10. O que ainda é hipótese?

Preferência real por círculo vs crowdfunding (A1), usabilidade Lace sem moderação (A2), aceitação de commitments opacos (A3). Ver `assumptions/`.

## Known prototype limits

- Persona e círculo demo fixos
- “Registrar execução” no resultado é simulado (toast)
- Contador de apoiadores na UI não é onboarding real
- Vercel não compila Compact; artefatos precisam estar no bundle
