@echo off
REM Wrapper: chama o package-app.bat da raiz para gerar o zip de produção
cd /d %~dp0..
call package-app.bat
