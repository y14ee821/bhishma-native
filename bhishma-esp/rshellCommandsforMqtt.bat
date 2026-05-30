@echo off
REM Deploy Bhishma app files to ESP8266 via rshell
REM Run from anywhere; paths are relative to this folder.

set PORT=COM8
set RSHELL=C:\Users\lchinta\AppData\Roaming\Python\Python314\Scripts\rshell.exe
cd /d "%~dp0"

echo.
echo === Deploying Bhishma files to %PORT% ===
echo From: %CD%
echo.

"%RSHELL%" -p %PORT% -f deployApp.rshell
if errorlevel 1 (
    echo.
    echo Deploy failed. Close any serial monitor using %PORT% and retry.
    pause
    exit /b 1
)

echo.
echo Deploy complete.
pause
