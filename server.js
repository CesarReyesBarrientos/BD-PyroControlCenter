// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
    status: 'success'
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;