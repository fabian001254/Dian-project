@echo off
REM Script para iniciar backend y frontend del sistema DIAN

echo Inicializando la base de datos con datos de ejemplo...
call npx ts-node src/ensure-data.ts

IF %ERRORLEVEL% NEQ 0 (
    echo Error al inicializar la base de datos. Revise los mensajes de error.
    pause
    exit /b %ERRORLEVEL%
)

echo Base de datos inicializada correctamente.

REM Iniciar backend
start "DIAN Backend" cmd /k "cd /d %~dp0 && npm run dev"

REM Iniciar frontend
start "DIAN Frontend" cmd /k "cd /d %~dp0\frontend && npm start"

echo Backend y frontend iniciados en terminales separadas.
echo El sistema DIAN Facturacion Electronica esta listo para usar.
echo Credenciales de administrador: admin@sistema.com / admin123
pause
