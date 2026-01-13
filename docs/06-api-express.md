# 06 - API Express

## Middlewares globais
- `cors`, `express.json()` aplicados em `server/src/index.ts`.
- `ipAccessControl` aplicado a todas as rotas exceto: `/api/health`, `/api/admin-db`, `/api/admin/ip-control`, `/uploads`.
- Estáticos: `/uploads` (public/uploads), `dist/` para frontend.

## Health
- `GET /api/health` (arquivo health.routes.ts — conteúdo não exibido; lacuna listada).

## POS (`server/src/routes/pos.routes.ts`)
- `GET /api/pos/sales?cashSessionId=`
  - Query: `cashSessionId` obrigatório.
  - Retorna vendas da sessão com `items` e `payments` anexados.
  - Erros: 400 se faltar `cashSessionId`; 500 em erro interno.
- `POST /api/pos/finalizeSale`
  - Body: venda completa (items, payments, subtotal, total, discounts, operatorId, cashSessionId). Validado em `finalizeSale` (repo não exibido).
  - Sucesso: 201 `{ saleId }`. Erro: 400 `{ error: { code: 'SALE_ERROR', message } }`.

## Caixa (`server/src/routes/cash.routes.ts`)
- `GET /api/cash/movements/:cashSessionId`: lista movimentos por sessão; usa `getCashMovementsBySession`.
- `GET /api/cash/sessions-movements`: retorna `{ sessions, movements, sales }` (sales com `payments` e `items`).
- `POST /api/cash/pagamento`: body `{ amount, category, description, operatorId?, cashSessionId? }`; se não informar sessão, usa `getOpenCashSession`; registra `addPagamentoMovement`.
- `POST /api/cash/sangria`: body `{ amount, category, description, operatorId?, cashSessionId? }`; usa `addSangriaMovement`.
- `GET /api/cash/movements`: movimentos da sessão aberta do `operatorId` query.
- `POST /api/cash/suprimento`: body `{ amount, category, description, operatorId?, cashSessionId? }`; usa `addSuprimentoMovement`.
- `POST /api/cash/close`: body `{ sessionId, physicalCount }`; fecha sessão via `closeCashSession`.
- `POST /api/cash/open`: body `{ operatorId, initialBalance, userId }`; abre sessão via `openCashSession`; requer `userId`.
- `GET /api/cash/open?userId=`: retorna sessão aberta; 404 se não houver.

## Caixa - Histórico (`server/src/routes/cash.history.routes.ts`)
- `GET /api/cash/history`: lista sessões ordenadas por `opened_at` desc; calcula `sales_total`, `sangrias_total`, `suprimentos_total`, `expected_balance`, `status` (status danger se `difference_at_close` diferente de 0).

## Produtos/Categorias
- Rotas em `server/src/routes/product.routes.ts` e `category.routes.ts` (não exibidas; lacuna).

## Usuários / Clientes / Fornecedores
- Rotas em `server/src/routes/user.routes.ts` (clients incluídos), `supplier.routes.ts` (não exibidas; lacuna).

## Relatórios
- `server/src/routes/report.routes.ts`
  - `GET /api/report/sold-products-detailed`: lista itens de venda com `sale_date`, ordenado por timestamp desc.
  - `GET /api/report/sold-products?start=&end=`: agrega `sale_items` por produto com sum de quantidade e valor; filtros opcionais `start`, `end` (epoch ms).
- `server/src/routes/reports.routes.ts`
  - `GET /api/reports/product-mix?from=&to=`: requer intervalo epoch ms; retorna quadrantes calculados em `reports.repo`.

## Settings (`server/src/routes/settings.routes.ts`)
- `GET /api/settings`: retorna todas as configs.
- `GET /api/settings/:key`: retorna chave específica ou 404.
- `PUT /api/settings/:key`: body `{ value, oldValue? }`; se `key === 'admin_password'`, valida `oldValue` contra valor atual.

## Admin DB (`server/src/routes/adminDb.routes.ts`)
- Guard: `guardAdminDb` (em `services/adminDb.service.ts`): exige `ENABLE_DB_ADMIN === 'true'` e IP localhost.
- `GET /api/admin-db/tables`: lista tabelas (usa `adminDb.repo.listTables`).
- `GET /api/admin-db/schema?table=`: schema + FKs.
- `GET /api/admin-db/rows?table=&limit=&offset=&orderBy=&orderDir=&search=`.
- `POST /api/admin-db/rows`: insere (valida colunas existentes).
- `PUT /api/admin-db/rows`: atualiza por PK.
- `DELETE /api/admin-db/rows`: remove por PK.
- `POST /api/admin-db/query`: query builder segura (valida colunas, ops).
- `POST /api/admin-db/reset`: limpa tabelas e recria root (senha texto "root").

## IP Control (`server/src/routes/admin/ipControl.routes.ts`)
- Registrada antes do middleware global; detalhes da rota não exibidos (lacuna). Middleware `ipAccessControl` usa tabelas allowed_ips/pending_ips.

## Sys
- Rotas em `server/src/routes/sys` (não exibidas; lacuna provável para métricas/uploads).

## Erros comuns
- 403 IP bloqueado (HTML amigável se Accept inclui text/html; JSON caso contrário) — ver `ipAccessControl`.
- 403 Admin DB sem flag ou fora de localhost.
- 400 validações de payload (cashSessionId ausente, etc.).

## Referências rápidas
- Middleware IP: `server/src/middleware/ipAccessControl.ts`.
- Product-mix repo: `server/src/repositories/reports.repo.ts`.
- Admin DB guard/handlers: `server/src/services/adminDb.service.ts`, repo `server/src/repositories/adminDb.repo.ts`.

## Lacunas
Detalhes de rotas não exibidas (products/categories/users/clients/suppliers/sys/ip-control) em `docs/99-lacunas-perguntas.md`.
