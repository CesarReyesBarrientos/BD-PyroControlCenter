const cron = require('node-cron');
const { pool } = require('../config/database');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class InventoryMonitorService {
    constructor() {
        // Programar la tarea. La expresión CRON se toma de CHECK_INTERVAL en .env
        // Ejemplo por defecto: '0 * * * *' -> cada hora en minuto 0
        const interval = process.env.CHECK_INTERVAL || '0 * * * *';
        console.log(`InventoryMonitorService: usando CHECK_INTERVAL='${interval}'`);
        this.job = cron.schedule(interval, () => {
            this.checkInventoryLevels();
        });
    }

    async checkInventoryLevels() {
        try {
            const [products] = await pool.query(`
                SELECT 
                    i.*,
                    COALESCE(s.nombre, 'N/A') as proveedor_nombre
                FROM inventario i
                LEFT JOIN suppliers s ON i.proveedor_id = s.id
                WHERE i.stock <= i.minstock AND i.estado = 1
            `);

            // Preparar lista de destinatarios (array) a partir de la variable de entorno
            const recipients = (process.env.ALERT_RECIPIENTS || '').split(',').map(r => r.trim()).filter(Boolean);

            for (const product of products) {
                const formattedProduct = {
                    nombre: product.producto,
                    categoria: product.categoria,
                    stock_actual: product.stock,
                    stock_minimo: product.minstock,
                    unidad_de_medida: product.unidad_de_medida,
                    proveedor_nombre: product.proveedor_nombre
                };

                const msg = {
                    to: recipients,
                    from: {
                        email: process.env.SENDER_EMAIL,
                        name: process.env.SENDER_NAME || 'Pyrosmart'
                    },
                    subject: `Stock Mínimo Alcanzado`,
                    html: `
                        <h2>Alerta de Inventario</h2>
                        <p>El siguiente producto ha alcanzado su nivel mínimo de stock:</p>
                        <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
                            <tr style="background-color: #f4f7fc;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Producto:</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${formattedProduct.nombre}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Categoría:</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${formattedProduct.categoria}</td>
                            </tr>
                            <tr style="background-color: #f4f7fc;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Stock Actual:</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${formattedProduct.stock_actual} ${formattedProduct.unidad_de_medida}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Stock Mínimo:</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${formattedProduct.stock_minimo} ${formattedProduct.unidad_de_medida}</td>
                            </tr>
                            <tr style="background-color: #f4f7fc;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Proveedor:</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${formattedProduct.proveedor_nombre || 'No especificado'}</td>
                            </tr>
                        </table>
                        <p style="color: #ff4444;"><strong>Se recomienda realizar un nuevo pedido.</strong></p>
                    `
                };

                await sgMail.send(msg);
                console.log(`Alerta enviada para el producto: ${formattedProduct.nombre}`);
            }
        } catch (error) {
            console.error('Error en el monitoreo de inventario:', error);
            if (error.response) {
                console.error('Detalles del error:', error.response.body);
            }
        }
    }

    // Método para verificar manualmente los niveles de inventario
    async checkNow() {
        await this.checkInventoryLevels();
    }

    // Método para detener el monitoreo
    stop() {
        if (this.job) {
            this.job.stop();
        }
    }
}

module.exports = new InventoryMonitorService();