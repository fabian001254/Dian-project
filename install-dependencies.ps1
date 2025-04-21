Write-Host "Instalando dependencias del proyecto..." -ForegroundColor Cyan

# Crear directorio para almacenar facturas
New-Item -ItemType Directory -Force -Path "storage/invoices/xml"
New-Item -ItemType Directory -Force -Path "storage/invoices/pdf"

# Instalar dependencias de Node.js
Write-Host "Instalando dependencias de Node.js..." -ForegroundColor Yellow
npm install

# Crear directorio public para el frontend
New-Item -ItemType Directory -Force -Path "public"

Write-Host "Dependencias instaladas correctamente!" -ForegroundColor Green
Write-Host "Para iniciar la aplicación, ejecuta: npm run dev" -ForegroundColor Cyan
