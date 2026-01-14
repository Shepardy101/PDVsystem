# 03 - Arquitetura

## Visão macro
- SPA React servida pelo Express na mesma porta (8787).
- Express aplica middlewares: CORS, JSON e `ipAccessControl` (whitelist de IPs) antes das rotas.
- Rotas segmentadas por domínio em `server/src/routes/` chamam repositórios em `server/src/repositories/` que operam o SQLite via better-sqlite3.
- SPA fallback: qualquer rota não-API e não-/uploads retorna `dist/index.html` (ver `server/src/index.ts`).

## Fluxo de dados
1. UI (pages/components) → `fetch` para `/api/*` (services em `services/*.ts` e chamadas diretas nas pages).
2. Middleware `ipAccessControl` filtra IPs; exceções: `/api/health`, `/api/admin-db`, `/api/admin/ip-control`, `/uploads`.
3. Handlers Express em `server/src/routes/*.ts` → repositórios específicos (POS, cash, reports, adminDb, etc.).
4. Repositórios executam SQL no SQLite (`data/novabev.sqlite`) e retornam JSON.

## UX keyboard-first / hotkeys
- Modais e formulários priorizam atalhos: `Esc` fecha/cancela, `Enter` avança ou submete quando válido.
- Campos de entrada recebem foco inicial (`autoFocus`/refs) e `Enter` move o foco para o próximo passo quando aplicável.
- `Tab`/`Shift+Tab` seguem a ordem natural; listeners de teclado são limpos no fechamento para evitar vazamentos.
- Ações principais exibem rótulos visíveis de atalho quando relevante (ex.: `[ENTER]`, `[I]`).

### Mapa rápido de atalhos (modais principais)
| Modal | Atalhos | Fluxo resumido |
| --- | --- | --- |
| POS → Pagamento (PaymentModal) | `1` cartão, `2` pix, `3` dinheiro, `Enter` confirma seleção, `/` entra multipagamento, `Esc` sai do multipagamento ou fecha modal, mini dinheiro: `Enter` confirma, `Esc` fecha | Modo simples: escolha pelo número e confirme com `Enter`; `/` ativa multipagamento (ciclo `Enter`: valor → método → adicionar → finalizar); `Esc` cancela multipagamento ou fecha o modal; mini-modal de dinheiro usa `Enter`/`Esc`. |
| POS → Recibo | `Enter`, `I`, `Esc` | `Enter` finaliza/fecha; `I` imprime; `Esc` fecha. |
| POS → Cliente (ClientModal) | `ArrowUp/ArrowDown`, `Enter`, `Esc` | Setas navegam; `Enter` seleciona e fecha; `Esc` fecha. |
| Caixa → Suprimento | `Enter` sequencial, `Esc` | `Enter` avança montante → categoria → descrição → confirma; `Esc` fecha. |
| Caixa → Pagamento (despesa) | `Enter` sequencial, `Esc` | `Enter` valor → categoria → descrição → confirma; `Esc` fecha. |
| Caixa → Sangria | `Enter` sequencial, `Esc` | `Enter` valor → motivo → confirma; `Esc` fecha. |
| Caixa → Fechamento (ClosingModal) | `Enter`, `Esc` | Sem resultado: `Enter` confirma fechamento; após resultado: `Enter` fecha; `Esc` fecha. |
| Caixa → Abertura (OpeningModal) | `Enter`, `Esc` | `Enter` confirma; `Esc` fecha. |
| Caixa → Desconto | `Enter`, `Esc` | `Enter` aplica; `Esc` fecha. |
| Caixa → Subtotal | `Enter`, `Esc` | `Enter` confirma; `Esc` fecha. |
| Permissão negada | `Enter`, `Esc` | Ambos fecham. |
| Métricas | `Esc` | Fecha. |
| Admin password | `Enter` (form padrão) | Apenas foco inicial; usa submit padrão do form. |

## Segurança e boundaries
- IP whitelist obrigatória (ver `server/src/middleware/ipAccessControl.ts`).
- Admin DB Manager guardado por `guardAdminDb` (em `server/src/services/adminDb.service.ts`): requer `ENABLE_DB_ADMIN=true` e IP localhost.
- Uploads servidos em `/uploads`; frontend build em `/dist`.

## Localização de componentes
- Entrypoint backend: `server/src/index.ts`.
- DB: `server/src/db/database.ts`, `server/src/db/migrate.ts`, SQL em `server/src/db/migrations/`.
- Rotas: `server/src/routes/` (pos, cash, cash.history, product, category, user/clients, supplier, report, reports, admin-db, admin/ip-control, settings, health, sys).
- Repositórios: `server/src/repositories/` (pos.repo, cash.repo, adminDb.repo, reports.repo, etc.).
- Frontend pages: `pages/*.tsx` (POS, CashManagement, Entities, Reports, Settings, Products, Login).
- Frontend components: `components/` e `src/renderer/components/` (DB Manager UI).
