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
5) `npm run start:prod` ou, preferencialmente, pm2:
	- `pm2 start server/dist/index.js --name PDVsystem --env production --node-args="--env-file=.env"`
	- `pm2 save`
	- `pm2 startup` (para iniciar automaticamente com o Windows)
6) Start TS direto (sem build): `npm run dev:api` (requer tsx).

### Distribuição para cliente (zip pronto)
- Gerar pacote: `package-app.bat` → produz `build/PDVsystem-release.zip` com dist, server/dist, DB, uploads e scripts.
- No cliente (após extrair o zip):
	- `instalar-app.bat` (npm ci --production, pm2, atalho Chrome app).
	- `iniciar-app.bat` para abrir o app (backend já em pm2).
	- Não rodar migrations se estiver usando o banco já provisionado do pacote.

- `PORT` (default 8787).
- `DB_PATH` (default `data/novabev.sqlite`).
- `ENABLE_DB_ADMIN` (habilita `/api/admin-db` e manutenção; default `false`).
- `PERF_LOG_ENABLED` (default `true`; desliga logger periódico de performance se `false`).
- `PERF_LOG_INTERVAL_MS` (intervalo do logger de performance; default 60000 ms, mínimo 5000 ms).
- `VITE_APP_NAME` (define o nome do sistema exibido no frontend).
- `VITE_LOGS_WEBHOOK_URL` (URL para envio de logs ao limpar o cache).

> **Nota:** Recomenda-se o uso do Node.js v24 para aproveitar o carregamento nativo de `.env` via `--env-file`.
> # Variáveis de ambiente do PDVsystem
```ini
# Frontend
VITE_APP_NAME=Nome Empresa LTDA
VITE_APP_CNPJ=01.222.666/0001-00
VITE_APP_ADDRESS=Rua teste, 123 - cidade, estado
VITE_APP_PHONE=(62) 99999-1234
VITE_APP_VERSION=1.0.26
VITE_LOGS_WEBHOOK_URL=https://webhook.site/your-webhook-url

# Backend & Database
ENABLE_DB_ADMIN=false
NGROK_AUTHTOKEN=your-ngrok-authtoken
PERF_LOG_ENABLED=true
PERF_LOG_INTERVAL_MS=3600000
LOG_EXPORT_WINDOW_HOURS=24
BACKUP_WEBHOOK_URL=
BACKUP_WEBHOOK_TOKEN=
BACKUP_SEND_TIMEOUT_MS=5000
```

## Banco de Dados
- Local: `data/novabev.sqlite`; WAL/SHM gerados automaticamente.
- Reset seguro: `POST /api/admin-db/reset` (precisa `ENABLE_DB_ADMIN=true`, IP localhost, body `confirm: "RESET"`).


.env.local
```ini
PERF_LOG_ENABLED=true
PERF_LOG_INTERVAL_MS=3600000
BACKUP_WEBHOOK_URL=
BACKUP_WEBHOOK_TOKEN=
LOG_EXPORT_WINDOW_HOURS=24
BACKUP_SEND_TIMEOUT_MS=5000
NGROK_AUTHTOKEN=''
```

## Artefatos
- Frontend build: `dist/`
- Backend build: `server/dist/`
- Uploads: `public/uploads/`

## Dicas
- Sempre rodar migrate após atualizar migrations.
- Para pm2: `pm2 save` e `pm2 startup` conforme scripts .bat de instalação.
