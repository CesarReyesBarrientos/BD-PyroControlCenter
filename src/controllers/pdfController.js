// src/controllers/pdfController.js
const PDFDocument = require('pdfkit');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET /api/orders/:id/pdf - Generar PDF de una orden
exports.generateOrderPDF = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    // Obtener datos de la orden con información del cliente
    const orderSql = `
      SELECT 
        o.OrderID,
        o.Product,
        o.Invoice,
        o.OrderDate,
        o.PaymentMethod,
        o.estado,
        c.CustomerID,
        c.CustomerName,
        c.Email,
        c.PhoneNumber,
        c.CountryCode,
        c.Address,
        c.State,
        c.PostalCode,
        c.CountryName
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID = ? AND o.activo = 1
    `;
    
    const [orders] = await pool.execute(orderSql, [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }
    
    const order = orders[0];
    
    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Orden-${order.Invoice}.pdf`);
    
    // Pipe el PDF directamente a la respuesta
    doc.pipe(res);
    
    // === ENCABEZADO CON LOGO ===
    const logoPath = path.join(__dirname, '../../assets/logo.png');
    
    // Verificar si existe el logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 120, height: 120 });
    }
    
    // Información de la empresa (derecha)
    doc.fontSize(10)
       .text('PyroControl Center', 400, 50, { align: 'right' })
       .text('Sistema de Gestión de Órdenes', 400, 65, { align: 'right' })
       .text('www.pyrocontrol.com', 400, 80, { align: 'right' })
       .text('Tel: +52 (449) 123-4567', 400, 95, { align: 'right' });
    
    // Línea divisoria
    doc.moveTo(50, 175)
       .lineTo(562, 175)
       .stroke();
    
    // === TÍTULO ===
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('REPORTE DE ORDEN', 50, 190, { align: 'center' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Orden #${order.Invoice}`, 50, 220, { align: 'center' });
    
    // === INFORMACIÓN DE LA ORDEN ===
    let yPosition = 260;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Información de la Orden', 50, yPosition);
    
    yPosition += 25;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('ID de Orden:', 50, yPosition)
       .font('Helvetica')
       .text(`ORD-${order.OrderID.toString().padStart(3, '0')}`, 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Fecha de Orden:', 50, yPosition)
       .font('Helvetica')
       .text(formatDate(order.OrderDate), 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Producto:', 50, yPosition)
       .font('Helvetica')
       .text(order.Product || 'N/A', 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Número de Factura:', 50, yPosition)
       .font('Helvetica')
       .text(order.Invoice, 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Método de Pago:', 50, yPosition)
       .font('Helvetica')
       .text(getPaymentMethodLabel(order.PaymentMethod), 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Estado:', 50, yPosition)
       .font('Helvetica')
       .text(order.estado, 200, yPosition);
    
    // === INFORMACIÓN DEL CLIENTE ===
    yPosition += 40;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Información del Cliente', 50, yPosition);
    
    yPosition += 25;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('Nombre:', 50, yPosition)
       .font('Helvetica')
       .text(order.CustomerName, 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Email:', 50, yPosition)
       .font('Helvetica')
       .text(order.Email || 'N/A', 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Teléfono:', 50, yPosition)
       .font('Helvetica')
       .text(`+${order.CountryCode || '52'} ${order.PhoneNumber || 'N/A'}`, 200, yPosition);
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('Dirección:', 50, yPosition)
       .font('Helvetica')
       .text(order.Address || 'N/A', 200, yPosition);
    
    if (order.State || order.PostalCode) {
      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Estado/CP:', 50, yPosition)
         .font('Helvetica')
         .text(`${order.State || ''} ${order.PostalCode ? 'CP ' + order.PostalCode : ''}`.trim(), 200, yPosition);
    }
    
    yPosition += 20;
    doc.font('Helvetica-Bold')
       .text('País:', 50, yPosition)
       .font('Helvetica')
       .text(order.CountryName || 'N/A', 200, yPosition);
    
    // === PIE DE PÁGINA ===
    const pageHeight = doc.page.height;
    doc.fontSize(9)
       .font('Helvetica')
       .text(
         'Este documento es un reporte generado automáticamente por PyroControl Center',
         50,
         pageHeight - 80,
         { align: 'center', width: 512 }
       );
    
    doc.fontSize(8)
       .text(
         `Generado el: ${new Date().toLocaleString('es-MX')}`,
         50,
         pageHeight - 60,
         { align: 'center', width: 512 }
       );
    
    // Línea en el pie
    doc.moveTo(50, pageHeight - 90)
       .lineTo(562, pageHeight - 90)
       .stroke();
    
    // Finalizar el PDF
    doc.end();
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    next(error);
  }
};

// Funciones auxiliares
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getPaymentMethodLabel(method) {
  const methods = {
    'tarjeta': 'Tarjeta de crédito/débito',
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia bancaria'
  };
  return methods[method] || method || 'N/A';
}
