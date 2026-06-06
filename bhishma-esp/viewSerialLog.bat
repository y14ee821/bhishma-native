@echo off
REM Live serial log from ESP8266 (115200 baud). Close rshell first — only one app can use COM8.
set PORT=COM11
echo.
echo === Serial log on %PORT% @ 115200 ===
echo Press Ctrl+] then q to quit (miniterm)
echo.
python -m serial.tools.miniterm %PORT% 115200
