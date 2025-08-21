# Documentación de Endpoints - Sistema ERP

## 📋 Endpoints Actuales por Módulo

### 🏠 Módulo Principal (AppController)

**Ruta base:** `/`

| Método | Endpoint | Descripción                                  |
| ------ | -------- | -------------------------------------------- |
| GET    | `/`      | Endpoint de salud que retorna "Hello World!" |

### 🔐 Módulo de Autenticación (AuthController)

**Ruta base:** `/auth`

| Método | Endpoint                    | Descripción                               |
| ------ | --------------------------- | ----------------------------------------- |
| POST   | `/auth/create-account`      | Crear nueva cuenta de usuario             |
| POST   | `/auth/confirm-email`       | Confirmar email con token de verificación |
| POST   | `/auth/resend-verification` | Reenviar email de verificación            |
| POST   | `/auth/forgot-password`     | Solicitar restablecimiento de contraseña  |
| POST   | `/auth/reset-password`      | Restablecer contraseña con token          |
| POST   | `/auth/login`               | Iniciar sesión con credenciales           |

**Todos los endpoints son públicos (@Public())**

### 👤 Módulo de Usuarios (UserController)

**Ruta base:** `/users`

| Método | Endpoint                   | Descripción                       | Roles Requeridos      | Guards              |
| ------ | -------------------------- | --------------------------------- | --------------------- | ------------------- |
| POST   | `/users/complete-profile`  | Completar perfil de usuario       |
| PATCH  | `/users/change-password`   | Cambiar contraseña del usuario    | Cualquier autenticado | JWT, EmailConfirmed |
| GET    | `/users/me`                | Obtener perfil del usuario actual | Cualquier autenticado | JWT, EmailConfirmed |
| POST   | `/users/accept-invitation` | Aceptar invitación a un negocio   | Cualquier autenticado | JWT, EmailConfirmed |

**Requiere autenticación JWT**

### 🏢 Módulo de Negocios (BusinessController)

**Ruta base:** `/business`

| Método | Endpoint                                  | Descripción                                 | Roles Requeridos      | Guards                                     |
| ------ | ----------------------------------------- | ------------------------------------------- | --------------------- | ------------------------------------------ |
| POST   | `/business/create-business`               | Crear nuevo negocio                         | OWNER                 | JWT, EmailConfirmed, Roles                 |
| GET    | `/business/all`                           | Listar negocios del usuario                 | Cualquier autenticado | JWT, EmailConfirmed                        |
| GET    | `/business/find/:businessId`              | Obtener negocio específico                  | Cualquier autenticado | JWT, EmailConfirmed, BusinessAccess        |
| PATCH  | `/business/update/:id`                    | Actualizar negocio                          | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/business/delete/:id`                    | Eliminar negocio                            | OWNER                 | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/business/stats/:id`                     | Obtener estadísticas del negocio            | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/business/employees/:id`                 | Obtener empleados del negocio               | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |
| POST   | `/business/invite/:id`                    | Invitar empleado al negocio                 | OWNER                 | JWT, EmailConfirmed, BusinessAccess, Roles |
| PATCH  | `/business/settings/:id`                  | Actualizar configuraciones del negocio      | OWNER                 | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/business/invitations/:id`               | Obtener invitaciones pendientes del negocio | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/business/invitations/:id/:invitationId` | Cancelar una invitación pendiente           | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |

**Parámetros de consulta para `/business/all`:**

- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)

### 🎯 Módulo de Onboarding (OnboardingController)

**Ruta base:** `/onboarding`

| Método | Endpoint                                             | Descripción                         | Roles Requeridos | Guards                                     |
| ------ | ---------------------------------------------------- | ----------------------------------- | ---------------- | ------------------------------------------ |
| POST   | `/onboarding/create-business`                        | Crear negocio durante onboarding    | OWNER            | JWT, EmailConfirmed, Roles                 |
| POST   | `/onboarding/business/:businessId/create-products`   | Crear productos durante onboarding  | OWNER, ADMIN     | JWT, EmailConfirmed, BusinessAccess, Roles |
| POST   | `/onboarding/business/:businessId/create-categories` | Crear categorías durante onboarding | OWNER, ADMIN     | JWT, EmailConfirmed, BusinessAccess, Roles |

**Todos los endpoints requieren: JWT, EmailConfirmed, Roles**

### 📦 Módulo de Productos (ProductsController)

**Ruta base:** `/products`

| Método | Endpoint                                       | Descripción                                              | Roles Requeridos       | Guards                                     |
| ------ | ---------------------------------------------- | -------------------------------------------------------- | ---------------------- | ------------------------------------------ |
| POST   | `/products`                                    | Crear nuevo producto                                     | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, Roles                 |
| GET    | `/products/business/:businessId`               | Obtener productos por negocio (con filtros y paginación) | Cualquier autenticado  | JWT, EmailConfirmed, BusinessAccess        |
| GET    | `/products/business/:businessId/:id`           | Obtener producto específico                              | Cualquier autenticado  | JWT, EmailConfirmed, BusinessAccess        |
| PATCH  | `/products/business/:businessId/update/:id`    | Actualizar producto                                      | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/products/business/:businessId/delete/:id`    | Eliminar producto (soft delete)                          | OWNER, ADMIN           | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/products/business/:businessId/permanent/:id` | Eliminar producto permanentemente                        | OWNER                  | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/products/business/:businessId/featured`      | Obtener productos destacados                             | OWNER, ADMIN           | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/products/business/:businessId/low-stock`     | Obtener productos con stock bajo _(no implementado)_     | OWNER, ADMIN           | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/products/business/:businessId/low-stock`     | Obtener productos con stock bajo _(IMPLEMENTADO)_        | OWNER, ADMIN           | JWT, EmailConfirmed, BusinessAccess, Roles |

