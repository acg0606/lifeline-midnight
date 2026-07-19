# Design Brief — Lifeline

**Version:** 1.0  
**Date:** 2026-07-19  
**Locale:** pt-BR  
**Companion JSON:** [design-brief-lifeline.json](./design-brief-lifeline.json)

## Purpose & Audience

**Purpose:** Interface para coordenar um círculo privado de recuperação financeira com clareza sobre o que é privado, o que é provado e o que é público.

**Primary audience:** Beneficiário sob estresse financeiro temporário.  
**Secondary:** Apoiadores convidados (amigos/família tech-comfortable).

## Tone & Brand Voice

Calmo, direto, digno. Sem hype de cripto. Sem julgamento moral.

| Do | Don't |
|----|-------|
| “Seus valores ficam no seu aparelho” | “Revolutionize DeFi” |
| “Modo demo local — sem transação Midnight” | Esconder fallback |
| Explicar commitments em linguagem humana | Jargão ZK sem tradução |

## Design Variables (Tokens)

Fonte atual do app: Manrope (`--font-sans`), Georgia (`--font-serif`) em `src/vite.css`.

| Token | Proposed / current |
|-------|-------------------|
| `color.bg.atmosphere` | Gradiente suave claro-azulado (evitar purple-on-white genérico) |
| `color.text.primary` | Near-ink alto contraste |
| `color.accent.action` | Verde-petróleo / teal sóbrio para CTAs |
| `color.warning.demo` | Âmbar para strip de modo demo |
| `color.success.preprod` | Verde para Lace conectado |
| `type.display` | Manrope semibold |
| `space.section` | 24–40px |
| `radius.control` | 8–12px em controles interativos apenas |
| `motion.enter` | Fade/slide curto em troca de view e toasts |

## Component Library Mapping

| Component | Library ref | Notes |
|-----------|-------------|-------|
| NetworkStatusStrip | `Status/NetworkStrip` | Preprod vs demo |
| RoleSwitch | `Nav/RoleSwitch` | Beneficiário ↔ Apoiador |
| NeedFormModal | `Modal/NeedCreate` | Dados locais |
| ContributeModal | `Modal/ContributeCredits` | Sem valor econômico |
| VoteList | `List/NeedVote` | Ação Priorizar |
| PrivacyExplainer | `Page/PrivacyMatrix` | Privado / provado / público |
| InviteCopy | `Action/CopyInvite` | Fragment URL |

Cards: usar só onde há interação (need item, modal). Evitar dashboard de cards no hero.

## Patterns & Flows

1. **Publish:** Overview → Publicar na Preprod → Lace approve → convite  
2. **Support:** Open invite → Votação → Priorizar → nullifier on retry  
3. **Close:** Beneficiário → Encerrar ciclo → Resultados  
4. **Educate:** Privacy view sempre acessível

## Accessibility & Internationalization

- WCAG 2.2 AA contrast
- Touch targets ≥ 44px
- Keyboard focus visible on modals and vote actions
- Copy pt-BR first; structure for en later
- Don't rely on color alone for demo vs Preprod (use text labels)

## Success Metrics & Experiment Plan

- Task success no script de demo (8 passos) sem ajuda além do README
- A2 usability: ≥3/5 apoiadores completam voto
- Zero confusão demo vs on-chain em testes moderados

## Asset Guidelines

- Hero visual: atmosfera de recomeço / suporte humano (não charts DeFi)
- Evitar collages e badges flutuantes sobre mídia
- Ícones: lucide-react já no projeto
