
@echo on
REM Script para iniciar backend (pm2) e abrir o app no Chrome modo app
echo ================================
echo INICIANDO PDVsystem
echo ================================

REM Caminho absoluto da raiz do projeto (pasta onde está este script)
set ROOT=%~dp0
echo [INFO] Raiz do projeto: %ROOT%

REM 1. Iniciar backend com pm2 (se não estiver rodando)
echo [INFO] Verificando pm2...
pm2 -v
if %errorlevel% neq 0 (
  echo [ERRO] pm2 não está instalado! Instale com: npm install -g pm2
  pause
  exit /b 1
)

echo [INFO] Verificando backend compilado...
set BACKEND=%ROOT%server\dist\index.js
if not exist "%BACKEND%" (
  echo [ERRO] Backend compilado não encontrado em %BACKEND%!
  echo [DICA] Rode o build do backend antes de empacotar.
  pause
  exit /b 1
)

echo [INFO] Verificando status do backend no pm2...
pm2 describe PDVsystem >nul 2>nul
if %errorlevel% neq 0 (
  echo [INFO] Iniciando backend com pm2...
  pm2 start "%BACKEND%" --name PDVsystem --env production
  if %errorlevel% neq 0 (
    echo [ERRO] Falha ao iniciar backend com pm2!
    pause
    exit /b 1
  )
) else (
  echo [INFO] Backend já está rodando com pm2.
)

REM 2. Esperar o backend subir (checar porta 8787)
set RETRIES=20
set WAIT=2
echo [INFO] Aguardando backend responder na porta 8787...
:waitloop
  powershell -Command "try { $r=Invoke-WebRequest -Uri http://localhost:8787 -UseBasicParsing -TimeoutSec 1 } catch {}; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 }"
  if %errorlevel%==0 goto openapp
  set /a RETRIES-=1
  if %RETRIES% leq 0 goto timeout
  echo [INFO] Backend ainda não respondeu, tentando novamente... (%RETRIES% tentativas restantes)
  timeout /t %WAIT% >nul
  goto waitloop
:timeout
  echo [ERRO] Backend não respondeu na porta 8787.
  pause
  exit /b 1

:openapp
REM 3. Abrir app no Chrome modo app
set APP_URL=http://localhost:8787
set CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" (
  echo [ERRO] Chrome não encontrado! Instale o Google Chrome para usar o modo app.
  pause
  exit /b 1
)
echo [INFO] Abrindo o app no Chrome...
start "PDVsystem" "%CHROME_PATH%" --app=%APP_URL%

echo [SUCESSO] App iniciado!
pause

REM 2. Esperar o backend subir (checar porta 8787)
set RETRIES=20
set WAIT=2
:waitloop
  powershell -Command "try { $r=Invoke-WebRequest -Uri http://localhost:8787 -UseBasicParsing -TimeoutSec 1 } catch {}; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 }"
  if %errorlevel%==0 goto openapp
  set /a RETRIES-=1
  if %RETRIES% leq 0 goto timeout
  echo Aguardando backend subir...
  timeout /t %WAIT% >nul
  goto waitloop
:timeout
  echo Erro: Backend não respondeu na porta 8787.
  pause
  exit /b 1

:openapp
REM 3. Abrir app no Chrome modo app
set APP_URL=http://localhost:8787
set CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" (
  echo Chrome não encontrado! Instale o Google Chrome para usar o modo app.
  pause
  exit /b 1
)
echo Abrindo o app no Chrome...
start "PDVsystem" "%CHROME_PATH%" --app=%APP_URL%

echo App iniciado!
pause