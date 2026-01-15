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

- `PORT` (default 8787).
- `DB_PATH` (default `data/novabev.sqlite`).
- `ENABLE_DB_ADMIN` (habilita `/api/admin-db`; requer localhost).
- `PERF_LOG_ENABLED` (default `true`; desliga logger periódico de performance se `false`).
- `PERF_LOG_INTERVAL_MS` (intervalo do logger de performance; default 60000 ms, mínimo 5000 ms).
- `BACKUP_WEBHOOK_URL` / `BACKUP_WEBHOOK_TOKEN` (webhook opcional para envio de backups de logs/DB; token é Bearer opcional).
- `LOG_EXPORT_WINDOW_HOURS` (janela de exportação de logs para webhook; default 24h).
- `BACKUP_SEND_TIMEOUT_MS` (timeout para POST do webhook; default 5000 ms).
- `VITE_APP_NAME` (define o nome do sistema exibido no frontend e título do navegador).

> **Nota:** O arquivo `.env.local` tem prioridade sobre `.env` e é recomendado para configurações específicas de ambiente local (ex: desenvolvimento, testes). Use `.env` para valores padrão e compartilhados. Se ambos existirem, o valor de `.env.local` será usado.

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
