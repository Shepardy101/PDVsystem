@echo off
setlocal
cd /d %~dp0

REM Exibe título com cor
powershell -Command "Write-Host '==== INSTALAÇÃO PDVsystem ====' -ForegroundColor Cyan"

echo [1/4] Instalando dependências de produção...
npm ci --production --silent >install.log 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Write-Host 'Falha ao instalar dependências. Veja install.log para detalhes.' -ForegroundColor Red"
  pause
  exit /b 1
)
powershell -Command "Write-Host 'Dependências instaladas com sucesso.' -ForegroundColor Green"

echo [2/4] Verificando pm2...
where pm2 >nul 2>nul
if %errorlevel% neq 0 npm install -g pm2 --silent >nul 2>nul
powershell -Command "Write-Host 'pm2 pronto.' -ForegroundColor Green"

echo [3/4] Iniciando backend com pm2 (produção)...
pm2 start server/dist/index.js --name PDVsystem --env production >nul 2>nul
pm2 save >nul 2>nul
powershell -Command "Write-Host 'Backend iniciado com pm2.' -ForegroundColor Green"

echo [4/4] Criando atalho do app (modo Chrome app)...
set SHORTCUT_NAME=PDVsystem.lnk
set APP_URL=http://localhost:8787
set CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" (
  powershell -Command "Write-Host 'Chrome não encontrado! Instale o Google Chrome para usar o modo app.' -ForegroundColor Red"
  pause
  exit /b 1
)

set SHORTCUT_PATH=%~dp0%SHORTCUT_NAME%
powershell $s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%CHROME_PATH%';$s.Arguments='--app=%APP_URL%';$s.Save()
powershell -Command "Write-Host 'Atalho criado com sucesso.' -ForegroundColor Green"

powershell -Command "Write-Host 'Pronto! pm2 rodando PDVsystem e atalho criado.' -ForegroundColor Cyan"
echo Veja install.log para detalhes em caso de erro.
endlocal
