@echo off
REM Script para rodar backend e frontend em modo desenvolvimento

REM Iniciar backend (ajuste o comando conforme seu ambiente)
start "Backend" cmd /k "cd /d %~dp0server && npm run dev || node dist/index.js"

REM Iniciar frontend (Vite)
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Ambiente de desenvolvimento iniciado!
pause
