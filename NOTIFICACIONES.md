# Sistema de Notificaciones de Inventario

## Configuración

El sistema de notificaciones ya está implementado y configurado para revisar el inventario **diariamente a las 9:00 AM**.

### Pasos para activar las notificaciones:

1. **Editar el archivo `.env`** y configurar los siguientes campos:

```env
# SendGrid Configuration
SENDGRID_API_KEY=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
SENDER_EMAIL=tu_email@ejemplo.com          # ⚠️ CAMBIAR: Email verificado en SendGrid
SENDER_NAME=PyroControl Center
ALERT_RECIPIENTS=tu_email@ejemplo.com      # ⚠️ CAMBIAR: Email(s) que recibirán las alertas

# Cron Schedule (9:00 AM todos los días)
CHECK_INTERVAL=0 9 * * *
```

2. **Configurar el email remitente en SendGrid:**
   - Ir a https://app.sendgrid.com/settings/sender_auth
   - Verificar tu dominio o un email individual (Single Sender Verification)
   - Usar ese email en `SENDER_EMAIL`

3. **Configurar los destinatarios:**
   - Puedes poner uno o varios emails separados por comas:
   ```env
   ALERT_RECIPIENTS=admin@ejemplo.com,gerente@ejemplo.com,almacen@ejemplo.com
   ```

4. **Reiniciar el servidor:**
   ```bash
   npm start
   ```

## Probar las notificaciones

Para probar manualmente el sistema sin esperar a las 9 AM:

```bash
npm run test-notifications
```

Este comando:
- ✅ Verifica la configuración de SendGrid
- ✅ Busca productos con stock en el mínimo o por debajo
- ✅ Envía correos de prueba inmediatamente

## Cómo funciona

1. **Horario**: Todos los días a las 9:00 AM (configurable en `CHECK_INTERVAL`)

2. **Criterio**: Busca productos donde `stock <= minstock` y `estado = 1` (activos)

3. **Email**: Envía un correo con una tabla detallada por cada producto:
   - Nombre del producto
   - Categoría
   - Stock actual vs. Stock mínimo
   - Unidad de medida
   - Proveedor

4. **Formato cron** para `CHECK_INTERVAL`:
   ```
   * * * * *
   │ │ │ │ │
   │ │ │ │ └── Día de la semana (0-7, 0 y 7 = domingo)
   │ │ │ └──── Mes (1-12)
   │ │ └────── Día del mes (1-31)
   │ └──────── Hora (0-23)
   └────────── Minuto (0-59)
   ```

   Ejemplos:
   - `0 9 * * *` = 9:00 AM todos los días
   - `0 9 * * 1-5` = 9:00 AM de lunes a viernes
   - `0 9,15 * * *` = 9:00 AM y 3:00 PM todos los días
   - `*/30 * * * *` = Cada 30 minutos (para pruebas)

## Troubleshooting

### El servidor inicia pero no envía correos:

1. **Verificar que SendGrid esté configurado:**
   ```bash
   npm run test-notifications
   ```
   Debe mostrar "✅ SendGrid configurado correctamente"

2. **Verificar el API Key:**
   - Debe empezar con `SG.`
   - No debe tener espacios
   - Debe estar activo en tu cuenta de SendGrid

3. **Verificar el email remitente:**
   - Debe estar verificado en SendGrid
   - Si usas dominio personalizado, debe estar autenticado

4. **Ver logs del servidor:**
   ```bash
   npm start
   ```
   Buscar mensajes como:
   - `✅ SendGrid configurado correctamente`
   - `InventoryMonitorService: usando CHECK_INTERVAL='0 9 * * *'`

### No recibo correos:

1. **Revisar carpeta de spam**
2. **Verificar que hay productos con stock bajo:**
   ```sql
   SELECT producto, stock, minstock 
   FROM inventario 
   WHERE stock <= minstock AND estado = 1;
   ```
3. **Ejecutar prueba manual:**
   ```bash
   npm run test-notifications
   ```

## Ejemplo de email recibido

```
Asunto: Stock Mínimo Alcanzado

Alerta de Inventario
El siguiente producto ha alcanzado su nivel mínimo de stock:

┌────────────────┬──────────────────────────────┐
│ Producto:      │ Pólvora negra grano fino     │
│ Categoría:     │ Químicos                     │
│ Stock Actual:  │ 95 kg                        │
│ Stock Mínimo:  │ 100 kg                       │
│ Proveedor:     │ Explosivos Industriales SA   │
└────────────────┴──────────────────────────────┘

⚠️ Se recomienda realizar un nuevo pedido.
```

## Notas importantes

- ⚠️ **No compartir** el archivo `.env` - contiene información sensible
- ⚠️ El API key de SendGrid tiene **fecha de expiración** (revisar en tu cuenta)
- ✅ El servicio se inicia automáticamente con `npm start`
- ✅ El cron job se ejecuta en el servidor mientras esté corriendo
- ✅ Si el servidor se detiene, el cron job también se detiene
