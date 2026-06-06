@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "PYTHON_EXE=python"
if exist "%~dp0backend\runtime\python.exe" set "PYTHON_EXE=%~dp0backend\runtime\python.exe"
if exist "%~dp0backend\.venv\Scripts\python.exe" set "PYTHON_EXE=%~dp0backend\.venv\Scripts\python.exe"

set "FLUX_DIR=%~dp0backend\models\flux"
set "FLUX_REPO=Disty0/FLUX.2-klein-4B-SDNQ-4bit-dynamic"

echo.
echo MangaTranslator Extension setup
echo --------------------------------
echo Python: %PYTHON_EXE%
echo.
echo 1. Lightweight setup, no Flux model
echo 2. Download optional Flux Klein 4B model
echo 3. Remove local Flux model cache
echo 4. Exit
echo.
set /p "CHOICE=Choose an option [1-4]: "

if "%CHOICE%"=="1" goto lightweight
if "%CHOICE%"=="2" goto install_flux
if "%CHOICE%"=="3" goto remove_flux
if "%CHOICE%"=="4" goto done

echo Invalid choice.
goto done

:lightweight
echo.
echo Lightweight setup selected.
echo Flux is optional and is not required for default outside-text cleanup.
echo Keep backend outside-text inpainting_method as "auto" or "opencv" for light usage.
goto done

:install_flux
echo.
echo This will download the optional Flux Klein 4B model.
echo Target: %FLUX_DIR%
echo Repo:   %FLUX_REPO%
echo.
set /p "CONFIRM=Continue? [y/N]: "
if /I not "%CONFIRM%"=="Y" goto done

mkdir "%FLUX_DIR%" >nul 2>nul

"%PYTHON_EXE%" -m pip show huggingface_hub >nul 2>nul
if errorlevel 1 (
  echo Installing huggingface_hub...
  "%PYTHON_EXE%" -m pip install huggingface_hub
  if errorlevel 1 goto flux_failed
)

echo Downloading Flux model. This can take a long time.
"%PYTHON_EXE%" -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='%FLUX_REPO%', cache_dir=r'%FLUX_DIR%', local_dir=None, resume_download=True)"
if errorlevel 1 goto flux_failed

echo.
echo Flux model download completed.
echo Enable Flux only when needed by setting outside_text.inpainting_method to flux_klein_4b.
goto done

:remove_flux
echo.
if not exist "%FLUX_DIR%" (
  echo No local Flux model folder found.
  goto done
)
echo This will delete:
echo %FLUX_DIR%
set /p "CONFIRM=Delete Flux cache? [y/N]: "
if /I not "%CONFIRM%"=="Y" goto done
rmdir /s /q "%FLUX_DIR%"
if exist "%FLUX_DIR%" (
  echo Failed to remove Flux folder.
) else (
  echo Flux folder removed.
)
goto done

:flux_failed
echo.
echo Flux setup failed.
echo Check your internet connection and available disk space, then run setup.bat again.
goto done

:done
echo.
pause
