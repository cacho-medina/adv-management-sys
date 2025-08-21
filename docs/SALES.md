# 💰 Documentación del Módulo de Ventas

## 📋 Descripción General

El módulo de ventas proporciona un sistema completo para la gestión de ventas en el sistema ERP. Incluye funcionalidades avanzadas como gestión automática de stock, manejo de clientes, estrategias de modificación de ventas y auditoría completa.

## 🔗 Endpoints Disponibles

### Ruta Base: `/sales`

**Guards Aplicados a Nivel de Controlador:**

- `JwtAuthGuard`: Autenticación JWT requerida
- `EmailConfirmedGuard`: Email confirmado requerido
- `BusinessAccessGuard`: Acceso al negocio específico
- `RolesGuard`: Control de roles
- `@BusinessAccess()`: Decorador de acceso a negocio
- `@Roles(OWNER, EMPLOYEE)`: Solo propietarios y empleados

---

## 📝 1. Registrar Nueva Venta

**Endpoint:** `POST /sales/register`

**Descripción:** Crea una nueva venta con validación automática de stock, gestión de clientes y cálculo de totales.

### Request Body (CreateSaleDto)

```json
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "clientId": "550e8400-e29b-41d4-a716-446655440001", // Opcional
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 2,
      "price": 25.5
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440003",
      "quantity": 1,
      "price": 45.0
    }
  ],
  "clientData": {
    // Opcional - Para crear nuevo cliente
    "dni": "12345678",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "phone": "+1234567890",
    "address": "Calle Principal 123, Ciudad"
  }
}
```

### Validaciones Automáticas

1. **Verificación de Stock:** Valida que haya suficiente stock para cada producto
2. **Gestión de Cliente:**
   - Si se proporciona `clientId`, lo usa directamente
   - Si se proporciona `clientData.dni`, busca cliente existente o crea uno nuevo
   - Si no se proporciona ninguno, la venta queda sin cliente asignado
