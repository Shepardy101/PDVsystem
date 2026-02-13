# 02 - Stack e Dependências

## Frontend
- React 19 + Vite (SPA) servida pelo backend.
- UI: Tailwind, ícones lucide-react.
- Gráficos: Recharts e Chart.js (importadas em components de relatórios/monitoramento).

## Backend
- Node.js + Express (TypeScript → build em `server/dist`).
- Banco: SQLite via better-sqlite3.
- Uploads: multer (rota de uploads em `server/src/routes/sys/uploads`.
- UUID: `uuid`.
- CORS habilitado globalmente.

## Scripts npm
- `dev:api`: `tsx watch server/src/index.ts` (backend em watch).
- `dev`: `concurrently` para backend + Vite (`vite --port 3000`).
- `build:client`: `vite build`.
- `build:server`: `tsc --project server/tsconfig.json`.
- `build`: build full (client+server).
- `start:prod`: `cross-env NODE_ENV=production node server/dist/index.js`.
- `start:local`: `NODE_ENV=production node server/src/index.js` (sem build).
- `migrate`: `ts-node server/src/db/migrate.ts`.
- `docs:check`: valida documentação (scripts/docs-check.mjs).
- `docs:setup-hooks`: configura core.hooksPath para `.githooks`.

## Observações de execução local
- Porta padrão: 8787 (ver `server/src/index.ts`).
- Banco: `data/novabev.sqlite` (criado se ausente) com PRAGMAs WAL e foreign_keys.
- Necessário rodar `npm run migrate` após build do server ou usando ts-node (como configurado).
