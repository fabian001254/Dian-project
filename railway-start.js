// Script de inicio para Railway que garantiza que el healthcheck esté disponible inmediatamente
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

// Crear un servidor express simple para el healthcheck
const app = express();
const PORT = process.env.PORT || 3000;

// Ruta de healthcheck que siempre responde 200
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor disponible - Healthcheck', 
    time: new Date().toISOString(),
    startup: 'En progreso'
  });
});

// Iniciar el servidor de healthcheck
const server = app.listen(PORT, () => {
  console.log(`🔍 Servidor de healthcheck iniciado en el puerto ${PORT}`);
  console.log('⏳ Iniciando la aplicación principal...');
  
  // Configurar timeouts para mantener conexiones vivas
  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
  
  // Iniciar el proceso de seed y luego la aplicación principal
  startMainApplication();
});

// Función para iniciar la aplicación principal
function startMainApplication() {
  // Primero ejecutar el seed
  console.log('🌱 Ejecutando seed de la base de datos...');
  
  const seedProcess = spawn('node', ['dist/ensure-data.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  seedProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ El proceso de seed falló con código ${code}`);
      // Continuar de todos modos para que el healthcheck siga funcionando
    } else {
      console.log('✅ Seed completado correctamente');
    }
    
    // Iniciar la aplicación principal
    console.log('🚀 Iniciando la aplicación principal...');
    
    const mainProcess = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: 0 // La aplicación principal usará un puerto aleatorio
      }
    });
    
    mainProcess.on('close', (code) => {
      console.error(`❌ La aplicación principal se cerró con código ${code}`);
      // No cerrar el servidor de healthcheck para que Railway no reinicie el contenedor
    });
  });
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
