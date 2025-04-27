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
const PORT = parseInt(process.env.PORT ?? '3000', 10);

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

// API routes
app.use('/api', apiRoutes);

// Serve React app for any other route
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Database connection and server start
const startServer = async () => {
  try {
    // Check if database exists
    const dbPath = path.join(__dirname, '../database.sqlite');
    const dbExists = fs.existsSync(dbPath);

    // Connect to database
    await AppDataSource.initialize();
    console.log('📦 Database connected successfully');

    // Seed database if it's a new installation
    if (!dbExists) {
      console.log('🔍 Nueva instalación detectada. Inicializando base de datos...');
      await seedDatabase();
    }

    // Start server
    // Escuchar en todas las interfaces, importante para entornos Docker/Render
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
      console.log(`📝 DIAN Facturación Electrónica - Sistema Educativo`);
      console.log(`🌐 Accede a la aplicación en: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

startServer();
