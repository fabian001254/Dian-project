@echo off
echo Iniciando servidor de DIAN Facturacion Electronica...
cd /d %~dp0
cmd /k npm run dev
