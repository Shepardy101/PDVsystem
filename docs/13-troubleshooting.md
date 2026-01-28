# 13 - Troubleshooting

- **Porta 8787 ocupada**: defina `PORT` ou libere a porta; verifique pm2 mantendo instância ativa.
- **DB lock/WAL**: confirme fechamento de processos; verifique `*.sqlite-wal`/`*.sqlite-shm`; reinicie pm2.
- **Migrações falhando**: rode `npm run build:server` se usar dist, ou `npm run migrate` (ts-node); erros de "already exists" são tolerados pelo migrator.
- **CORS/localhost**: CORS habilitado; problemas costumam ser bloqueio de IP (ver ipAccessControl) ou firewall.
- **IP bloqueado (403 Forbidden)**: Autorize o IP em `allowed_ips` via painel ip-control; a resposta do erro 403 no log do navegador (F12) agora mostra o IP detectado pelo servidor (`yourIp`) para facilitar o ajuste.
- **Admin DB inacessível (404 Not Found)**: Requer `ENABLE_DB_ADMIN=true` no `.env` e acesso via localhost. O backend deve ser iniciado com `--env-file=.env` e `--cwd` apontando para a raiz para localizar o arquivo.
- **Script .bat fechando sozinho**: Verifique se todos os comandos externos (`pm2`, `npm`) estão precedidos por `call`.
