@echo off
setlocal

set "CYBERSIM_DIR=%~dp0"
set "BACKEND_DIR=%CYBERSIM_DIR%cybersim-main\backend"
set "FRONTEND_DIR=%CYBERSIM_DIR%cybersim-main\frontend"

echo Starting CyberSim...

if not exist "%BACKEND_DIR%\node_modules" (
    echo Installing backend dependencies...
    pushd "%BACKEND_DIR%"
    call npm install
    if errorlevel 1 goto :error
    popd
)

if not exist "%FRONTEND_DIR%\node_modules" (
    echo Installing frontend dependencies...
    pushd "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 goto :error
    popd
)

echo Starting backend server...
start "CyberSim Backend" cmd /k "cd /d "%BACKEND_DIR%" && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Seeding labs...
curl -s -X POST http://localhost:5050/api/labs/seed >nul 2>&1
if errorlevel 1 (
    powershell -NoProfile -Command "try { Invoke-RestMethod -Method Post -Uri 'http://localhost:5050/api/labs/seed' | Out-Null } catch { exit 1 }" >nul 2>&1
)

echo Starting frontend server...
start "CyberSim Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo CyberSim is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5050
echo.
echo Close the opened terminal windows to stop the servers.
goto :eof

:error
echo Failed to install dependencies or start the project.
exit /b 1
