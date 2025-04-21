@echo off
echo Iniciando servidor de DIAN Facturacion Electronica...
cd /d %~dp0
call npm run dev
pause
