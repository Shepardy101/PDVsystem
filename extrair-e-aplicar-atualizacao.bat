@echo off
setlocal
set ROOT_DIR=%~dp0
set TEMP_ZIP=%ROOT_DIR%temp_update.zip
set EXTRACT_DIR=%ROOT_DIR%temp_extract

echo ========================================
echo   EXTRAINDO ATUALIZAÇÃO
echo ========================================

REM Remove pasta de extração anterior, se existir
if exist "%EXTRACT_DIR%" rmdir /s /q "%EXTRACT_DIR%"
mkdir "%EXTRACT_DIR%"

REM Extrai o conteúdo do ZIP
powershell -Command "try { Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%EXTRACT_DIR%' -Force } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao extrair o pacote. Verifique se o arquivo está corrompido.
    pause
    exit /b 1
)

echo [INFO] Copiando arquivos extraídos para a raiz do projeto...
xcopy /e /i /y /c "%EXTRACT_DIR%\*" "%ROOT_DIR%"

echo [INFO] Limpeza de arquivos temporários...
rmdir /s /q "%EXTRACT_DIR%"
del /f /q "%TEMP_ZIP%"

echo ========================================
echo   ATUALIZAÇÃO EXTRAÍDA E APLICADA
echo ========================================
timeout /t 5
exit
