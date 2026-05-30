@echo off
REM Flash ESP8266 MicroPython firmware (erase + write)
REM Board port: COM8 | Firmware: v1.22.2 (includes ussl for MQTT TLS; v1.23+ removed it)

set PORT=COM8
set FIRMWARE=%~dp0firmware\ESP8266_GENERIC-v1.22.2.bin

echo.
echo === ESP8266 MicroPython firmware flash ===
echo Port:     %PORT%
echo Firmware: %FIRMWARE%
echo.

if not exist "%FIRMWARE%" (
    echo ERROR: Firmware file not found.
    echo Download from: https://micropython.org/download/ESP8266_GENERIC/
    pause
    exit /b 1
)

echo [1/2] Erasing flash...
python -m esptool --port %PORT% erase_flash
if errorlevel 1 goto fail

echo.
echo [2/2] Writing firmware...
python -m esptool --port %PORT% --baud 460800 write_flash --flash_size=detect 0 "%FIRMWARE%"
if errorlevel 1 goto fail

echo.
echo Firmware flash complete. Deploy app files with rshellCommandsforMqtt.bat
pause
exit /b 0

:fail
echo.
echo Firmware flash failed. Check USB cable and COM port.
pause
exit /b 1
