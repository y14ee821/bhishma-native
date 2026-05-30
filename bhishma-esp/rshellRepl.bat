@echo off
REM Open rshell REPL to see boot prints and interact. Type 'exit' twice to quit.
set PORT=COM8
set RSHELL=C:\Users\lchinta\AppData\Roaming\Python\Python314\Scripts\rshell.exe

echo.
echo === rshell REPL on %PORT% ===
echo In rshell type:  repl
echo Then Ctrl+D = soft reboot (see boot logs)
echo      Ctrl+C = stop main.py and get ^>^>^> prompt
echo      exit   = leave REPL, then exit rshell
echo.

"%RSHELL%" -p %PORT%
