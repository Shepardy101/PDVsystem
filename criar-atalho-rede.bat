@echo off
REM Script para criar atalho do Chrome para IP informado na porta 8787

REM Solicita o IP ao usuário
set /p IP=Digite o IP desejado: 


REM Define o caminho do Chrome (ajuste se necessário)
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe


REM Define o destino do atalho (na mesma pasta do script)
set SCRIPT_DIR=%~dp0
set SHORTCUT_PATH=%SCRIPT_DIR%Chrome_PDVsystem.lnk

REM Cria um arquivo temporário VBScript para gerar o atalho
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%temp%\makeShortcut.vbs"
echo sLinkFile = "%SHORTCUT_PATH%" >> "%temp%\makeShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%temp%\makeShortcut.vbs"

echo oLink.TargetPath = "%CHROME_PATH%" >> "%temp%\makeShortcut.vbs"
echo oLink.Arguments = "--app=http://%IP%:8787" >> "%temp%\makeShortcut.vbs"
echo oLink.Description = "Atalho para Chrome no IP %IP% porta 8787" >> "%temp%\makeShortcut.vbs"
echo oLink.IconLocation = "C:\PDVsystem\public\uploads\logo.png" >> "%temp%\makeShortcut.vbs"
echo oLink.Save >> "%temp%\makeShortcut.vbs"

REM Executa o VBScript para criar o atalho
cscript //nologo "%temp%\makeShortcut.vbs"

REM Remove o script temporário
del "%temp%\makeShortcut.vbs"

echo Atalho criado na área de trabalho!
pause
