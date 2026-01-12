@echo off
REM Instalação Cyberpunk NBPOS
REM Instala dependências, pm2 e exibe interface estilizada

powershell Write-Host "==============================" -ForegroundColor Magenta
powershell Write-Host "   NBPOS - CYBERPUNK INSTALL   " -ForegroundColor Cyan
powershell Write-Host "==============================" -ForegroundColor Magenta

REM Instalar dependências do Node.js com log amigável
powershell Write-Host "Instalando dependências..." -ForegroundColor Yellow
npm install --loglevel=error
if %errorlevel% neq 0 (
  powershell Write-Host "[ERRO] Falha ao instalar dependências!" -ForegroundColor Red
  pause
  exit /b 1
)

REM Instalar pm2 globalmente (se não estiver instalado)
powershell Write-Host "Verificando pm2..." -ForegroundColor Yellow
where pm2 >nul 2>nul
if %errorlevel% neq 0 npm install -g pm2

REM Iniciar backend com pm2
powershell Write-Host "Iniciando backend..." -ForegroundColor Yellow
pm2 start server/dist/index.js --name PDVsystem --env production
pm2 save

REM Mensagem final cyberpunk
powershell Write-Host "==============================" -ForegroundColor Magenta
powershell Write-Host "Instalação concluída!" -ForegroundColor Green
powershell Write-Host "Backend rodando com pm2." -ForegroundColor Green
powershell Write-Host "==============================" -ForegroundColor Magenta
pause
