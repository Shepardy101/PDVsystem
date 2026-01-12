@echo off
REM Instala dependências, instala pm2, inicia backend oculto e cria atalho do app

REM 1. Instalar dependências do Node.js
call npm install

REM 2. Instalar pm2 globalmente (se não estiver instalado)
where pm2 >nul 2>nul
if %errorlevel% neq 0 npm install -g pm2

REM 3. Iniciar backend com pm2 (modo produção, oculto)
pm2 start server/dist/index.js --name PDVsystem --env production

REM 4. Salvar configuração do pm2 para reiniciar com Windows
pm2 save
pm2 startup | findstr /i "pm2" > pm2-startup-cmd.bat
call pm2-startup-cmd.bat

REM 5. Criar atalho do app na área de trabalho (modo app Chrome)
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

REM Criar atalho na pasta raiz do projeto (onde está este script)
set SHORTCUT_PATH=%~dp0%SHORTCUT_NAME%
powershell $s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%CHROME_PATH%';$s.Arguments='--app=%APP_URL%';$s.Save()

echo Instalação concluída! O backend está rodando oculto com pm2 e o atalho foi criado na área de trabalho.
pause
