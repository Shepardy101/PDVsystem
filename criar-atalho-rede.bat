@echo off
setlocal
REM Cria um atalho PDVsystem.lnk para acesso via rede (Chrome app mode)

set "HOST_INPUT=%1"
set "PORT_INPUT=%2"
if "%HOST_INPUT%"=="" (
  echo Host nao informado. Use: criar-atalho-rede.bat <host> [porta]
  exit /b 1
)
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

powershell -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%CHROME_PATH%';$s.Arguments='--app=%APP_URL%';$s.Save()"

echo Atalho criado em %SHORTCUT_PATH% apontando para %APP_URL%
endlocal