3. **Cálculo de Total:** Suma automática de `precio × cantidad` para todos los items
4. **Actualización de Stock:** Resta automáticamente las cantidades vendidas

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "total": 96.0,
  "status": "PENDING",
  "createdAt": "2025-01-20T10:30:00.000Z",
  "updatedAt": "2025-01-20T10:30:00.000Z",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 2,
      "price": 25.5,
      "subtotal": 51.0
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "productId": "550e8400-e29b-41d4-a716-446655440003",
      "quantity": 1,
      "price": 45.0,
      "subtotal": 45.0
    }
  ],
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "dni": "12345678",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "phone": "+1234567890",
    "address": "Calle Principal 123, Ciudad"
  }
}
```

---

## 📋 2. Listar Ventas con Filtros

**Endpoint:** `GET /sales/business/:businessId/all`

**Descripción:** Obtiene todas las ventas del negocio con filtros avanzados y paginación.

### Parámetros de Consulta

| Parámetro   | Tipo   | Descripción                                                  | Default |
| ----------- | ------ | ------------------------------------------------------------ | ------- |
| `clientId`  | UUID   | Filtrar por cliente específico                               | -       |
| `status`    | string | Filtrar por estado (PENDING, COMPLETED, CANCELLED, REFUNDED) | -       |
| `startDate` | string | Fecha de inicio (ISO 8601)                                   | -       |
| `endDate`   | string | Fecha de fin (ISO 8601)                                      | -       |
| `page`      | number | Número de página                                             | 1       |
| `limit`     | number | Elementos por página                                         | 10      |

### Ejemplo de Request

GET /sales/business/550e8400-e29b-41d4-a716-446655440000/all?status=COMPLETED&startDate=2025-01-01&endDate=2025-01-31&page=1&limit=20

````

### Response

```json
{
  "sales": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "businessId": "550e8400-e29b-41d4-a716-446655440000",
      "clientId": "550e8400-e29b-41d4-a716-446655440001",
      "total": 96.00,
      "status": "COMPLETED",
      "createdAt": "2025-01-20T10:30:00.000Z",
      "updatedAt": "2025-01-20T11:00:00.000Z",
      "client": {
        "name": "Juan Pérez",
        "dni": "12345678"
      },
      "_count": {
        "items": 2
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
````

---

## 🔍 3. Obtener Venta Específica

**Endpoint:** `GET /sales/business/:businessId/sale/:saleId`

**Descripción:** Obtiene los detalles completos de una venta 
específica.

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "total": 96.0,
  "status": "COMPLETED",
  "createdAt": "2025-01-20T10:30:00.000Z",
  "updatedAt": "2025-01-20T11:00:00.000Z",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 2,
      "price": 25.5,
      "subtotal": 51.0,
      "product": {
        "name": "Producto A",
        "sku": "PROD-001"
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "productId": "550e8400-e29b-41d4-a716-446655440003",
      "quantity": 1,
      "price": 45.0,
      "subtotal": 45.0,
      "product": {
        "name": "Producto B",
        "sku": "PROD-002"
      }
    }
  ],
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "dni": "12345678",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "phone": "+1234567890",
    "address": "Calle Principal 123, Ciudad"
  }
}
```

---

## ✏️ 4. Modificar Venta (Estrategia Avanzada)

**Endpoint:** `PATCH /sales/business/:businessId/update/:saleId`

**Descripción:** Modifica una venta existente usando estrategias 
avanzadas según el estado actual.

### Estrategias de Modificación

#### 🔄 Para Ventas COMPLETADAS
1. Marca la venta original como `REFUNDED`
2. Restaura el stock de los productos originales
3. Elimina los `SaleItems` originales
4. Crea una nueva venta con los datos actualizados
5. Retorna la nueva venta creada

#### ⏳ Para Ventas PENDIENTES
1. Marca la venta original como `CANCELLED`
2. Restaura el stock de los productos originales
3. Elimina los `SaleItems` originales
4. Crea una nueva venta con los datos actualizados
5. Retorna la nueva venta creada

#### 📝 Para Cambios Solo de Estado/Cliente
Si no se modifican los items, permite actualización directa de:
- Estado de la venta
- Cliente asociado
- Datos del cliente

### Request Body (UpdateSaleDto)

```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440007", // Opcional
  "items": [ // Opcional - Si se incluye, activa estrategia de 
  refund/cancel
    {
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 1, // Cantidad modificada
      "price": 30.00 // Precio actualizado
    }
  ],
  "clientData": { // Opcional
    "dni": "87654321",
    "name": "María García",
    "email": "maria.garcia@email.com",
    "phone": "+0987654321",
    "address": "Avenida Secundaria 456"
  },
  "status": "COMPLETED" // Opcional
}
```

### Response para Modificación con Nueva Venta

```json
{
  "message": "Venta modificada exitosamente",
  "originalSale": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "status": "REFUNDED",
    "refundedAt": "2025-01-20T15:30:00.000Z"
  },
  "newSale": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "businessId": "550e8400-e29b-41d4-a716-446655440000",
    "clientId": "550e8400-e29b-41d4-a716-446655440007",
    "total": 30.0,
    "status": "PENDING",
    "createdAt": "2025-01-20T15:30:00.000Z",
    "items": [
      {
        "productId": "550e8400-e29b-41d4-a716-446655440002",
        "quantity": 1,
        "price": 30.0,
        "subtotal": 30.0
      }
    ]
  },
  "isNewSale": true
}
```

---

## 🗑️ 5. Eliminar Venta

**Endpoint:** `DELETE /sales/business/:businessId/delete/:saleId`

**Descripción:** Elimina una venta usando estrategias diferenciadas 
según el estado.

### Estrategias de Eliminación

#### ✅ Para Ventas COMPLETADAS (Soft Delete)
1. Cambia el estado a `CANCELLED`
2. Restaura el stock de todos los productos
3. Elimina físicamente los `SaleItems`
4. Mantiene el registro de la venta para auditoría

#### ⏳ Para Ventas PENDIENTES (Hard Delete)
1. Restaura el stock de todos los productos
2. Elimina físicamente los `SaleItems`
3. Elimina físicamente la venta completa

### Validaciones
- No permite eliminar ventas ya `CANCELLED`
- No permite eliminar ventas `REFUNDED`
- Verifica que la venta pertenezca al negocio

### Response

```json
{
  "message": "Venta eliminada exitosamente",
  "saleId": "550e8400-e29b-41d4-a716-446655440004",
  "action": "soft_delete", // o "hard_delete"
  "stockRestored": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantityRestored": 2
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440003",
      "quantityRestored": 1
    }
  ]
}
```

---

## 🔒 Seguridad y Validaciones

### Guards Aplicados
- **JwtAuthGuard:** Validación de token JWT
- **EmailConfirmedGuard:** Email debe estar confirmado
- **BusinessAccessGuard:** Usuario debe tener acceso al negocio
- **RolesGuard:** Solo OWNER y EMPLOYEE pueden acceder

### Validaciones de Negocio
1. **Stock Suficiente:** Verifica disponibilidad antes de crear/
modificar
2. **Productos Activos:** Solo permite vender productos activos
3. **Pertenencia al Negocio:** Todos los productos deben pertenecer 
al negocio
4. **Integridad de Datos:** Transacciones atómicas para consistencia
5. **Auditoría:** Registro completo de cambios y eliminaciones

---

## 📊 Estados de Venta

|  Estado                     |  Descripción                           |  Acciones Permitidas  |
| --------------------------- | -------------------------------------- | --------------------- |
|  `PENDING`                  |  Venta creada, pendiente de completar  |  Modificar,           |
| Eliminar (hard), Completar  |
|  `COMPLETED`                |  Venta finalizada y confirmada         |  Modificar (refund),  |
| Eliminar (soft)             |
|  `CANCELLED`                |  Venta cancelada                       |  Solo consulta        |
|  `REFUNDED`                 |  Venta reembolsada (modificada)        |  Solo consulta        |

---

## 🔄 Flujo de Estados

```
PENDING ──┬──> COMPLETED ──┬──> REFUNDED (al modificar)
│                 └──> CANCELLED (al eliminar)
└──> CANCELLED (al eliminar o cancelar)

