## Copilot Instructions — PDVsystem / NovaBev POS

**Arquitetura**
- SPA React/Vite servida pelo backend Express na mesma porta (8787); build do cliente em `dist/`, build do servidor em `server/dist/`.
- Backend TypeScript em `server/src/` (rotas em `server/src/routes/`, repositórios em `server/src/repositories/`); fallback de SPA em `server/src/index.ts`.
- Banco SQLite único em `data/novabev.sqlite` com PRAGMAs WAL + foreign_keys; migrations SQL em `server/src/db/migrations/`.

**Execução e builds**
- Dev: `npm run dev` (backend watch + Vite em 3000).
- Build: `npm run build:client`, `npm run build:server`, ou `npm run build` (full).
- Migração: `npm run migrate` (ts-node em `server/src/db/migrate.ts`).
- Produção: `npm run start:prod` ou `pm2 start server/dist/index.js --name PDVsystem --env production`.

**Padrões e dados**
- Valores monetários em centavos (inteiros); timestamps em epoch ms; IDs são TEXT/UUID.
- Produtos: unidade `cx|unit|kg|serv`, `min_stock` padrão 20, `status` active/inactive.
- Rotas principais em `/api/*`: POS (`/api/pos`), Caixa (`/api/cash` + `/api/cash/history`), Produtos/Categorias, Entidades (users/clients/suppliers), Relatórios (`/api/report`, `/api/reports`), Settings, Admin DB, IP Control.

**Segurança e guardrails**
- Middleware `ipAccessControl` com whitelist; exceções: `/api/health`, `/api/admin-db`, `/api/admin/ip-control`, `/uploads`. IPs desconhecidos vão para `pending_ips` e são bloqueados.
- Admin DB Manager apenas com `ENABLE_DB_ADMIN=true` e acesso localhost; `POST /api/admin-db/reset` limpa tabelas e recria root.
- Backups recomendados de `data/novabev.sqlite` e `public/uploads/`.

**Fluxo UI → API → DB**
- UI (pages/components + services) chama `/api/*`; middlewares (CORS, json, ipAccessControl) → rotas em `server/src/routes/*` → repositórios em `server/src/repositories/*` → SQLite.

**Automação Windows/pm2**
- Scripts `.bat` (`instalar-app.bat`, `iniciar-app.bat`, `package-app.bat` e variantes em `build/`) para instalar, iniciar e empacotar; uso típico do processo pm2 `PDVsystem`.

**Documentação e hooks**
- Docs em `docs/` (índice em `docs/README.md`); `npm run docs:check` valida presença/referências e roda no pre-commit via `.githooks/pre-commit`.

**Como contribuir com segurança**
- Alterou rotas ou payloads? Atualize `docs/06-api-express.md` e mantenha centavos/epoch.
- Alterou schema/migrations? Atualize `docs/05-banco-de-dados.md`.
- Alterou fluxos de caixa/POS? Revise `docs/07-regras-de-negocio.md` e `docs/08-relatorios-e-bi.md`.
- Mantenha caminhos reais do repositório ao documentar (services, pages, routes, repos).

**Verificações rápidas**
- Porta esperada 8787; DB em `data/novabev.sqlite`.
- IP whitelist ativo por padrão; admin-db é restrito e opcional.
- Rodar `npm run docs:check` antes de commitar.

**Modo de trabalho do agente (priorize rapidez com segurança)**
- Antes de codar: localizar arquivos relevantes (rotas, repos, services, pages) e citar docs usadas; não inventar rotas/tabelas/campos.
- Planejar em passos curtos e manter lista TODO; executar item a item e validar erros (lint/execução relevante quando aplicável).
- Para backend: editar rota em `server/src/routes/<domínio>.routes.ts` e lógica em `server/src/repositories/<domínio>.repo.ts`; manter centavos/epoch/UUID; se alterar schema, criar migration em `server/src/db/migrations/` e atualizar docs.
- Para frontend: pages em `pages/*.tsx`, componentes em `components/`, serviços HTTP em `services/*.ts`; respeitar padrões de dados (centavos, epoch) e unidades de produto.
- Segurança: não relaxar `ipAccessControl`; admin-db só com flag + localhost; reset de DB é destrutivo.
- Checklist por mudança: (1) apontar arquivos tocados, (2) sugerir testes manuais HTTP (curl/fetch) e UI, (3) rodar/lembrar `npm run docs:check`, (4) se buildar, usar scripts oficiais.
