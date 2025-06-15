// database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pyrocontrolcenter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // acquireTimeout: 60000,
  // timeout: 60000,
  // reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión con más información
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔗 Intentando conectar a la base de datos...');
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗄️  Base de datos: ${dbConfig.database}`);
    console.log(`👤 Usuario: ${dbConfig.user}`);
    
    // Ejecutar una consulta simple para verificar la conexión
   // const [rows] = await connection.execute('SELECT 1 + 1 AS result, NOW() as current_time');
   const [rows] = await connection.execute('SELECT 1 + 1 AS result');
 

    console.log('✅ ¡Conexión exitosa a la base de datos MySQL!');
    console.log(`🎯 Resultado de prueba: ${rows[0].result}`);
  //  console.log(`⏰ Hora actual: ${rows[0].current_time}`);
    console.log('📊 Estado de la conexión: ACTIVA');
    
    // Obtener información adicional
   const [versionResult] = await connection.execute('SELECT VERSION() AS version');
    const [tablesResult] = await connection.execute('SHOW TABLES');
    
    console.log('📋 Información de la base de datos:');
    console.log(`🔧 Versión MySQL: ${versionResult[0].version}`);
    console.log(`📊 Número de tablas: ${tablesResult.length}`);
    
    if (tablesResult.length > 0) {
      console.log('📋 Tablas disponibles:');
      tablesResult.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    
    connection.release();
    console.log('='.repeat(60));
    
    return true;
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error(`🔴 Código de error: ${err.code}`);
    console.error(`📝 Mensaje: ${err.message}`);
    console.error('💡 Verifica que:');
    console.error(`   - El servidor MySQL esté ejecutándose en puerto ${dbConfig.port}`);
    console.error(`   - La base de datos "${dbConfig.database}" exista`);
    console.error('   - Las credenciales sean correctas');
    console.error('='.repeat(60));
    
    return false;
  }
}

// Función para obtener información de la base de datos
async function getDatabaseInfo() {
  try {
    const connection = await pool.getConnection();
    
    // Obtener versión de MySQL
    const [versionResult] = await connection.execute('SELECT VERSION() AS version');
    
    // Obtener lista de tablas
    const [tablesResult] = await connection.execute('SHOW TABLES');
    
    // Obtener información de la base de datos actual
    const [dbResult] = await connection.execute('SELECT DATABASE() AS current_db');
    
    const info = {
      version: versionResult[0].version,
      currentDb: dbResult[0].current_db,
      tablesCount: tablesResult.length,
      tables: tablesResult.map(table => Object.values(table)[0])
    };
    
    connection.release();
    return info;
  } catch (error) {
    console.error('❌ Error al obtener información de la base de datos:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  getDatabaseInfo,
  dbConfig
};