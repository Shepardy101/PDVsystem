@echo off
REM Wrapper para executar o instalador da raiz
cd /d %~dp0..
call instalar-app.bat