**Parámetros de consulta para `/products/business/:businessId`:**

- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `search` (string): Búsqueda por nombre o descripción
- `categoryId` (UUID): Filtrar por categoría
- `isActive` (boolean): Filtrar por estado activo

**Parámetros de consulta para `/products/business/:businessId/featured`:**

- `limit` (number): Número de productos (default: 5)

**Parámetros de consulta para `/products/business/:businessId/low-stock`:**

- `threshold` (number): Umbral de stock bajo (default: 10)

### 🏷️ Módulo de Categorías (CategoriesController)

**Ruta base:** `/categories`

| Método | Endpoint                                      | Descripción                                 | Roles Requeridos      | Guards                                     |
| ------ | --------------------------------------------- | ------------------------------------------- | --------------------- | ------------------------------------------ |
| POST   | `/categories`                                 | Crear nueva categoría                       | OWNER, ADMIN          | JWT, EmailConfirmed, Roles                 |
| GET    | `/categories`                                 | Obtener todas las categorías con filtros    | Cualquier autenticado | JWT, EmailConfirmed                        |
| GET    | `/categories/business/:businessId`            | Obtener categorías de un negocio específico | Cualquier autenticado | JWT, EmailConfirmed, BusinessAccess        |
| GET    | `/categories/:id`                             | Obtener categoría específica                | Cualquier autenticado | JWT, EmailConfirmed                        |
| PATCH  | `/categories/:id`                             | Actualizar categoría                        | OWNER, ADMIN          | JWT, EmailConfirmed, Roles                 |
| DELETE | `/categories/:id`                             | Eliminar categoría                          | OWNER, ADMIN          | JWT, EmailConfirmed, Roles                 |
| GET    | `/categories/hierarchy/tree`                  | Obtener jerarquía completa de categorías    | Público               | Ninguno (@Public)                          |
| GET    | `/categories/stats/summary`                   | Obtener estadísticas de categorías          | OWNER, ADMIN          | JWT, EmailConfirmed, Roles                 |
| POST   | `/categories/business/:businessId/new`        | Crear nueva categoría                       | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |
| PATCH  | `/categories/business/:businessId/update/:id` | Actualizar categoría                        | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/categories/business/:businessId/delete/:id` | Eliminar categoría                          | OWNER, ADMIN          | JWT, EmailConfirmed, BusinessAccess, Roles |

**Parámetros de consulta para `/categories`:**

- `businessId` (UUID): Filtrar por negocio específico
- `includeHierarchy` (boolean): Incluir jerarquía completa (default: false)

**Parámetros de consulta para `/categories/business/:businessId`:**

- `includeHierarchy` (boolean): Incluir jerarquía completa (default: false)

**Parámetros de consulta para `/categories/hierarchy/tree`:**

- `businessId` (UUID): Filtrar por negocio específico

**Parámetros de consulta para `/categories/stats/summary`:**

- `businessId` (UUID): Filtrar por negocio específico

### 💰 Módulo de Ventas (SalesController)

**Ruta base:** `/sales`

| Método | Endpoint                                     | Descripción                                           | Roles Requeridos | Guards                                     |
| ------ | -------------------------------------------- | ----------------------------------------------------- | ---------------- | ------------------------------------------ |
| POST   | `/sales/register`                            | Registrar nueva venta                                 | OWNER, EMPLOYEE  | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/sales/business/:businessId/all`            | Obtener todas las ventas con filtros y paginación     | OWNER, EMPLOYEE  | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/sales/business/:businessId/sale/:saleId`   | Obtener venta específica                              | OWNER, EMPLOYEE  | JWT, EmailConfirmed, BusinessAccess, Roles |
| PATCH  | `/sales/business/:businessId/update/:saleId` | Actualizar/modificar venta (estrategia refund/cancel) | OWNER, EMPLOYEE  | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/sales/business/:businessId/delete/:saleId` | Eliminar venta (soft delete para completadas)         | OWNER, EMPLOYEE  | JWT, EmailConfirmed, BusinessAccess, Roles |

