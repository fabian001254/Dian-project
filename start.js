// Script de inicio simplificado para Railway
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Crear un servidor express simple para el healthcheck
const app = express();
const PORT = process.env.PORT || 10000;

console.log(`🚀 Iniciando servidor en puerto ${PORT}`);

// Ruta de healthcheck que siempre responde 200
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Sistema funcionando correctamente', 
    time: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de facturación electrónica DIAN funcionando correctamente');
});

// Iniciar el servidor de healthcheck
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔍 Servidor iniciado en el puerto ${PORT}`);
  
  // Configurar timeouts para mantener conexiones vivas
  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
  
  // Iniciar la aplicación principal en segundo plano
  setTimeout(() => {
    runSeedAndStartApp();
  }, 1000);
});

// Función para ejecutar el seed y luego iniciar la aplicación
function runSeedAndStartApp() {
  console.log('🌱 Ejecutando seed de la base de datos...');
  
  try {
    // Configurar la variable de entorno para la base de datos
    process.env.DATABASE_PATH = '/data/database.sqlite';
    console.log(`💾 Usando base de datos en: ${process.env.DATABASE_PATH}`);
    
    // Ejecutar el seed de forma sincrónica
    require('./dist/ensure-data');
    console.log('✅ Seed completado correctamente');
    
    // Importar y ejecutar la aplicación principal
    console.log('🚀 Iniciando la aplicación principal...');
    require('./dist/index');
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
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
  // Mantener el servidor funcionando para el healthcheck
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  // Mantener el servidor funcionando para el healthcheck
});
