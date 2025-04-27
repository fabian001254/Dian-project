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
        // Mostrar contenido del directorio frontend para depuración
        console.log('Contenido del directorio frontend:');
        const frontendFiles = fs.readdirSync(FRONTEND_DIR);
        console.log(frontendFiles);
        
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
          console.log(`Directorio build: ${FRONTEND_BUILD_DIR}`);
          console.log(`Directorio public: ${FRONTEND_PUBLIC_DIR}`);
          
          // Mostrar contenido del directorio build para depuración
          console.log('Contenido del directorio build:');
          const buildFiles = fs.readdirSync(FRONTEND_BUILD_DIR);
          console.log(buildFiles);
          
          // Crear el directorio public si no existe
          if (!fs.existsSync(FRONTEND_PUBLIC_DIR)) {
            fs.mkdirSync(FRONTEND_PUBLIC_DIR, { recursive: true });
          }
          
          // Copiar archivos del build al directorio public
          copyDir(FRONTEND_BUILD_DIR, FRONTEND_PUBLIC_DIR);
          
          // Verificar que los archivos se copiaron correctamente
          console.log('Contenido del directorio public después de copiar:');
          const publicFiles = fs.readdirSync(FRONTEND_PUBLIC_DIR);
          console.log(publicFiles);
          
          console.log('✅ Archivos del frontend copiados correctamente');
        } else {
          console.log('⚠️ No se encontró el directorio de build del frontend');
          
          // Intentar crear el directorio build y copiar directamente desde src
          console.log('Intentando alternativa: copiar desde src/...');
          const frontendSrcDir = path.join(FRONTEND_DIR, 'src');
          
          if (fs.existsSync(frontendSrcDir)) {
            // Crear el directorio public si no existe
            if (!fs.existsSync(FRONTEND_PUBLIC_DIR)) {
              fs.mkdirSync(FRONTEND_PUBLIC_DIR, { recursive: true });
            }
            
            // Crear un index.html básico si no existe
            const publicIndexPath = path.join(FRONTEND_PUBLIC_DIR, 'index.html');
            if (!fs.existsSync(publicIndexPath)) {
              fs.writeFileSync(publicIndexPath, `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>DIAN Facturación Electrónica</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    h1 { color: #2c3e50; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .message { background: #f8f9fa; padding: 20px; border-radius: 5px; }
                    .api-link { margin-top: 20px; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Sistema de Facturación Electrónica DIAN</h1>
                    <div class="message">
                      <p>El backend está funcionando correctamente.</p>
                      <p>La interfaz de usuario completa no está disponible en este momento.</p>
                    </div>
                    <div class="api-link">
                      <p>Puedes acceder a la API en: <a href="/api/health">/api/health</a></p>
                    </div>
                  </div>
                </body>
                </html>
              `);
              console.log('✅ Creado index.html básico en el directorio public');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error compilando el frontend:', error);
        
        // Plan de contingencia: crear un index.html básico
        console.log('Creando página de contingencia...');
        if (!fs.existsSync(FRONTEND_PUBLIC_DIR)) {
          fs.mkdirSync(FRONTEND_PUBLIC_DIR, { recursive: true });
        }
        
        const publicIndexPath = path.join(FRONTEND_PUBLIC_DIR, 'index.html');
        fs.writeFileSync(publicIndexPath, `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DIAN Facturación Electrónica</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              h1 { color: #2c3e50; }
              .container { max-width: 800px; margin: 0 auto; }
              .message { background: #f8f9fa; padding: 20px; border-radius: 5px; }
              .api-link { margin-top: 20px; }
              a { color: #3498db; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Sistema de Facturación Electrónica DIAN</h1>
              <div class="message">
                <p>El backend está funcionando correctamente.</p>
                <p>La interfaz de usuario completa no está disponible en este momento.</p>
                <p>Error: ${error.message}</p>
              </div>
              <div class="api-link">
                <p>Puedes acceder a la API en: <a href="/api/health">/api/health</a></p>
              </div>
            </div>
          </body>
          </html>
        `);
        console.log('✅ Creado index.html de contingencia en el directorio public');
      }
    } else {
      console.log('⚠️ No se encontró el directorio frontend, creando página estática básica...');
      
      // Crear el directorio public si no existe
      if (!fs.existsSync(FRONTEND_PUBLIC_DIR)) {
        fs.mkdirSync(FRONTEND_PUBLIC_DIR, { recursive: true });
      }
      
      // Crear un index.html básico
      const publicIndexPath = path.join(FRONTEND_PUBLIC_DIR, 'index.html');
      fs.writeFileSync(publicIndexPath, `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DIAN Facturación Electrónica</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h1 { color: #2c3e50; }
            .container { max-width: 800px; margin: 0 auto; }
            .message { background: #f8f9fa; padding: 20px; border-radius: 5px; }
            .api-link { margin-top: 20px; }
            a { color: #3498db; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sistema de Facturación Electrónica DIAN</h1>
            <div class="message">
              <p>El backend está funcionando correctamente.</p>
              <p>La interfaz de usuario completa no está disponible en este momento.</p>
            </div>
            <div class="api-link">
              <p>Puedes acceder a la API en: <a href="/api/health">/api/health</a></p>
            </div>
          </div>
        </body>
        </html>
      `);
      console.log('✅ Creado index.html básico en el directorio public');
    }
    
    // 4. Ejecutar el seed de la base de datos
    console.log('🌱 Ejecutando seed de la base de datos...');
    try {
      require('./dist/ensure-data');
      console.log('✅ Seed completado correctamente');
    } catch (error) {
      console.error('❌ Error durante el seed:', error);
    }
    
    // 5. Verificar una última vez que los archivos estáticos estén disponibles
    const frontendBuildDir = path.join(__dirname, 'frontend/build');
    const frontendPublicDir = path.join(__dirname, 'frontend/public');
    const distDir = path.join(__dirname, 'dist');
    
    console.log('\n📂 Verificando directorios antes de iniciar el servidor principal:');
    console.log(`- __dirname: ${__dirname}`);
    console.log(`- frontend/build existe: ${fs.existsSync(frontendBuildDir)}`);
    console.log(`- frontend/public existe: ${fs.existsSync(frontendPublicDir)}`);
    console.log(`- dist existe: ${fs.existsSync(distDir)}`);
    
    if (fs.existsSync(frontendBuildDir)) {
      console.log('Contenido de frontend/build:');
      console.log(fs.readdirSync(frontendBuildDir));
      
      // Asegurarse de que el index.html exista en el directorio build
      const indexPath = path.join(frontendBuildDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('✅ index.html encontrado en frontend/build');
      } else {
        console.log('⚠️ index.html NO encontrado en frontend/build');
      }
    }
    
    if (fs.existsSync(frontendPublicDir)) {
      console.log('Contenido de frontend/public:');
      console.log(fs.readdirSync(frontendPublicDir));
      
      // Asegurarse de que el index.html exista en el directorio public
      const indexPath = path.join(frontendPublicDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('✅ index.html encontrado en frontend/public');
      } else {
        console.log('⚠️ index.html NO encontrado en frontend/public');
      }
    }
    
    // 6. Iniciar el servidor principal
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
