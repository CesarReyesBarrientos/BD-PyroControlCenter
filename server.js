// server.js
require('dotenv').config(); 

const app = require('./src/app');
const { testConnection, getDatabaseInfo, pool } = require('./src/config/database');
const inventoryMonitor = require('./src/services/inventoryMonitorService');

const PORT = process.env.PORT || 3000;

async function initializeDatabase() {
  console.log('🚀 Initializing server...\n');
  const isConnected = await testConnection();

  if (isConnected) {
    try {
      const dbInfo = await getDatabaseInfo();
      console.log('📋 Database Information:');
      console.log(`   - MySQL Version: ${dbInfo.version}`);
      console.log(`   - Current Database: ${dbInfo.currentDb}`);
      if (dbInfo.tables.length > 0) {
        console.log('   - Available Tables:', dbInfo.tables.join(', '));
      }
    } catch (error) {
      console.error('❌ Could not fetch database info:', error.message);
    }
  } else {
    console.warn('\n⚠️  Server will run without a database connection.');
  }
  console.log('='.repeat(50));
}

async function startServer() {
  await initializeDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`   - Health check: http://localhost:${PORT}/health`);
    console.log(`   - DB Test:      http://localhost:${PORT}/api/db-test`);
  });

  // BEST PRACTICE: Implement graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      pool.end(err => {
        if (err) {
          console.error('❌ Error closing database pool:', err.message);
        } else {
          console.log('✅ Database pool closed.');
        }
        process.exit(err ? 1 : 0);
      });
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));


}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(error => {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  });
}