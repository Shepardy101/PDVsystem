# 04 - Estrutura de Pastas e Arquivos

## Árvore (alto nível)
- `/server/src/index.ts`: configura Express, CORS, JSON, IP control, estáticos de `dist/`, registra rotas.
- `/server/src/config.ts`: porta e caminho do DB (quando usado).
- `/server/src/db/database.ts`: abre SQLite em `data/novabev.sqlite`, aplica PRAGMAs WAL e foreign_keys.
- `/server/src/db/migrate.ts`: executor de migrations em `server/src/db/migrations/*.sql`.
- `/server/src/routes/`: rotas por domínio (pos, cash, cash.history, product, category, user/clients, supplier, report, reports, admin-db, admin/ip-control, settings, health, sys).
- `/server/src/repositories/`: camada de acesso ao DB (pos.repo, cash.repo, adminDb.repo, reports.repo, settings.repo, etc.).
- `/pages/`: páginas React principais (POS, CashManagement, Entities, Reports, Settings, Products, Login).
- `/components/`: componentes compartilhados e modais (pagamento, sangria, abertura/fechamento, gráficos, UI base).
- `/src/renderer/components/adminDb/`: UI do DB Manager embutida no Settings.
- `/data/`: banco SQLite e arquivos WAL/SHM.
- `/public/uploads/`: uploads servidos pelo backend.
- `/dist/`: build do frontend Vite.
- `/server/dist/`: build do backend.
- `/scripts/`: scripts utilitários (docs-check, setup-githooks).
- `/.githooks/`: hooks git (pre-commit executando docs-check).
- `/*.bat`, `/build/*.bat`: automações Windows/pm2 (instalar, iniciar, empacotar, criar DB/root).

## Arquivos principais (exemplos)
- `server/src/routes/pos.routes.ts`: GET `/api/pos/sales`, POST `/api/pos/finalizeSale`.
- `server/src/routes/cash.routes.ts`: movimentações, abrir/fechar caixa, sangria, suprimento, pagamento, sessions-movements.
- `server/src/routes/cash.history.routes.ts`: GET `/api/cash/history` (consolida vendas/sangrias/suprimentos por sessão).
- `server/src/routes/report.routes.ts`: sold-products e sold-products-detailed.
- `server/src/routes/reports.routes.ts`: product-mix.
- `server/src/routes/adminDb.routes.ts`: DB Manager (CRUD genérico, query, reset).
- `server/src/middleware/ipAccessControl.ts`: whitelist de IPs, registra pending_ips.
- `server/src/repositories/adminDb.repo.ts`: operações genéricas no DB, reset e root user.
- `pages/POS.tsx`: terminal de vendas, abertura de caixa.
- `pages/CashManagement.tsx`: auditoria de caixa (sessão atual, histórico, desempenho).
- `pages/Reports.tsx`: consumo de `/api/report` e `/api/reports` (exibe JSON de vendas).
- `pages/Settings.tsx`: configurações, embed do DB Manager, logs mock.
- `services/*.ts`: chamadas de API (ex.: `services/cash.ts`, `services/category.ts`, `services/reports.ts`, `services/user.ts`).
