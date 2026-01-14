@echo off
setlocal
REM Instala dependências em produção, prepara pm2 e cria atalho do app

cd /d %~dp0

echo [1/4] Instalando dependências de produção (npm ci --production)...
npm ci --production
if %errorlevel% neq 0 (
  echo Falha ao instalar dependências.
  pause
  exit /b 1
)

echo [2/4] Verificando pm2...
where pm2 >nul 2>nul
if %errorlevel% neq 0 npm install -g pm2

echo [3/4] Iniciando backend com pm2 (produção)...
pm2 start server/dist/index.js --name PDVsystem --env production
pm2 save

echo [4/4] Criando atalho do app (modo Chrome app)...
set SHORTCUT_NAME=PDVsystem.lnk
set APP_URL=http://localhost:8787
set CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" (
  echo Chrome não encontrado! Instale o Google Chrome para usar o modo app.
  pause
  exit /b 1
)

set SHORTCUT_PATH=%~dp0%SHORTCUT_NAME%
powershell $s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%CHROME_PATH%';$s.Arguments='--app=%APP_URL%';$s.Save()

echo Pronto! pm2 rodando PDVsystem e atalho criado.
endlocal
