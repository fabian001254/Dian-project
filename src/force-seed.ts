import { AppDataSource } from './config/database';
import { seedDatabase } from './config/seed';

/**
 * Script para forzar la inicialización de la base de datos
 * con los datos de ejemplo, independientemente de si ya existe o no.
 */
const forceSeed = async () => {
  try {
    console.log('🔄 Iniciando conexión a la base de datos...');
    
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('📦 Conexión a la base de datos establecida');
    
    // Forzar la inicialización de la base de datos
    console.log('🌱 Forzando la inicialización de la base de datos con datos de ejemplo...');
    await seedDatabase();
    
    console.log('✅ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar el script
forceSeed();
