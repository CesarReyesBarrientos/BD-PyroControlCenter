// tests/customers.test.js
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

// --- Conjunto de Pruebas para la API de Clientes ---
describe('Customers API', () => {

  // Se ejecuta ANTES DE CADA prueba 'it' en este archivo.
  beforeEach(async () => {
    // Silenciamos console.error para mantener la salida de la prueba limpia,
    // ya que nuestro manejador de errores centralizado lo usa.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Limpiamos las tablas relacionadas para asegurar un estado limpio y aislado.
    // El orden es importante por las claves foráneas (borrar 'orders' antes que 'customers').
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0;');
    await pool.execute('TRUNCATE TABLE orders');
    await pool.execute('TRUNCATE TABLE customers');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1;');
  });

  // Se ejecuta DESPUÉS DE TODAS las pruebas en este archivo.
  afterAll(async () => {
    // Restauramos console.error a su comportamiento original.
    console.error.mockRestore();
    // Cerramos el pool de conexiones a la base de datos.
    await pool.end();
  });

  // --- Pruebas para POST /api/customers ---
  describe('POST /api/customers', () => {
    it('debería crear un nuevo cliente con todos los datos y devolver 201', async () => {
      const newCustomer = {
        CustomerName: 'Cliente Completo',
        PhoneNumber: '4491234567',
        Email: 'completo@test.com',
        Address: 'Av. Siempre Viva 742',
      };

      const response = await request(app).post('/api/customers').send(newCustomer);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('customerId');
      expect(response.body.message).toBe('Cliente creado exitosamente.');
    });

    it('debería devolver un error 400 si falta el CustomerName', async () => {
      const invalidCustomer = { Email: 'sin_nombre@test.com' };
      const response = await request(app).post('/api/customers').send(invalidCustomer);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('CustomerName y Email son campos requeridos.');
    });

    it('debería devolver un error 400 si falta el Email', async () => {
        const invalidCustomer = { CustomerName: 'Sin Email' };
        const response = await request(app).post('/api/customers').send(invalidCustomer);
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('CustomerName y Email son campos requeridos.');
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
      // Creamos un cliente activo y uno inactivo
      await pool.execute("INSERT INTO customers (CustomerName, Email, estado) VALUES ('Cliente Activo', 'activo@test.com', 1)");
      await pool.execute("INSERT INTO customers (CustomerName, Email, estado) VALUES ('Cliente Inactivo', 'inactivo@test.com', 0)");

      const response = await request(app).get('/api/customers');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].CustomerName).toBe('Cliente Activo');
    });
  });

  // --- Pruebas para PUT /api/customers/:id/deactivate ---
  describe('PUT /api/customers/:id/deactivate', () => {
    it('debería cambiar el estado de un cliente a 0 y devolver 200', async () => {
      // Creamos un cliente para desactivarlo
      const [result] = await pool.execute("INSERT INTO customers (CustomerName, Email) VALUES ('Cliente a Desactivar', 'desactivar@test.com')");
      const customerId = result.insertId;

      const response = await request(app).put(`/api/customers/${customerId}/deactivate`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Cliente desactivado correctamente.');

      // Verificación: el cliente ya no debe aparecer en la lista de activos
      const getResponse = await request(app).get('/api/customers');
      expect(getResponse.body.find(c => c.CustomerID === customerId)).toBeUndefined();
    });

    it('debería devolver un error 404 si el cliente no existe', async () => {
      const response = await request(app).put('/api/customers/999/deactivate');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Cliente no encontrado.');
    });
  });

  // --- Pruebas para GET /api/customers/:id/orders ---
  describe('GET /api/customers/:id/orders', () => {
    it('debería devolver las órdenes de un cliente existente', async () => {
      // Creamos un cliente y una orden asociada
      const [customerResult] = await pool.execute("INSERT INTO customers (CustomerName, Email) VALUES ('Cliente con Orden', 'orden@test.com')");
      const customerId = customerResult.insertId;
      await pool.execute("INSERT INTO orders (CustomerID, Invoice) VALUES (?, 'F-001')", [customerId]);

      const response = await request(app).get(`/api/customers/${customerId}/orders`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].Invoice).toBe('F-001');
    });

    it('debería devolver un error 404 si un cliente existe pero no tiene órdenes', async () => {
      // Creamos un cliente sin órdenes
      const [customerResult] = await pool.execute("INSERT INTO customers (CustomerName, Email) VALUES ('Cliente sin Orden', 'sinorden@test.com')");
      const customerId = customerResult.insertId;

      const response = await request(app).get(`/api/customers/${customerId}/orders`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('No se encontraron órdenes para este cliente');
    });

    it('debería devolver un error 404 si el cliente no existe', async () => {
      const response = await request(app).get('/api/customers/999/orders');

      expect(response.statusCode).toBe(404);
    });
  });
});