#!/bin/bash
# Script para iniciar backend y frontend del sistema DIAN Facturación Electrónica en macOS
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Directorio raíz del proyecto (dos niveles arriba de scripts/mac)
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Inicializar la base de datos con datos de ejemplo
echo "Inicializando la base de datos con datos de ejemplo..."
npx ts-node src/ensure-data.ts

if [ $? -ne 0 ]; then
  echo "Error al inicializar la base de datos. Revise los mensajes de error."
  read -p "Presione Enter para salir..."
  exit 1
fi

echo "Base de datos inicializada correctamente."

# Detener procesos antiguos en puertos 3000 y 3001
echo "Deteniendo procesos en puerto 3000 y 3001..."
lsof -ti tcp:3000 | xargs -r kill -9
lsof -ti tcp:3001 | xargs -r kill -9
echo "Procesos detenidos."

# Iniciar backend y frontend en Terminal
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd \"$PROJECT_DIR\" && npm run dev"
    do script "cd \"$PROJECT_DIR/frontend\" && export PORT=3001 && npm start"
end tell
EOF

echo "Backend y frontend iniciados en Terminal en pestañas separadas."
echo "El sistema DIAN Facturación Electrónica está listo para usar."
echo "Credenciales de administrador: admin@sistema.com / admin123"
read -p "Presione Enter para continuar..."
