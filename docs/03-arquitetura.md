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
