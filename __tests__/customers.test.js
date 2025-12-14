// tests/customers.test.js
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

// --- Conjunto de Pruebas para la API de Clientes (PyroControlCenter) ---
describe('Customers API', () => {

  // Se ejecuta ANTES DE CADA prueba. Limpia la BD para evitar datos basura.
  beforeEach(async () => {
    // Silenciamos logs de error de consola durante los tests para mantener la salida limpia
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Desactivamos chequeo de llaves foráneas para poder truncar tablas libremente
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0;');
    await pool.execute('TRUNCATE TABLE orders');
    await pool.execute('TRUNCATE TABLE customers');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1;');
  });

  // Se ejecuta AL FINALIZAR todas las pruebas.
  afterAll(async () => {
    console.error.mockRestore(); // Restauramos la consola
    await pool.end(); // Cerramos la conexión a la BD
  });

  // --- Pruebas para POST /api/customers ---
  describe('POST /api/customers', () => {
    it('debería crear un nuevo cliente con todos los datos y devolver 201', async () => {
      const newCustomer = {
        CustomerName: 'Cliente Completo',
        PhoneNumber: '4491234567', // VARCHAR(20)
        Email: 'completo@test.com', // VARCHAR(100)
        Address: 'Av. Siempre Viva 742',
      };

      const response = await request(app).post('/api/customers').send(newCustomer);

      expect(response.statusCode).toBe(201);
      // Nota: Asegúrate de que tu controlador devuelva el ID del cliente creado
      expect(response.body).toHaveProperty('customerId'); 
      expect(response.body.message).toBe('Cliente creado exitosamente.');
    });

    it('debería devolver un error 400 si falta el CustomerName', async () => {
      const invalidCustomer = { Email: 'sin_nombre@test.com' };
      const response = await request(app).post('/api/customers').send(invalidCustomer);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/requerido/i); // Busca la palabra "requerido" en el error
    });

    it('debería devolver un error 400 si falta el Email', async () => {
        const invalidCustomer = { CustomerName: 'Sin Email' };
        const response = await request(app).post('/api/customers').send(invalidCustomer);
        
        expect(response.statusCode).toBe(400);
      });
  });

  // --- Pruebas para GET /api/customers ---
  describe('GET /api/customers', () => {
    it('debería devolver un arreglo vacío si no hay clientes activos', async () => {
      const response = await request(app).get('/api/customers');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('debería devolver solo los clientes con estado = 1 (activos)', async () => {
      // Inserción manual respetando el esquema (estado TINYINT(1) DEFAULT 1)
      await pool.execute(
        "INSERT INTO customers (CustomerName, Email, estado) VALUES ('Cliente Activo', 'activo@test.com', 1)"
      );
      await pool.execute(
        "INSERT INTO customers (CustomerName, Email, estado) VALUES ('Cliente Inactivo', 'inactivo@test.com', 0)"
      );

      const response = await request(app).get('/api/customers');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      // Validamos contra el nombre de columna de la BD (PascalCase según tu SQL)
      expect(response.body[0].CustomerName).toBe('Cliente Activo');
    });
  });

  // --- Pruebas para PUT /api/customers/:id/deactivate ---
  describe('PUT /api/customers/:id/deactivate', () => {
    it('debería cambiar el estado de un cliente a 0 (soft delete) y devolver 200', async () => {
      const [result] = await pool.execute(
        "INSERT INTO customers (CustomerName, Email) VALUES ('Cliente a Desactivar', 'desactivar@test.com')"
      );
      const customerId = result.insertId;

      const response = await request(app).put(`/api/customers/${customerId}/deactivate`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Cliente desactivado correctamente.');

      // Verificación doble: consultamos la BD para asegurar que el estado es 0
      const [rows] = await pool.execute("SELECT estado FROM customers WHERE CustomerID = ?", [customerId]);
      expect(rows[0].estado).toBe(0);
    });

    it('debería devolver un error 404 si el cliente no existe', async () => {
      const response = await request(app).put('/api/customers/99999/deactivate');
      expect(response.statusCode).toBe(404);
    });
  });

  // --- Pruebas para GET /api/customers/:id/orders ---
  describe('GET /api/customers/:id/orders', () => {
    it('debería devolver las órdenes de un cliente existente', async () => {
      // 1. Crear Cliente
      const [customerResult] = await pool.execute(
        "INSERT INTO customers (CustomerName, Email) VALUES ('Cliente con Orden', 'orden@test.com')"
      );
      const customerId = customerResult.insertId;
      
      // 2. Crear Orden vinculada (Invoice es VARCHAR(5) en tu SQL, usamos 'F-001' que tiene 5 chars)
      await pool.execute(
        "INSERT INTO orders (CustomerID, Invoice, estado) VALUES (?, 'F-001', 'Nuevo')", 
        [customerId]
      );

      const response = await request(app).get(`/api/customers/${customerId}/orders`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].Invoice).toBe('F-001');
    });

    it('debería devolver un error 404 si un cliente existe pero no tiene órdenes', async () => {
      const [customerResult] = await pool.execute(
        "INSERT INTO customers (CustomerName, Email) VALUES ('Cliente sin Orden', 'sinorden@test.com')"
      );
      const customerId = customerResult.insertId;

      const response = await request(app).get(`/api/customers/${customerId}/orders`);

      // Dependiendo de tu lógica de negocio, esto puede ser 404 o 200 con array vacío.
      // Asumimos 404 según tu test original.
      expect(response.statusCode).toBe(404);
    });
  });
});