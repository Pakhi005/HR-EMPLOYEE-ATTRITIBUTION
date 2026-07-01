@echo off
echo =========================================
echo Starting HR Attrition Predictor Dashboard
echo =========================================

echo.
echo [1/2] Starting Backend API on port 8001...
start "Backend API" cmd /k "cd C:\HR-EMPLOYEE-ATTRITIBUTION && python -m uvicorn app.main:app --reload --port 8001"

echo.
echo [2/2] Starting Frontend React Server on port 5173...
start "Frontend Server" cmd /k "cd C:\HR-EMPLOYEE-ATTRITIBUTION\frontend && npm run dev"

echo.
echo Waiting a few seconds for servers to start...
timeout /t 5 /nobreak > nul

echo.
echo Opening browser...
start http://localhost:5173

echo.
echo Dashboard launched! You can safely minimize these terminal windows.
