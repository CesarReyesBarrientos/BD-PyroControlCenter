// test-notifications.js
require('dotenv').config();
const inventoryMonitor = require('./src/services/inventoryMonitorService');
const { pool } = require('./src/config/database');

async function testNotifications() {
    console.log('🧪 Probando sistema de notificaciones...\n');
    console.log('━'.repeat(60));
    console.log('📋 CONFIGURACIÓN ACTUAL:');
    console.log('━'.repeat(60));
    
    const apiKey = process.env.SENDGRID_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;
    const recipients = process.env.ALERT_RECIPIENTS;
    const checkInterval = process.env.CHECK_INTERVAL;
    
    console.log('✓ API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ NO CONFIGURADO');
    console.log('✓ Email remitente:', senderEmail || '❌ NO CONFIGURADO');
    console.log('✓ Destinatarios:', recipients || '❌ NO CONFIGURADO');
    console.log('✓ Horario:', checkInterval || '0 * * * * (cada hora por defecto)');
    console.log('');
    
    // Verificar errores de configuración
    const errors = [];
    if (!apiKey || !apiKey.startsWith('SG.')) errors.push('❌ SENDGRID_API_KEY no válido o falta');
    if (!senderEmail) errors.push('❌ SENDER_EMAIL no configurado');
    if (!recipients) errors.push('❌ ALERT_RECIPIENTS no configurado');
    
    if (errors.length > 0) {
        console.log('━'.repeat(60));
        console.log('⚠️  ERRORES DE CONFIGURACIÓN:');
        console.log('━'.repeat(60));
        errors.forEach(err => console.log(err));
        console.log('\n💡 Edita el archivo .env para corregir estos errores.\n');
        process.exit(1);
    }
    
    console.log('━'.repeat(60));
    console.log('🔍 VERIFICANDO BASE DE DATOS:');
    console.log('━'.repeat(60));
    
    try {
        const [products] = await pool.query(`
            SELECT 
                i.producto,
                i.categoria,
                i.stock,
                i.minstock,
                i.unidad_de_medida,
                COALESCE(s.nombre, 'Sin proveedor') as proveedor_nombre
            FROM inventario i
            LEFT JOIN suppliers s ON i.proveedor_id = s.id
            WHERE i.stock <= i.minstock AND i.estado = 1
        `);
        
        console.log(`📦 Productos con stock bajo: ${products.length}\n`);
        
        if (products.length > 0) {
            console.log('Productos que generarán alerta:');
            products.forEach((p, i) => {
                console.log(`  ${i+1}. ${p.producto}`);
                console.log(`     Stock: ${p.stock} / Mínimo: ${p.minstock} ${p.unidad_de_medida}`);
                console.log(`     Proveedor: ${p.proveedor_nombre}\n`);
            });
        } else {
            console.log('ℹ️  No hay productos con stock bajo actualmente.');
            console.log('💡 Para probar el email, ajusta el minstock de algún producto.\n');
        }
        
        console.log('━'.repeat(60));
        console.log('📧 ENVIANDO EMAIL DE PRUEBA...');
        console.log('━'.repeat(60));
        
        await inventoryMonitor.checkNow();
        
        console.log('\n━'.repeat(60));
        console.log('✅ PRUEBA COMPLETADA');
        console.log('━'.repeat(60));
        
        if (products.length > 0) {
            console.log('📬 Revisa tu correo (incluyendo spam/correo no deseado)');
            console.log(`   Destinatarios: ${recipients}`);
        } else {
            console.log('ℹ️  No se envió email porque no hay productos con stock bajo.');
        }
        
        console.log('\n💡 Si no recibes el correo:');
        console.log('   1. Verifica que el SENDER_EMAIL esté verificado en SendGrid');
        console.log('   2. Revisa la carpeta de spam');
        console.log('   3. Verifica que el API key sea válido y activo\n');
        
        await pool.end();
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.response) {
            console.error('   Detalles:', error.response.body);
        }
        await pool.end();
        process.exit(1);
    }
}

testNotifications();
