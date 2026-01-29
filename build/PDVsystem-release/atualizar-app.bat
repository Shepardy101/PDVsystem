@echo off
setlocal
set ROOT_DIR=%~dp0
set TEMP_ZIP=%ROOT_DIR%temp_update.zip
set EXTRACT_DIR=%ROOT_DIR%temp_extract

echo ========================================
echo   PDVsystem - ATUALIZADOR AUTOMÁTICO
echo ========================================

echo [1/5] Aguardando encerramento do processo principal...
timeout /t 3 /nobreak >nul

:: Verifica privilegios de Administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como ADMINISTRADOR para gerenciar servicos.
    pause
    exit /b 1
)


:: Para backend via pm2
echo [Info] Parando backend (pm2)...
call pm2 stop PDVsystem >nul 2>&1

:: Força a limpeza da porta 8787 caso o processo ainda esteja pendente
echo [Info] Garantindo que a porta 8787 esteja livre...

:killport
REM Captura o PID do processo na porta 8787 (se existir)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8787 ^| findstr LISTENING') do set PID8787=%%a
if defined PID8787 (
    echo [Info] Finalizando processo na porta 8787 (PID: %PID8787%)...
    taskkill /f /pid %PID8787% >nul 2>&1
    set PID8787=
    timeout /t 2 /nobreak >nul
    goto killport
)
REM Verifica novamente se a porta está livre
netstat -aon | findstr :8787 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    timeout /t 2 /nobreak >nul
    goto killport
)
echo [Info] Porta 8787 liberada.

echo [2/5] Extraindo arquivos...
if exist "%EXTRACT_DIR%" rmdir /s /q "%EXTRACT_DIR%"
mkdir "%EXTRACT_DIR%"

powershell -Command "try { Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%EXTRACT_DIR%' -Force } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [Erro] Falha ao extrair o pacote de atualização. Verifique se o arquivo esta corrompido ou se o processo ainda esta aberto.
    pause
    exit /b 1
)

echo [3/5] Aplicando atualizacao (isso pode levar alguns segundos)...
:: Tenta copiar os arquivos. O parâmetro /C permite continuar mesmo se houver erros em arquivos individuais
xcopy /e /i /y /c "%EXTRACT_DIR%\*" "%ROOT_DIR%"

echo [4/5] Limpando arquivos temporarios...
rmdir /s /q "%EXTRACT_DIR%"
del /f /q "%TEMP_ZIP%"


echo [5/5] Reiniciando backend (pm2)...
call pm2 start server/dist/index.js --name PDVsystem --env production --node-args="--env-file=.env"
call pm2 save >nul 2>&1
if %errorlevel% neq 0 (
    echo [Aviso] Nao foi possivel iniciar o backend automaticamente via pm2.
    echo Verifique se o pm2 está instalado e configurado corretamente.
)

echo ========================================
echo   ATUALIZADO COM SUCESSO!
echo ========================================
timeout /t 10
exit
