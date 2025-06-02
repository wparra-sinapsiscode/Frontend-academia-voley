# 🔍 INSTRUCCIONES PARA PROBAR EL FLUJO DE PAGOS PADRE → ADMIN

## Paso a Paso para Testing

### 1. **Preparar el entorno**
- Abrir la consola del navegador (F12 → Console)
- Los logs aparecerán con emojis para fácil identificación:
  - 🔄 = Creación de pago desde padre
  - 🎯 = Procesamiento en AppContext
  - 🔔 = Notificaciones
  - 📊 = Estado en Finanzas
  - ❌ = Errores

### 2. **Iniciar sesión como padre**
- Email: `lucia.garcia@email.com`
- Password: `parent123`
- Ir a "Gestión de Pagos"

### 3. **Registrar un nuevo pago**
- Hacer clic en "Registrar Pago"
- Llenar el formulario:
  - Tipo: "Mensualidad"
  - Monto: 250
  - Método: "Transferencia"
  - Descripción: "Pago de prueba"
  - Subir un archivo de voucher (opcional)
- Hacer clic en "Registrar Pago"

### 4. **Verificar logs en consola**
Deberías ver:
```
🔄 Creando nuevo pago desde padre: { studentId: "student1", amount: 250, ... }
✅ Pago creado y enviado al contexto
🎯 AppContext - Recibiendo datos de pago: { ... }
🎯 AppContext - Pago completo creado: { id: "payment_xxx", ... }
🎯 AppContext - Pago añadido al estado
🔔 AppContext - Creando notificación para admin (pendingApproval = true)
🔔 AppContext - Notificación creada: { ... }
🔔 AppContext - Notificación añadida al estado
```

### 5. **Verificar estado del pago**
- El pago debería aparecer en la lista con estado "Pendiente de aprobación"
- Icono de reloj (🕐) amarillo

### 6. **Cambiar a usuario admin**
- Cerrar sesión (si es necesario)
- Iniciar sesión como admin:
  - Email: `admin@academiavoley.pe`
  - Password: `admin123`

### 7. **Verificar notificación**
- Revisar el ícono de campana (🔔) en el header
- Debería mostrar un número rojo con las notificaciones no leídas
- Hacer clic para ver la notificación del nuevo pago

### 8. **Ir a Finanzas → Aprobaciones**
- Navegar a "Finanzas"
- Hacer clic en la pestaña "Aprobaciones"
- **VERIFICAR EL PANEL DE DEBUG** (amarillo en la parte superior)

### 9. **Interpretar el panel de debug**
El panel amarillo mostrará:
- Total de pagos en contexto
- Pagos con pendingApproval=true
- Pagos filtrados para aprobación
- Detalles JSON de todos los pagos

### 10. **Aprobar o rechazar el pago**
- El pago debería aparecer en la tabla
- Usar los botones "Aprobar" o "Rechazar"
- Si rechaza, escribir un motivo

### 11. **Verificar cambio de estado**
- Volver a la vista de padre
- El estado del pago debería actualizarse

## 🐛 Troubleshooting

### Si no aparecen pagos en Finanzas:
1. Verificar logs de consola para errores
2. Revisar panel de debug (números deben coincidir)
3. Verificar que `pendingApproval: true` en los logs
4. Comprobar filtros en la pestaña

### Si no aparecen notificaciones:
1. Verificar logs de notificaciones en consola
2. Confirmar que el usuario admin tiene role='admin'
3. Verificar que `to: 'admin'` en la notificación

### Si el estado no se actualiza:
1. Verificar que localStorage persiste los cambios
2. Refrescar la página para cargar estado persistido
3. Revistar función updatePayment en contexto

## 📝 Datos de prueba incluidos

Ya existen pagos de ejemplo en el sistema:
- `payment_4` (student1): Pendiente de aprobación
- `payment_14` (student3): Pendiente de aprobación  
- `payment_24` (student5): Pendiente de aprobación
- `payment_9` (student2): Rechazado

## 🔧 Eliminar logs después del testing

Una vez confirmado que funciona, eliminar:
- Logs de `ParentPayments.tsx` líneas 665-667
- Logs de `AppContext.tsx` líneas 835-871
- Logs de `Finances.tsx` líneas 144-148
- Logs de `Header.tsx` líneas 89-100
- Panel de debug en `Finances.tsx` líneas 905-946