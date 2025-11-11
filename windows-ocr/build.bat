@echo off
REM Build script for WindowsOCR

echo Building WindowsOCR...
dotnet restore
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet build -c Release
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Build completed successfully!
echo Output: bin\Release\net8.0-windows10.0.22621.0\WindowsOCR.exe
