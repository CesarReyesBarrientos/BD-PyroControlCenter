// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool, testConnection, getDatabaseInfo, dbConfig } = require('./database');
require('dotenv').config();

// Crear instancia de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globales
app.use(helmet()); // Seguridad básica
app.use(cors()); // Permitir CORS
app.use(morgan('combined')); // Logging de requests
app.use(express.json()); // Parsear JSON
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded

// Servir archivos estáticos
app.use(express.static('public'));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor Node.js funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'success',
    database: {
      host: dbConfig.host,
      database: dbConfig.database,
      status: 'Revisar /api/db-test para verificar conexión'
    }
  });
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar conexión a base de datos
app.get('/api/db-test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT NOW() as `current_time`, VERSION() as `mysql_version`');
    connection.release();
    
    res.json({
      status: 'success',
      message: 'Conexión a base de datos exitosa',
      data: {
        current_time: rows[0].current_time,
        mysql_version: rows[0].mysql_version,
        database: dbConfig.database,
        host: dbConfig.host
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error.message,
      config: {
        host: dbConfig.host,
        database: dbConfig.database,
        user: dbConfig.user
      }
    });
  }
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  console.log('🚀 Iniciando servidor...\n');
  
  // Probar conexión a la base de datos
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('');
    try {
      const dbInfo = await getDatabaseInfo();
      console.log('\n📋 Información de la base de datos:');
      console.log(`🔧 Versión MySQL: ${dbInfo.version}`);
      console.log(`🗂️  Base de datos actual: ${dbInfo.currentDb}`);
      console.log(`📊 Número de tablas: ${dbInfo.tablesCount}`);
      
      if (dbInfo.tablesCount > 0) {
        console.log('📋 Tablas disponibles:');
        dbInfo.tables.forEach((table, index) => {
          console.log(`   ${index + 1}. ${table}`);
        });
      }
    } catch (error) {
      console.error('❌ Error al obtener información de la base de datos:', error.message);
    }
    console.log('\n' + '='.repeat(50));
  } else {
    console.log('\n⚠️  El servidor continuará ejecutándose sin conexión a la base de datos');
    console.log('='.repeat(50));
  }
}

// Iniciar servidor
async function startServer() {
  // Inicializar base de datos
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  Test DB: http://localhost:${PORT}/api/db-test`);
    // console.log('='.repeat(50));
  });
}

// Ejecutar servidor
startServer().catch(error => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});

module.exports = app;