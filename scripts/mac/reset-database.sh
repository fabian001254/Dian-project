#!/bin/bash
# Reinicia la base de datos para macOS
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Reiniciando la base de datos del sistema DIAN Facturación Electrónica..."
cd "$PROJECT_DIR"

echo "Eliminando base de datos actual..."
if [ -f database.sqlite ]; then
  rm database.sqlite
fi

echo "Iniciando servidor para recrear la base de datos..."
echo "El servidor se reiniciará automáticamente."
echo "Por favor espere..."

npm run dev

read -p "Presione Enter para continuar..."
