#!/bin/bash
# Instala dependencias de backend y frontend en macOS
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Instalando dependencias del backend..."
cd "$PROJECT_DIR"
npm install

if [ $? -ne 0 ]; then
  echo "Error instalando dependencias del backend"
  exit 1
fi

echo "Instalando dependencias del frontend..."
cd "$PROJECT_DIR/frontend"
npm install

if [ $? -ne 0 ]; then
  echo "Error instalando dependencias del frontend"
  exit 1
fi

echo "Dependencias instaladas correctamente."
