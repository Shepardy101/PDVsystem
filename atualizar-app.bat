@echo off
setlocal
set APP_NAME=pdvsys
set ROOT_DIR=%~dp0
set TEMP_ZIP=%ROOT_DIR%temp_update.zip
set EXTRACT_DIR=%ROOT_DIR%temp_extract

echo ========================================
echo   PDVsystem - ATUALIZADOR AUTOMÁTICO
echo ========================================

echo [1/5] Aguardando encerramento do processo principal...
timeout /t 3 /nobreak >nul

:: Tenta parar via PM2 se existir
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo [Info] Tentando parar via PM2...
    call pm2 stop %APP_NAME% >nul 2>&1
)

echo [2/5] Extraindo arquivos...
if exist "%EXTRACT_DIR%" rmdir /s /q "%EXTRACT_DIR%"
mkdir "%EXTRACT_DIR%"

powershell -Command "try { Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%EXTRACT_DIR%' -Force } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [Erro] Falha ao extrair o pacote de atualização.
    pause
    exit /b 1
)

echo [3/5] Aplicando atualizacao (isso pode levar alguns segundos)...
xcopy /e /i /y "%EXTRACT_DIR%\*" "%ROOT_DIR%"

echo [4/5] Limpando arquivos temporarios...
rmdir /s /q "%EXTRACT_DIR%"
del /f /q "%TEMP_ZIP%"

echo [5/5] Reiniciando sistema...
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo [Info] Reiniciando via PM2...
    call pm2 restart %APP_NAME%
) else (
    echo [Info] PM2 nao encontrado. Por favor, inicie o sistema manualmente ou via iniciar-app.bat.
)

echo ========================================
echo   ATUALIZADO COM SUCESSO!
echo ========================================
timeout /t 10
exit
