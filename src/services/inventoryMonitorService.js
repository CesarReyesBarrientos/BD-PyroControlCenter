const cron = require('node-cron');
const { pool } = require('../config/database');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configurar SendGrid solo si la API key está disponible
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey && apiKey.startsWith('SG.')) {
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid configurado correctamente');
} else {
    console.warn('⚠️  SENDGRID_API_KEY no configurada. Las alertas por email estarán deshabilitadas.');
}

class InventoryMonitorService {
    constructor() {
        // Solo iniciar el cron si SendGrid está configurado
        if (!apiKey || !apiKey.startsWith('SG.')) {
            console.log('ℹ️  Servicio de monitoreo de inventario deshabilitado (falta configuración de email)');
            return;
        }

        // Programar la tarea. La expresión CRON se toma de CHECK_INTERVAL en .env
        const interval = process.env.CHECK_INTERVAL || '0 * * * *';
        console.log(`InventoryMonitorService: usando CHECK_INTERVAL='${interval}'`);
        this.job = cron.schedule(interval, () => {
            this.checkInventoryLevels();
        });
    }

    async checkInventoryLevels() {
        try {
            console.log('📊 Ejecutando verificación de inventario...');
            
            // Verificar si SendGrid está configurado
            if (!apiKey || !apiKey.startsWith('SG.')) {
                console.log('⚠️  No se puede enviar alertas: SendGrid no está configurado');
                return;
            }

            const [products] = await pool.query(`
                SELECT 
                    i.*,
                    COALESCE(s.nombre, 'N/A') as proveedor_nombre
                FROM inventario i
                LEFT JOIN suppliers s ON i.proveedor_id = s.id
                WHERE i.stock <= i.minstock AND i.estado = 1
            `);

            console.log(`📦 Productos con stock bajo encontrados: ${products.length}`);

            if (products.length === 0) {
                console.log('✅ No hay productos con stock bajo. Todo bien!');
                return;
            }

            // Preparar lista de destinatarios (array) a partir de la variable de entorno
            const recipients = (process.env.ALERT_RECIPIENTS || '').split(',').map(r => r.trim()).filter(Boolean);
            
            if (recipients.length === 0) {
                console.error('❌ No hay destinatarios configurados en ALERT_RECIPIENTS');
                return;
            }

            console.log(`📧 Enviando alertas a: ${recipients.join(', ')}`);

            // Agrupar todos los productos en un solo email
            let productRows = '';
            products.forEach((product, index) => {
                const bgColor = index % 2 === 0 ? '#f4f7fc' : '#ffffff';
                productRows += `
                    <tr style="background-color: ${bgColor};">
                        <td style="padding: 10px; border: 1px solid #ddd;">${product.producto}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${product.categoria || '-'}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: #ff4444; font-weight: bold;">${product.stock} ${product.unidad_de_medida}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${product.minstock} ${product.unidad_de_medida}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${product.proveedor_nombre || 'No especificado'}</td>
                    </tr>
                `;
            });

            const msg = {
                to: recipients,
                from: {
                    email: process.env.SENDER_EMAIL || 'noreply@pyrocontrol.com',
                    name: process.env.SENDER_NAME || 'PyroControl Center'
                },
                subject: `⚠️ Alerta: ${products.length} producto(s) con stock bajo`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                        <h2 style="color: #ff4444;">⚠️ Alerta de Inventario Bajo</h2>
                        <p>Se detectaron <strong>${products.length} producto(s)</strong> con stock en el nivel mínimo o por debajo:</p>
                        
                        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                            <thead>
                                <tr style="background-color: #2563eb; color: white;">
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Producto</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Categoría</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Stock Actual</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Stock Mínimo</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Proveedor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productRows}
                            </tbody>
                        </table>
                        
                        <p style="color: #ff4444; font-weight: bold; font-size: 16px;">
                            🚨 Se recomienda realizar pedidos para estos productos.
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 12px;">
                            Este es un mensaje automático del sistema PyroControl Center.<br>
                            Fecha de revisión: ${new Date().toLocaleString('es-MX', { 
                                timeZone: 'America/Mexico_City',
                                dateStyle: 'full',
                                timeStyle: 'short'
                            })}
                        </p>
                    </div>
                `
            };

            console.log('📤 Enviando email...');
            await sgMail.send(msg);
            console.log(`✅ Alerta enviada exitosamente para ${products.length} producto(s) con stock bajo`);
            
        } catch (error) {
            console.error('❌ Error en el monitoreo de inventario:', error.message);
            if (error.response) {
                console.error('📋 Detalles del error de SendGrid:');
                console.error('   Status:', error.response.statusCode);
                console.error('   Body:', JSON.stringify(error.response.body, null, 2));
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