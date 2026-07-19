# Estrutura de time — Lifeline

**Modelo atual:** squad enxuto de hackathon (product trio comprimido).

## Papéis

| Papel | Responsabilidade | Contato / nota |
|-------|------------------|----------------|
| Product | Visão, escopo MVP, narrativa DeFi/privacy, OKRs | Owner dos docs em `docs/` |
| Engineering | Compact contract, MidnightJS, Vite app, testes | `contracts/`, `lib/`, `components/` |
| Design / UX | Fluxos beneficiário–apoiador, privacidade na UI, mobile | Embutido no app atual (`components/lifeline-app.tsx`) |

## Product trio

Decisões de produto, design e engenharia acontecem juntas em torno de:

1. Fronteira privado vs público
2. Honestidade do modo demo vs Preprod
3. Invariantes do contrato como requisitos de produto

Pasta de notas: `docs/meeting-notes/product-trio/`.

## Stakeholders externos

| Stakeholder | Interesse |
|-------------|-----------|
| Juízes MLH Midnight (DeFi Track) | Demo Preprod, privacidade, uso real de Compact |
| Lace / Midnight ecosystem | Integração Connector API + proof server |
| Usuários futuros (beneficiário / apoiador) | Dignidade, clareza, baixa fricção |

## Escalação futura (pós-MVP)

- PM dedicado + eng Compact + eng frontend + design
- Counsel/privacy review antes de settlement real
- Community ops para círculos piloto
