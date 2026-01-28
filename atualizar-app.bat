@echo off
setlocal
set APP_NAME=PDVsystem
set ROOT_DIR=%~dp0
set TEMP_ZIP=%ROOT_DIR%temp_update.zip
set EXTRACT_DIR=%ROOT_DIR%temp_extract

echo ========================================
echo   PDVsystem - ATUALIZADOR AUTOMÁTICO
echo ========================================

timeout /t 5 /nobreak >nul
echo [1/5] Parando servico...
call pm2 stop %APP_NAME%

echo [2/5] Extraindo arquivos...
if exist "%EXTRACT_DIR%" rmdir /s /q "%EXTRACT_DIR%"
mkdir "%EXTRACT_DIR%"
powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%EXTRACT_DIR%' -Force"

echo [3/5] Aplicando atualizacao...
xcopy /e /i /y "%EXTRACT_DIR%\*" "%ROOT_DIR%"

echo [4/5] Limpando arquivos temporarios...
rmdir /s /q "%EXTRACT_DIR%"
del /f /q "%TEMP_ZIP%"

echo [5/5] Reiniciando sistema...
call pm2 start %APP_NAME%

echo ========================================
echo   ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!
echo ========================================
timeout /t 5
exit
