# 99 - Lacunas e Perguntas

1. Esquemas completos das migrations 0011–0020 (allowed_ips, pending_ips, add_user_id_to_cash_sessions, imageUrl/type/min_stock, normalize/nullable fields) e de todas as tabelas após essas alterações. Onde encontrar: `server/src/db/migrations/*.sql` e/ou `server/migrations/`.
2. Rotas detalhadas não exibidas: `product.routes.ts`, `category.routes.ts`, `user.routes.ts` (inclui clients), `supplier.routes.ts`, `admin/ipControl.routes.ts`, `health.routes.ts`, `sys` rotas. Onde encontrar: `server/src/routes/*.ts`.
3. Regras/validações internas em repositórios: `cash.repo.ts`, `pos.repo.ts`, `settings.repo.ts`, `product/category repos` (checks de saldo, estoque, etc.). Onde encontrar: `server/src/repositories/*.ts`.
4. Payloads/contratos exatos usados pelo frontend nos services e pages (ex.: `services/category.ts`, `services/user.ts`, `pages/POS.tsx`, `pages/CashManagement.tsx`): confirmar formatos esperados/retornados.
5. Seeds adicionais além de `settings` e `users/root` (ex.: `build/criar-db-e-root.bat` ou outras migrations). Onde encontrar: scripts em `/build/*.bat`, `/server/migrations/`.
6. Métricas/sys endpoints (CPU/Mem) se existirem. Onde encontrar: `server/src/routes/sys`.
7. Conteúdo completo do DB Manager UI (referência em `src/renderer/components/adminDb/*`). Onde encontrar: pasta correspondente.
