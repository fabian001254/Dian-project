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
const PORT = process.env.PORT || 3001; // Aseguramos que sea un número más adelante

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
    // Connect to database
    await AppDataSource.initialize();
    console.log('📦 Database connected successfully');

    // ***MOVER ESTO AQUÍ: Iniciar el servidor DESPUÉS de conectar a la base de datos***
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 DIAN Facturación Electrónica - Sistema Educativo`);
      console.log(`🌐 Accede a la aplicación en: http://localhost:${PORT}`);
      console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`); // Agregado
    });

    // Seed database if it's a new installation
    const dbPath = path.join(__dirname, '../database.sqlite');
    const dbExists = fs.existsSync(dbPath);
    if (!dbExists) {
      console.log('🔍 Nueva instalación detectada. Inicializando base de datos...');
      await seedDatabase();
    }


  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

startServer();
