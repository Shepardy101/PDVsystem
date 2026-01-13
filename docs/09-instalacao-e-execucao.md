# 09 - Instalação e Execução

## Pré-requisitos
- Node.js instalado.
- Windows recomendado (scripts .bat e pm2 utilizados).
- pm2 global (`npm install -g pm2`) para uso dos scripts de serviço.

## Passo a passo
1) `npm install`
2) Migrar o banco: `npm run migrate` (usa ts-node em `server/src/db/migrate.ts`).
3) Desenvolvimento: `npm run dev` (backend watch + Vite em 3000).
4) Build: `npm run build:client` e `npm run build:server` (ou `npm run build`).
5) Produção local: `npm run start:prod` ou via pm2 (`pm2 start server/dist/index.js --name PDVsystem --env production`).
6) Start local sem build: `npm run start:local` (usa TS direto; requer ts-node/tsx disponíveis).

## Variáveis de ambiente
- `PORT` (default 8787).
- `DB_PATH` (default `data/novabev.sqlite`).
- `ENABLE_DB_ADMIN` (habilita `/api/admin-db`; requer localhost).

## Banco de Dados
- Local: `data/novabev.sqlite`; WAL/SHM gerados automaticamente.
- Reset seguro: `POST /api/admin-db/reset` (precisa `ENABLE_DB_ADMIN=true`, IP localhost, body `confirm: "RESET"`).

## Artefatos
- Frontend build: `dist/`
- Backend build: `server/dist/`
- Uploads: `public/uploads/`

## Dicas
- Sempre rodar migrate após atualizar migrations.
- Para pm2: `pm2 save` e `pm2 startup` conforme scripts .bat de instalação.
