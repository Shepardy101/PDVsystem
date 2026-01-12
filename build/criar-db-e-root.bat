@echo off
REM Script para rodar todas as migrations e criar usuário root padrão
REM Executa o migrador do backend e insere usuário root

REM 1. Executa as migrations
node server\dist\db\migrate.js
if %errorlevel% neq 0 (
  echo [ERRO] Falha ao rodar as migrations!
  pause
  exit /b 1
)

REM 2. Insere usuário root padrão
REM Ajuste o comando abaixo conforme o nome da tabela de usuários
node -e "const db=require('./server/dist/db/database.js').default; db.prepare('INSERT OR IGNORE INTO users (id, username, password, role) VALUES (\"root\", \"root\", \"root123\", \"admin\")').run(); console.log('Usuário root criado!');"

pause
