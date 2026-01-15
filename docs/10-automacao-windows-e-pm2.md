# 10 - Automação Windows e pm2

## Scripts .bat (identificados)
- `instalar-app.bat`: `npm ci --production`, garante pm2, sobe backend em produção e cria atalho Chrome app.
- `iniciar-app.bat`: inicia backend (pm2) se necessário e abre Chrome em modo app para `http://localhost:8787`.
- `package-app.bat`: cria staging com dist, server/dist, banco, uploads, scripts e gera `build/PDVsystem-release.zip`.
- `build/*`: wrappers que chamam os scripts da raiz.
- `build/instalar-cyberpunk.bat`: instala backend/pm2 com mensagens estilizadas.
- `build/criar-db-e-root.bat`: executa migrations e cria usuário root padrão.

- Processo típico: `PDVsystem`.
- Para evitar duplicidade de processos, os scripts .bat executam `pm2 delete PDVsystem` antes de iniciar uma nova instância.
- Comandos úteis: `pm2 start server/dist/index.js --name PDVsystem --env production`, `pm2 restart PDVsystem`, `pm2 stop PDVsystem`, `pm2 logs PDVsystem`, `pm2 save`, `pm2 startup`.

## Quando usar
- Instalação inicial: `instalar-app.bat` ou `build/instalar-app.bat`.
- Subida/serviço contínuo: `iniciar-app.bat` ou pm2 manual.
- Empacotamento/backup: `package-app.bat`.
- Reset/seed: `build/criar-db-e-root.bat` (gera DB e root user).
