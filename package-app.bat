@echo off
setlocal
REM Empacota artefatos de produção em um .zip pronto para levar ao cliente.

set OUTDIR=build
set STAGEDIR=%OUTDIR%\PDVsystem-release
set ZIPNAME=PDVsystem-release.zip

echo Limpando artefatos anteriores...
if exist "%STAGEDIR%" rmdir /s /q "%STAGEDIR%"
if exist "%OUTDIR%\%ZIPNAME%" del /f /q "%OUTDIR%\%ZIPNAME%"

echo Criando staging em %STAGEDIR%...
mkdir "%STAGEDIR%" >nul

echo Copiando frontend (dist)...
xcopy /e /i /y "dist" "%STAGEDIR%\dist" >nul

echo Copiando backend compilado (server/dist)...
xcopy /e /i /y "server\dist" "%STAGEDIR%\server\dist" >nul

echo Copiando banco de dados (data/novabev.sqlite)...
if not exist "%STAGEDIR%\data" mkdir "%STAGEDIR%\data"
copy /y "data\novabev.sqlite" "%STAGEDIR%\data\novabev.sqlite" >nul

echo Copiando uploads...
xcopy /e /i /y "public\uploads" "%STAGEDIR%\public\uploads" >nul

echo Copiando manifestos e scripts...
copy /y "package.json" "%STAGEDIR%" >nul
copy /y "package-lock.json" "%STAGEDIR%" >nul
copy /y ".env" "%STAGEDIR%" >nul
copy /y "README.md" "%STAGEDIR%" >nul
copy /y "instalar-app.bat" "%STAGEDIR%" >nul
copy /y "iniciar-app.bat" "%STAGEDIR%" >nul
copy /y "executar-servico.bat" "%STAGEDIR%" >nul
copy /y "atualizar-app.bat" "%STAGEDIR%" >nul
copy /y "nssm.exe" "%STAGEDIR%" >nul
copy /y "iniciar-tunel.bat" "%STAGEDIR%" >nul
copy /y "criar-atalho-app.bat" "%STAGEDIR%" >nul
copy /y "INSTALACAO-CLIENTE.txt" "%STAGEDIR%" >nul

echo Copiando servidor de tunel (Ngrox)...
if not exist "%STAGEDIR%\server\Ngrox" mkdir "%STAGEDIR%\server\Ngrox"
copy /y "server\Ngrox\server.js" "%STAGEDIR%\server\Ngrox\server.js" >nul

echo Copiando migrations (referencia)...
xcopy /e /i /y "server\src\db\migrations" "%STAGEDIR%\server\src\db\migrations" >nul

echo Gerando zip final...
if not exist "%OUTDIR%" mkdir "%OUTDIR%"
powershell -Command "Compress-Archive -Path '%STAGEDIR%\*' -DestinationPath '%OUTDIR%\%ZIPNAME%' -Force"

echo Pacote gerado em %OUTDIR%\%ZIPNAME%
endlocal