**Parámetros de consulta para `/sales/business/:businessId/all`:**

- `clientId` (UUID): Filtrar por cliente específico
- `status` (string): Filtrar por estado (PENDING, COMPLETED, CANCELLED, REFUNDED)
- `startDate` (string): Fecha de inicio (formato ISO)
- `endDate` (string): Fecha de fin (formato ISO)
- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)

**Estructura de datos para crear venta (`CreateSaleDto`):**

```json
{
  "businessId": "uuid",
  "clientId": "uuid" // opcional
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 25.50
    }
  ],
  "clientData": { // opcional, para crear nuevo cliente
    "dni": "12345678",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+1234567890",
    "address": "Calle 123"
  }
}
```

**Estructura de datos para actualizar venta (`UpdateSaleDto`):**

```json
{
  "clientId": "uuid", // opcional
  "items": [
    // opcional
    {
      "productId": "uuid",
      "quantity": 1,
      "price": 30.0
    }
  ],
  "clientData": {
    // opcional
    "dni": "87654321",
    "name": "María García",
    "email": "maria@email.com",
    "phone": "+0987654321",
    "address": "Avenida 456"
  },
  "status": "COMPLETED" // opcional
}
```

### 👥 Módulo de Clientes (ClientsController)

**Ruta base:** `/clients`

| Método | Endpoint                                        | Descripción                                           | Roles Requeridos       | Guards                                     |
| ------ | ----------------------------------------------- | ----------------------------------------------------- | ---------------------- | ------------------------------------------ |
| POST   | `/clients/business/:businessId/new`             | Crear nuevo cliente                                   | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/clients/business/:businessId`                 | Obtener clientes por negocio con filtros y paginación | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/clients/business/:businessId/:id`             | Obtener cliente específico                            | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| PATCH  | `/clients/business/:businessId/update/:id`      | Actualizar cliente                                    | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/clients/business/:businessId/delete/:id`      | Eliminar cliente (soft delete)                        | OWNER, ADMIN           | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/clients/business/:businessId/:id/stats`       | Obtener estadísticas de un cliente                    | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/clients/business/:businessId/search/dni/:dni` | Buscar cliente por DNI                                | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/clients/business/:businessId/top-customers`   | Obtener clientes con más compras                      | OWNER, ADMIN, EMPLOYEE | JWT, EmailConfirmed, BusinessAccess, Roles |

**Parámetros de consulta para `/clients/business/:businessId`:**

- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `search` (string): Búsqueda por nombre o información del cliente
- `dni` (string): Filtrar por DNI específico

**Parámetros de consulta para `/clients/business/:businessId/top-customers`:**

- `limit` (number): Número de clientes top (default: 10)

**Estructura de datos para crear cliente (`CreateClientDto`):**

```json
{
  "businessId": "uuid",
  "dni": "12345678",
  "name": "Juan Pérez",
  "email": "juan@email.com", // opcional
  "phone": "+1234567890", // opcional
  "address": "Calle 123" // opcional
}
```

### 📧 Módulo de Mail (MailController)

**Ruta base:** `/mail`

| Método | Endpoint                  | Descripción                               | Guards            |
| ------ | ------------------------- | ----------------------------------------- | ----------------- |
| GET    | `/mail/verify-connection` | Verificar conexión del servicio de correo | Público (@Public) |
| POST   | `/mail/send-test`         | Enviar correo de prueba                   | Público (@Public) |

**Parámetros para `/mail/send-test`:**

- `to` (string): Dirección de correo destino

## 📊 Resumen de Endpoints

- **Total de endpoints activos:** 45 (actualizado desde 37)
- **Endpoints públicos:** 8
- **Endpoints con autenticación:** 37 (actualizado desde 29)
- **Módulos implementados:** 9 (actualizado desde 8 - se agregó Clientes)

## 🔧 Estado de Implementación

### ✅ Completamente Implementados

- **Autenticación:** Sistema completo de registro, login, verificación y recuperación de contraseña
- **Productos:** CRUD completo con filtros avanzados, soft delete y endpoints de utilidad
- **Categorías:** CRUD completo con jerarquías (solo categorías de negocio)
- **Negocios:** CRUD completo con estadísticas, empleados e invitaciones
- **Ventas:** CRUD completo con gestión de stock, clientes y estrategias avanzadas de modificación
- **Clientes:** CRUD completo con estadísticas, búsqueda por DNI y top customers
- **Mail:** Sistema de verificación y envío de correos de prueba
- **Usuarios:** Gestión completa de perfil, cambio de contraseña y aceptación de invitaciones

