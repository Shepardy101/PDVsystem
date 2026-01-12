@echo off
REM Script para rodar apenas o backend em modo desenvolvimento
REM Mata processo na porta 8787 se estiver em uso, então inicia o backend


set PORT=8787
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
	echo Finalizando processo na porta %PORT% (PID=%%a)...
	taskkill /F /PID %%a
	timeout /t 2 >nul
)

cd /d %~dp0server
npm run dev || node dist/index.js