```

---

## 📈 Casos de Uso Comunes

### 1. Venta Simple

```json
POST /sales/register
{
  "businessId": "uuid",
  "items": [{"productId": "uuid", "quantity": 1, "price": 25.00}]
}
```

### 2. Venta con Cliente Nuevo

```json
POST /sales/register
{
  "businessId": "uuid",
  "items": [{"productId": "uuid", "quantity": 2, "price": 15.00}],
  "clientData": {
    "dni": "12345678",
    "name": "Cliente Nuevo",
    "email": "cliente@email.com"
  }
}
```

### 3. Modificar Cantidad de Productos

```json
PATCH /sales/business/uuid/update/uuid
{
  "items": [{"productId": "uuid", "quantity": 3, "price": 15.00}]
}
```

### 4. Cambiar Solo el Estado

```json
PATCH /sales/business/uuid/update/uuid
{
  "status": "COMPLETED"
}
```

---

## 🚨 Manejo de Errores

### Errores Comunes

|  Código    |  Error                      |  Descripción                          |
| ---------- | --------------------------- | ------------------------------------- |
|  400       |  `INSUFFICIENT_STOCK`       |  Stock insuficiente para el producto  |
|  404       |  `SALE_NOT_FOUND`           |  Venta no encontrada                  |
|  404       |  `PRODUCT_NOT_FOUND`        |  Producto no encontrado               |
|  403       |  `BUSINESS_ACCESS_DENIED`   |  Sin acceso al negocio                |
|  400       |  `INVALID_SALE_STATUS`      |  Estado de venta inválido para la     |
| operación  |
|  400       |  `CANNOT_MODIFY_CANCELLED`  |  No se puede modificar una venta      |
| cancelada  |

### Ejemplo de Response de Error

```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para el producto 'Producto A'. 
  Stock disponible: 5, cantidad solicitada: 10",
  "error": "INSUFFICIENT_STOCK",
  "details": {
    "productId": "550e8400-e29b-41d4-a716-446655440002",
    "availableStock": 5,
    "requestedQuantity": 10
  }
}
```

---

## 📝 Notas de Implementación

### Transacciones
Todas las operaciones críticas (crear, modificar, eliminar) se 
ejecutan dentro de transacciones Prisma para garantizar la 
consistencia de datos.

### Auditoría
El sistema mantiene un registro completo de:
- Ventas originales (soft delete)
- Cambios de estado
- Restauración de stock
- Creación de nuevas ventas por modificaciones

### Performance
- Paginación en listados
- Índices en campos de búsqueda frecuente
- Carga selectiva de relaciones

### Escalabilidad
- Preparado para reportes y analytics
- Estructura compatible con sistemas de facturación
- Integración futura con sistemas de pago

---

*Documentación del Módulo de Ventas v1.0*  
_Última actualización: Enero 2025_

```

```