### ⚠️ Parcialmente Implementados

- **Usuarios:** Solo completar perfil
- **Onboarding:** Endpoints básicos para creación durante onboarding (rutas actualizadas)
- **Productos:** Endpoint de stock bajo no implementado

### ❌ Pendientes de Implementación

- Sistema completo de empleados
- OAuth con Google
- Reportes y analytics avanzados
- Sistema de archivos/uploads
- Notificaciones

## 🔐 Sistema de Seguridad

### Guards Implementados

1. **Guards de Autenticación:**

   - `JwtAuthGuard`: Todos los endpoints protegidos
   - `EmailConfirmedGuard`: Endpoints que requieren email verificado

2. **Guards de Autorización:**

   - `RolesGuard`: Endpoints con control de roles específicos
   - `BusinessAccessGuard`: Endpoints que requieren acceso a un negocio específico

3. **Decoradores:**
   - `@Public()`: Endpoints públicos
   - `@Roles()`: Especificar roles requeridos (OWNER, ADMIN, EMPLOYEE)
   - `@BusinessAccess()`: Marcar endpoints que requieren acceso a negocio

### Roles del Sistema

- **OWNER**: Propietario del negocio (todos los permisos)
- **ADMIN**: Administrador (permisos de gestión)
- **EMPLOYEE**: Empleado (permisos limitados)

## 🚀 Cambios Importantes desde la Última Versión

### ✅ Nuevos Endpoints Implementados

1. **Business Module:**

   - `GET /business/all` - Listar negocios del usuario
   - `GET /business/find/:businessId` - Obtener negocio específico
   - `PATCH /business/update/:id` - Actualizar negocio
   - `DELETE /business/delete/:id` - Eliminar negocio
   - `GET /business/stats/:id` - Estadísticas del negocio
   - `GET /business/employees/:id` - Empleados del negocio
   - `POST /business/invite/:id` - Invitar empleado
   - `PATCH /business/settings/:id` - Configuraciones del negocio

2. **Products Module:**

   - Rutas actualizadas con patrón `/business/:businessId`
   - `PATCH /products/business/:businessId/update/:id` - Actualizar producto
   - `DELETE /products/business/:businessId/delete/:id` - Soft delete
   - `DELETE /products/business/:businessId/permanent/:id` - Hard delete

3. **Categories Module:**

   - Eliminación de categorías globales
   - Todas las categorías ahora pertenecen a un negocio

4. **Mail Module:**

   - `GET /mail/verify-connection` - Verificar conexión
   - `POST /mail/send-test` - Enviar correo de prueba

5. **Onboarding Module:**

   - `POST /onboarding/create-business` - Crear negocio
   - `POST /onboarding/create-products` - Crear productos
   - `POST /onboarding/create-categories` - Crear categorías

6. **Sales Module:** _(NUEVO)_
   - `POST /sales/register` - Registrar nueva venta
   - `GET /sales/business/:businessId/all` - Listar ventas con filtros
   - `GET /sales/business/:businessId/sale/:saleId` - Obtener venta específica
   - `PATCH /sales/business/:businessId/update/:saleId` - Modificar venta
   - `DELETE /sales/business/:businessId/delete/:saleId` - Eliminar venta

### 🔄 Endpoints Modificados

- **Users:** `/users/create-profile` cambió a `/users/complete-profile`
- **Business:** Rutas más específicas y descriptivas
- **Products:** Todas las rutas ahora incluyen `businessId` para mejor seguridad
- **Categories:** Eliminación del concepto de categorías globales

### 🛡️ Mejoras de Seguridad

- Implementación completa del sistema de guards
- Control de acceso basado en roles
- Validación de acceso a negocios específicos
- Autenticación JWT habilitada en todos los endpoints protegidos

## 📝 Notas de Desarrollo

### Autenticación Activa

Todos los endpoints protegidos ahora tienen la autenticación habilitada:

- `JwtAuthGuard` para verificación de tokens
- `EmailConfirmedGuard` para usuarios con email confirmado
- `RolesGuard` para control de acceso basado en roles
- `BusinessAccessGuard` para validar acceso a negocios específicos

### Validaciones

- Todos los DTOs implementan validaciones con `class-validator`
- Los UUIDs se validan automáticamente con `ParseUUIDPipe`
- Validación de tipos con `ParseIntPipe` y `ParseBoolPipe`

### Paginación

- Los endpoints de listado implementan paginación estándar
- Parámetros: `page` (número de página) y `limit` (elementos por página)
- Respuesta incluye metadatos de paginación

### Filtros

- Búsqueda por texto en productos
- Filtros por categoría, estado activo, negocio
- Filtros booleanos para incluir/excluir elementos

---

_Última actualización: Agosto 2025_
_Versión del sistema: 2.1.0_
