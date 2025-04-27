// Script para compilar el frontend y luego iniciar el servidor
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Configuración
const PORT = process.env.PORT || 10000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const FRONTEND_BUILD_DIR = path.join(FRONTEND_DIR, 'build');
const FRONTEND_PUBLIC_DIR = path.join(__dirname, 'frontend/public');

// Log de rutas para depuración
console.log('Rutas de directorios:');
console.log(`- FRONTEND_DIR: ${FRONTEND_DIR}`);
console.log(`- FRONTEND_BUILD_DIR: ${FRONTEND_BUILD_DIR}`);
console.log(`- FRONTEND_PUBLIC_DIR: ${FRONTEND_PUBLIC_DIR}`);

// Crear un servidor express simple para el healthcheck mientras compilamos
const app = express();

// Ruta de healthcheck que siempre responde 200
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor iniciándose...', 
    time: new Date().toISOString()
  });
});

// Iniciar el servidor de healthcheck
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor temporal iniciado en puerto ${PORT}`);
  console.log('⏳ Preparando aplicación completa...');
  
  // Configurar timeouts para mantener conexiones vivas
  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
  
  // Iniciar el proceso de compilación y arranque
  buildAndStart();
});

// Función principal
async function buildAndStart() {
  try {
    // Configurar la variable de entorno para la base de datos
    process.env.DATABASE_PATH = '/data/database.sqlite';
    console.log(`💾 Usando base de datos en: ${process.env.DATABASE_PATH}`);
    
    // Asegurarnos de que la aplicación principal use el mismo puerto
    const mainPort = process.env.PORT || 10000;
    process.env.PORT = mainPort;
    
    // 1. Verificar si existe el directorio frontend
    if (fs.existsSync(FRONTEND_DIR)) {
      console.log('🔍 Frontend encontrado, compilando...');
      
      try {
        // 2. Compilar el frontend
        console.log('🔨 Compilando el frontend...');
        execSync('npm run build', { 
          cwd: FRONTEND_DIR,
          stdio: 'inherit'
        });
        console.log('✅ Frontend compilado correctamente');
        
        // 3. Verificar si existe el directorio de build
        if (fs.existsSync(FRONTEND_BUILD_DIR)) {
          console.log('📦 Copiando archivos del frontend al directorio public...');
          
          // Crear el directorio public si no existe
          if (!fs.existsSync(FRONTEND_PUBLIC_DIR)) {
            fs.mkdirSync(FRONTEND_PUBLIC_DIR, { recursive: true });
          }
          
          // Copiar archivos del build al directorio public
          copyDir(FRONTEND_BUILD_DIR, FRONTEND_PUBLIC_DIR);
          console.log('✅ Archivos del frontend copiados correctamente');
        } else {
          console.log('⚠️ No se encontró el directorio de build del frontend');
        }
      } catch (error) {
        console.error('❌ Error compilando el frontend:', error);
      }
    } else {
      console.log('⚠️ No se encontró el directorio frontend, continuando sin compilar');
    }
    
    // 4. Ejecutar el seed de la base de datos
    console.log('🌱 Ejecutando seed de la base de datos...');
    try {
      require('./dist/ensure-data');
      console.log('✅ Seed completado correctamente');
    } catch (error) {
      console.error('❌ Error durante el seed:', error);
    }
    
    // 5. Iniciar el servidor principal
    console.log('🚀 Iniciando el servidor principal...');
    server.close(() => {
      console.log('🔄 Cerrando servidor temporal para iniciar el principal');
      require('./dist/index');
    });
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Función auxiliar para copiar directorios recursivamente
function copyDir(src, dest) {
  // Crear el directorio destino si no existe
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Leer el contenido del directorio
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Copiar cada archivo/directorio
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursivamente copiar subdirectorios
      copyDir(srcPath, destPath);
    } else {
      // Copiar archivos
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
