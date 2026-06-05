@echo off
setlocal
:: MangaTranslator Extension Backend Launcher
cd /d "%~dp0"

set "PYTHON_EXE=python"
if exist "%~dp0..\MangaTranslator\runtime\python.exe" set "PYTHON_EXE=%~dp0..\MangaTranslator\runtime\python.exe"
if exist "%~dp0backend\runtime\python.exe" set "PYTHON_EXE=%~dp0backend\runtime\python.exe"
if exist "%~dp0backend\.venv\Scripts\python.exe" set "PYTHON_EXE=%~dp0backend\.venv\Scripts\python.exe"

echo Starting MangaTranslator Backend on port 7677...
echo Python: %PYTHON_EXE%
echo.

cd /d "%~dp0backend"
"%PYTHON_EXE%" main.py

pause
