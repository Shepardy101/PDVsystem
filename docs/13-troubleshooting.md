# 13 - Troubleshooting

- **Porta 8787 ocupada**: defina `PORT` ou libere a porta; verifique pm2 mantendo instância ativa.
- **DB lock/WAL**: confirme fechamento de processos; verifique `*.sqlite-wal`/`*.sqlite-shm`; reinicie pm2.
- **Migrações falhando**: rode `npm run build:server` se usar dist, ou `npm run migrate` (ts-node); erros de "already exists" são tolerados pelo migrator.
- **CORS/localhost**: CORS habilitado; problemas costumam ser bloqueio de IP (ver ipAccessControl) ou firewall.
- **IP bloqueado**: autorize IP em `allowed_ips` via painel ip-control; IPs não autorizados ficam em `pending_ips`.
- **Problemas de build/dist**: execute `npm run build:client` e `npm run build:server`; garanta `dist/` e `server/dist/` presentes.
- **Admin DB inacessível**: requer `ENABLE_DB_ADMIN=true` e acesso localhost.
- **Falha ao abrir/consultar caixa**: `POST /api/cash/open` exige `userId`; `GET /api/cash/open?userId=` retorna 404 se não houver sessão.
