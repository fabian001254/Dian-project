// Script para desarrollo local que inicia el backend y el frontend
const { spawn } = require('child_process');
const path = require('path');

// Configuración
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// Establecer variables de entorno
process.env.PORT = BACKEND_PORT;

console.log('🚀 Iniciando entorno de desarrollo local...');

// Función para iniciar el backend
function startBackend() {
  console.log('🔄 Iniciando el backend en el puerto', BACKEND_PORT);
  
  const backend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: BACKEND_PORT }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Error al iniciar el backend:', error);
  });
  
  return backend;
}

// Función para iniciar el frontend
function startFrontend() {
  console.log('🔄 Iniciando el frontend en el puerto', FRONTEND_PORT);
  
  const frontend = spawn('npm', ['start'], {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
    env: { ...process.env, PORT: FRONTEND_PORT }
  });
  
  frontend.on('error', (error) => {
    console.error('❌ Error al iniciar el frontend:', error);
  });
  
  return frontend;
}

// Iniciar ambos servicios
const backendProcess = startBackend();
const frontendProcess = startFrontend();

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('👋 Cerrando procesos...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Cerrando procesos...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(1);
});
