// Script para iniciar solo la API
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Configuración
const PORT = process.env.PORT || 10000;

// Crear un servidor express simple para el healthcheck mientras iniciamos
const app = express();

// Configurar CORS para permitir solicitudes desde el frontend externo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Ruta de healthcheck que siempre responde 200
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API iniciándose...', 
    time: new Date().toISOString()
  });
});

// Iniciar el servidor de healthcheck
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor temporal iniciado en puerto ${PORT}`);
  console.log('⏳ Preparando API...');
  
  // Configurar timeouts para mantener conexiones vivas
  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
  
  // Iniciar el proceso de arranque
  startAPI();
});

// Función principal
async function startAPI() {
  try {
    // Configurar la variable de entorno para la base de datos
    process.env.DATABASE_PATH = '/data/database.sqlite';
    console.log(`💾 Usando base de datos en: ${process.env.DATABASE_PATH}`);
    
    // Asegurarnos de que la aplicación principal use el mismo puerto
    const mainPort = process.env.PORT || 10000;
    process.env.PORT = mainPort;
    
    // 1. Ejecutar el seed de la base de datos
    console.log('🌱 Ejecutando seed de la base de datos...');
    try {
      require('./dist/ensure-data');
      console.log('✅ Seed completado correctamente');
    } catch (error) {
      console.error('❌ Error durante el seed:', error);
    }
    
    // 2. Iniciar el servidor principal
    console.log('🚀 Iniciando la API...');
    server.close(() => {
      console.log('🔄 Cerrando servidor temporal para iniciar la API');
      require('./dist/index');
    });
  } catch (error) {
    console.error('❌ Error general:', error);
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
