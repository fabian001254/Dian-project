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

// Configuración de CORS para desarrollo
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));

// Middleware para mostrar cuerpo de petición en dev
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`Incoming ${req.method} ${req.url}`, req.body);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

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
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
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
