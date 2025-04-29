import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { AppDataSource } from './config/database';
import apiRoutes from './api/routes';
import { seedDatabase } from './config/seed';
import * as fs from 'fs';
import { generateApiDocsHtml, generateApiStatusHtml } from './api-docs';

// Initialize express app
const app = express();
// Render asigna PORT=10000 por defecto, pero usamos el valor de la variable de entorno
const PORT = parseInt(process.env.PORT || '10000', 10);

// Logging de peticiones HTTP
app.use(morgan('dev'));

// Configuración de CORS para permitir conexiones desde cualquier origen
app.use(cors({
  origin: '*', // Permitir cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Manejar preflight requests
app.options('*', cors());

// Middleware para mostrar cuerpo de petición en dev
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`Incoming ${req.method} ${req.url}`, req.body);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
// Primero intentamos servir desde el directorio build (producción)
const buildPath = path.join(__dirname, '../frontend/build');
const publicPath = path.join(__dirname, '../frontend/public');
const rootBuildPath = path.join(process.cwd(), 'frontend/build');
const rootPublicPath = path.join(process.cwd(), 'frontend/public');

console.log('\n📂 Verificando rutas de archivos estáticos:');
console.log(`- __dirname: ${__dirname}`);
console.log(`- process.cwd(): ${process.cwd()}`);
console.log(`- buildPath: ${buildPath} (existe: ${fs.existsSync(buildPath)})`);
console.log(`- publicPath: ${publicPath} (existe: ${fs.existsSync(publicPath)})`);
console.log(`- rootBuildPath: ${rootBuildPath} (existe: ${fs.existsSync(rootBuildPath)})`);
console.log(`- rootPublicPath: ${rootPublicPath} (existe: ${fs.existsSync(rootPublicPath)})`);

// Intentar todas las posibles ubicaciones de archivos estáticos
const staticPaths = [buildPath, publicPath, rootBuildPath, rootPublicPath];
let staticPathFound = false;

for (const staticPath of staticPaths) {
  if (fs.existsSync(staticPath)) {
    console.log(`📁 Sirviendo archivos estáticos desde: ${staticPath}`);
    app.use(express.static(staticPath));
    staticPathFound = true;
    
    // Verificar si existe index.html
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`✅ index.html encontrado en: ${staticPath}`);
    } else {
      console.warn(`⚠️ index.html NO encontrado en: ${staticPath}`);
    }
    
    // Mostrar contenido del directorio
    try {
      const files = fs.readdirSync(staticPath);
      console.log(`Contenido de ${staticPath}:`, files);
    } catch (error) {
      console.error(`Error al leer el directorio ${staticPath}:`, error);
    }
  }
}

if (!staticPathFound) {
  console.warn('⚠️ No se encontró ningún directorio de archivos estáticos');
  
  // Crear un directorio estático básico con un index.html
  const fallbackDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  
  const fallbackIndexPath = path.join(fallbackDir, 'index.html');
  fs.writeFileSync(fallbackIndexPath, `
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
  
  console.log(`✅ Creado index.html básico en: ${fallbackDir}`);
  app.use(express.static(fallbackDir));
}

// Ruta de healthcheck para Railway - DEBE ESTAR DISPONIBLE INMEDIATAMENTE
// Esta ruta debe responder antes de que se inicialice la base de datos
app.get('/api/health', (_req, res) => {
  // Siempre responder con 200 para que el healthcheck pase
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor disponible', 
    time: new Date().toISOString() 
  });
});

// Ruta para la documentación de la API
app.get('/api-docs', (_req, res) => {
  res.send(generateApiDocsHtml());
});

// Ruta para el estado del servidor
app.get('/api-status', (_req, res) => {
  res.send(generateApiStatusHtml());
});

// API routes
app.use('/api', apiRoutes);

// Serve React app for any other route
app.get('*', (_req, res) => {
  // Intentar servir index.html desde todas las posibles ubicaciones
  const possibleIndexPaths = [
    path.join(__dirname, '../frontend/build/index.html'),
    path.join(__dirname, '../frontend/public/index.html'),
    path.join(process.cwd(), 'frontend/build/index.html'),
    path.join(process.cwd(), 'frontend/public/index.html'),
    path.join(process.cwd(), 'public/index.html')
  ];
  
  console.log('\n🔍 Buscando index.html para servir la aplicación React:');
  
  for (const indexPath of possibleIndexPaths) {
    console.log(`- Verificando: ${indexPath} (existe: ${fs.existsSync(indexPath)})`);
    if (fs.existsSync(indexPath)) {
      console.log(`✅ Sirviendo index.html desde: ${indexPath}`);
      return res.sendFile(indexPath);
    }
  }
  
  // Si no se encuentra ninguna ubicación, crear una respuesta HTML básica
  console.log('⚠️ No se encontró ningún index.html, enviando respuesta HTML básica');
  res.send(`
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
          <p>Rutas disponibles:</p>
          <ul>
            <li><a href="/api/health">/api/health</a> - Estado del servidor</li>
            <li><a href="/api/auth/login">/api/auth/login</a> - Autenticación</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to database
    await AppDataSource.initialize();
    console.log('💶 Database connected successfully');

    // Iniciar el servidor DESPUÉS de conectar a la base de datos - FORMA SIMPLIFICADA PARA RENDER
    console.log(`Intentando iniciar servidor en el puerto ${PORT}`);
    
    // Usar la forma más simple posible de app.listen para Render
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 DIAN Facturación Electrónica - Sistema Educativo`);
      console.log(`🌐 Accede a la aplicación en: http://localhost:${PORT}`);
      console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
    });
    
    // Configurar timeouts para mantener conexiones vivas (recomendado por Render)
    server.keepAliveTimeout = 120 * 1000;
    server.headersTimeout = 120 * 1000;

    // Verificar si la base de datos ya existe
    // Nota: En Render, esto puede no funcionar como se espera ya que el sistema de archivos
    // puede ser efímero. La lógica principal de inicialización debe estar en ensure-data.ts
    const dbPath = path.join(__dirname, '../database.sqlite');
    const dbExists = fs.existsSync(dbPath);
    if (!dbExists) {
      console.log('🔍 Nueva instalación detectada. Inicializando base de datos...');
      await seedDatabase();
    }

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1); // Salir con código de error para que Render pueda reiniciar el servicio
  }
};

startServer();
