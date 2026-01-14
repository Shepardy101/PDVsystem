# 09 - Instalação e Execução

## Pré-requisitos
- Node.js instalado.
- Windows recomendado (scripts .bat e pm2 utilizados).
- pm2 global (`npm install -g pm2`) para uso dos scripts de serviço.

## Passo a passo
### Desenvolvimento
1) `npm install`
2) Migrar o banco: `npm run migrate` (usa ts-node em `server/src/db/migrate.ts`).
3) Dev: `npm run dev` (backend watch + Vite em 3000).

### Build
4) Build completo: `npm run build` (client + server).

### Produção local (com artefatos buildados)
5) `npm run start:prod` ou pm2: `pm2 start server/dist/index.js --name PDVsystem --env production`.
6) Start TS direto (sem build): `npm run start:local` (requer ts-node/tsx).

### Distribuição para cliente (zip pronto)
- Gerar pacote: `package-app.bat` → produz `build/PDVsystem-release.zip` com dist, server/dist, DB, uploads e scripts.
- No cliente (após extrair o zip):
	- `instalar-app.bat` (npm ci --production, pm2, atalho Chrome app).
	- `iniciar-app.bat` para abrir o app (backend já em pm2).
	- Não rodar migrations se estiver usando o banco já provisionado do pacote.

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
