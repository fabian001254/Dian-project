#!/usr/bin/env bash

# Script para macOS/Linux: seeding + backend + frontend
set -e

echo "Inicializando la base de datos con datos de ejemplo..."
npm run seed

echo "Base de datos inicializada correctamente."

echo "Iniciando backend (dev)..."
npm run dev &
BACKEND_PID=$!

echo "Iniciando frontend..."
(cd frontend && npm start) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"

echo "Sistema DIAN listo."

# Esperar ambos procesos
wait $BACKEND_PID $FRONTEND_PID
