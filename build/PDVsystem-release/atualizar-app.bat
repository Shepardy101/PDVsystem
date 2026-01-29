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

:: Tenta parar o servico se existir (NSSM ou Nativo)
echo [Info] Tentando parar servico PDVsystem...
net stop PDVsystem >nul 2>&1

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

echo [5/5] Reiniciando sistema...
echo [Info] Iniciando servico PDVsystem...
net start PDVsystem >nul 2>&1

if %errorlevel% neq 0 (
    echo [Aviso] Nao foi possivel iniciar o servico automaticamente via 'net start'. 
    echo Verifique se o servico esta instalado com o nome 'PDVsystem'.
)

echo ========================================
echo   ATUALIZADO COM SUCESSO!
echo ========================================
timeout /t 10
exit
