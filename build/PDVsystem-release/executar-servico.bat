@echo off
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
:: Inicia o node com o arquivo .env carregado
:: Nota: --env-file e nativo nas versoes recentes do Node.js
node --env-file=.env server/dist/index.js
