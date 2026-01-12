@echo off
REM Script para empacotar a aplicação para distribuição
REM Gera um arquivo PDVsystem-20260112.zip com os arquivos necessários

set ZIPNAME=PDVsystem-20260112.zip
set OUTDIR=build

REM Limpa build anterior
if exist %OUTDIR%\%ZIPNAME% del %OUTDIR%\%ZIPNAME%


REM Compacta todos os arquivos essenciais para o pacote final
REM Inclui também o backend buildado (server/dist)
REM Compacta todos os arquivos essenciais para o pacote final, preservando estrutura
powershell Compress-Archive -Path dist,public\uploads,node_modules,data\novabev.sqlite,package.json,package-lock.json,README.md,iniciar-app.bat,instalar-app.bat,criar-atalho-app.bat,server,server\migrations -DestinationPath %OUTDIR%\%ZIPNAME% -Force

echo Pacote gerado em %OUTDIR%\%ZIPNAME%

echo Pacote gerado em %OUTDIR%\%ZIPNAME%
