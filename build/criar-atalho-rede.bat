@echo off
setlocal
REM Cria um atalho PDVsystem.lnk para acesso via rede (Chrome app mode)


REM Solicita o IP se não passado como argumento
if "%1"=="" (
  set /p HOST_INPUT=Digite o IP do servidor (porta 8787): 
) else (
  set "HOST_INPUT=%1"
)
set "PORT_INPUT=%2"
if "%PORT_INPUT%"=="" set "PORT_INPUT=8787"

set "SHORTCUT_PATH=%~dp0PDVsystem.lnk"
set "APP_URL=http://%HOST_INPUT%:%PORT_INPUT%"

set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" (
  echo Chrome nao encontrado! Instale o Google Chrome.
  exit /b 1
)

REM Usa o logo customizado como ícone do atalho
set "ICON_PATH=C:\PDVsystem\public\uploads\logo.jpg"
powershell -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%CHROME_PATH%';$s.Arguments='--app=%APP_URL%';$s.IconLocation='%ICON_PATH%';$s.Save()"

echo Atalho criado em %SHORTCUT_PATH% apontando para %APP_URL%
endlocal
