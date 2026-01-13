# 11 - Segurança e Guardrails

## Controle de IP
- Middleware `ipAccessControl` em `server/src/middleware/ipAccessControl.ts`.
- Exceções: `/api/health`, `/api/admin-db`, `/api/admin/ip-control`, `/uploads` (definido em `server/src/index.ts`).
- Lógica: permite localhost (`127.0.0.1`, `::1`, `localhost`); verifica `allowed_ips`; se não autorizado, registra em `pending_ips` e bloqueia (HTML amigável para browsers, JSON para APIs).

## Admin DB Manager
- Guard `guardAdminDb` (em `server/src/services/adminDb.service.ts`): requer `process.env.ENABLE_DB_ADMIN === 'true'` e IP localhost (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`).
- Funções: lista tabelas, schema, CRUD genérico, query builder, reset DB, criar root.
- Risco: acesso total ao banco; manter desabilitado fora de ambientes controlados.

## Reset do DB
- Endpoint: `POST /api/admin-db/reset` (body `confirm: "RESET"`).
- Efeito: limpa tabelas (desativa foreign_keys temporariamente) e recria root (`adminDb.repo.resetDatabase` e `createRootUser`).

## Boas práticas
- Operar em rede local; restringir firewall à porta 8787.
- Não habilitar `ENABLE_DB_ADMIN` em produção pública.
- Fazer backup frequente de `data/novabev.sqlite` e `public/uploads/`.
- Revisar IPs pendentes antes de liberar acesso.
