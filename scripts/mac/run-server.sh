#!/bin/bash
# Inicia el servidor para macOS
echo "Iniciando servidor de DIAN Facturación Electrónica..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"
npm run dev

read -p "Presione Enter para continuar..."
