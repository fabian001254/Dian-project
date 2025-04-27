import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { AppDataSource } from './config/database';
import apiRoutes from './api/routes';
import { seedDatabase } from './config/seed';
import * as fs from 'fs';

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

// Verificar qué directorio existe y usarlo
if (fs.existsSync(buildPath)) {
  console.log(`📁 Sirviendo archivos estáticos desde: ${buildPath}`);
  app.use(express.static(buildPath));
} else if (fs.existsSync(publicPath)) {
  console.log(`📁 Sirviendo archivos estáticos desde: ${publicPath}`);
  app.use(express.static(publicPath));
} else {
  console.warn('⚠️ No se encontró ningún directorio de archivos estáticos');
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

// API routes
app.use('/api', apiRoutes);

// Serve React app for any other route
app.get('*', (_req, res) => {
  // Intentar servir index.html desde el directorio build o public
  const buildIndexPath = path.join(__dirname, '../frontend/build/index.html');
  const publicIndexPath = path.join(__dirname, '../frontend/public/index.html');
  
  if (fs.existsSync(buildIndexPath)) {
    res.sendFile(buildIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.status(404).send('No se encontró la aplicación frontend');
  }
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
