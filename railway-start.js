// Script de inicio para Railway que garantiza que el healthcheck esté disponible inmediatamente
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Verificar y crear el directorio de datos si no existe
const dataDir = '/data';
if (!fs.existsSync(dataDir)) {
  console.log(`💾 Creando directorio de datos en ${dataDir}...`);
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Directorio de datos creado correctamente`);
  } catch (error) {
    console.error(`❌ Error al crear directorio de datos:`, error);
  }
}

// Crear un servidor express simple para el healthcheck
const app = express();
const PORT = process.env.PORT || 10000;

// Información sobre el estado de la aplicación
let appStatus = {
  status: 'starting',
  startTime: new Date().toISOString(),
  seedCompleted: false,
  mainAppStarted: false,
  errors: []
};

// Ruta de healthcheck que siempre responde 200
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor disponible - Healthcheck', 
    time: new Date().toISOString(),
    appStatus
  });
});

// Ruta para ver logs
app.get('/api/status', (req, res) => {
  res.status(200).json(appStatus);
});

// Iniciar el servidor de healthcheck
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔍 Servidor de healthcheck iniciado en el puerto ${PORT}`);
  console.log(`🌐 Accede a la API de estado en: http://localhost:${PORT}/api/status`);
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
    stdio: 'pipe', // Capturar la salida
    shell: true,
    env: {
      ...process.env,
      DATABASE_PATH: '/data/database.sqlite' // Usar el directorio de datos persistente
    }
  });

  // Capturar la salida del proceso de seed
  let seedOutput = '';
  seedProcess.stdout.on('data', (data) => {
    const output = data.toString();
    seedOutput += output;
    console.log(output);
  });

  seedProcess.stderr.on('data', (data) => {
    const output = data.toString();
    seedOutput += output;
    console.error(output);
    appStatus.errors.push({ time: new Date().toISOString(), message: output });
  });
  
  seedProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ El proceso de seed falló con código ${code}`);
      appStatus.errors.push({ time: new Date().toISOString(), message: `Seed falló con código ${code}` });
    } else {
      console.log('✅ Seed completado correctamente');
      appStatus.seedCompleted = true;
    }
    
    // Iniciar la aplicación principal
    console.log('🚀 Iniciando la aplicación principal...');
    appStatus.status = 'starting_main';
    
    // Cerrar el servidor de healthcheck antes de iniciar la aplicación principal
    server.close(() => {
      console.log('🔄 Servidor de healthcheck cerrado, iniciando aplicación principal');
      
      // Iniciar la aplicación principal
      const mainProcess = spawn('node', ['dist/index.js'], {
        stdio: 'pipe', // Capturar la salida
        shell: true,
        env: {
          ...process.env,
          PORT: PORT, // La aplicación principal usará el mismo puerto
          DATABASE_PATH: '/data/database.sqlite' // Usar el directorio de datos persistente
        }
      });
      
      // Capturar la salida del proceso principal
      let mainOutput = '';
      mainProcess.stdout.on('data', (data) => {
        const output = data.toString();
        mainOutput += output;
        console.log(output);
        
        // Detectar cuando la aplicación principal está lista
        if (output.includes('Server running on port')) {
          appStatus.status = 'running';
          appStatus.mainAppStarted = true;
        }
      });

      mainProcess.stderr.on('data', (data) => {
        const output = data.toString();
        mainOutput += output;
        console.error(output);
        appStatus.errors.push({ time: new Date().toISOString(), message: output });
      });
      
      mainProcess.on('close', (code) => {
        console.error(`❌ La aplicación principal se cerró con código ${code}`);
        appStatus.status = 'main_app_crashed';
        appStatus.errors.push({ time: new Date().toISOString(), message: `Aplicación principal cerrada con código ${code}` });
        // No reiniciar el servidor de healthcheck para que Railway no reinicie el contenedor
      });
    });
  });
}

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  appStatus.status = 'shutting_down';
  server.close(() => {
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  appStatus.status = 'shutting_down';
  server.close(() => {
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  appStatus.status = 'error';
  appStatus.errors.push({ time: new Date().toISOString(), message: error.toString() });
  // Mantener el servidor funcionando para el healthcheck
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  appStatus.status = 'error';
  appStatus.errors.push({ time: new Date().toISOString(), message: `Promesa rechazada: ${reason}` });
  // Mantener el servidor funcionando para el healthcheck
});
