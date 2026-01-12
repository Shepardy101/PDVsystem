@echo off
REM Script para empacotar a aplicação para distribuição
REM Gera um arquivo PDVsystem-20260112.zip com os arquivos necessários

set ZIPNAME=PDVsystem-20260112.zip
set OUTDIR=build

REM Limpa build anterior
if exist %OUTDIR%\%ZIPNAME% del %OUTDIR%\%ZIPNAME%

REM Compacta os arquivos essenciais
powershell Compress-Archive -Path dist,server\dist,public\uploads,data\novabev.sqlite,package.json,README.md -DestinationPath %OUTDIR%\%ZIPNAME% -Force

echo Pacote gerado em %OUTDIR%\%ZIPNAME%
