// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
  connectTimeout: 10000,
};

// Create and export the connection pool
const pool = mysql.createPool(dbConfig);

// Function to test the database connection
async function testConnection() {
  let connection;
  try {
    console.log('🔗 Attempting to connect to the database...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await pool.getConnection();
    const [versionResult] = await connection.execute('SELECT VERSION() AS version');
    
    console.log('✅ Database connection successful!');
    console.log(`   MySQL Version: ${versionResult[0].version}`);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(`   - Code: ${error.code}`);
    console.error(`   - Message: ${error.message}`);
    console.error('💡 Please verify your .env file and ensure the database is running.');
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// Function to get database information (used by the startup script)
async function getDatabaseInfo() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [versionResult] = await connection.execute('SELECT VERSION() AS version');
    const [dbResult] = await connection.execute('SELECT DATABASE() AS current_db');
    const [tablesResult] = await connection.execute('SHOW TABLES');

    return {
      version: versionResult[0].version,
      currentDb: dbResult[0].current_db,
      tablesCount: tablesResult.length,
      tables: tablesResult.map(table => Object.values(table)[0]),
    };
  } catch (error) {
    console.error('❌ Error fetching database information:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  getDatabaseInfo,
  dbConfig, // Exported for display purposes, but not used for connection
};