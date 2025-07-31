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

**Endpoints comentados (preparados para OAuth):**

- GET `/auth/google` - Autenticación con Google
- GET `/auth/google/redirect` - Callback de Google OAuth
- GET `/auth/profile` - Obtener perfil del usuario autenticado
- GET `/auth/protected` - Ruta protegida con verificación de email

### 👤 Módulo de Usuarios (UserController)

**Ruta base:** `/users`

| Método | Endpoint                | Descripción                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/users/create-profile` | Crear perfil de propietario |

**Endpoints comentados:**

- POST `/users/create-employee` - Crear empleado

### 🏢 Módulo de Negocios (BusinessController)

**Ruta base:** `/business`

| Método | Endpoint                    | Descripción         |
| ------ | --------------------------- | ------------------- |
| POST   | `/business/create-business` | Crear nuevo negocio |

### 🎯 Módulo de Onboarding (OnboardingController)

**Ruta base:** `/onboarding`

| Método | Endpoint                       | Descripción                         |
| ------ | ------------------------------ | ----------------------------------- |
| POST   | `/onboarding/complete-profile` | Completar perfil durante onboarding |

### 📦 Módulo de Productos (ProductsController)

**Ruta base:** `/products`

| Método | Endpoint                                       | Descripción                                              |
| ------ | ---------------------------------------------- | -------------------------------------------------------- |
| POST   | `/products`                                    | Crear nuevo producto                                     |
| GET    | `/products/business/:businessId`               | Obtener productos por negocio (con filtros y paginación) |
| GET    | `/products/:id/business/:businessId`           | Obtener producto específico                              |
| PATCH  | `/products/:id/business/:businessId`           | Actualizar producto                                      |
| DELETE | `/products/:id/business/:businessId`           | Eliminar producto (soft delete)                          |
| DELETE | `/products/:id/business/:businessId/permanent` | Eliminar producto permanentemente                        |
| GET    | `/products/business/:businessId/featured`      | Obtener productos destacados                             |
| GET    | `/products/business/:businessId/low-stock`     | Obtener productos con stock bajo _(no implementado)_     |

**Parámetros de consulta para `/products/business/:businessId`:**

- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `search` (string): Búsqueda por nombre o descripción
- `categoryId` (UUID): Filtrar por categoría
- `isActive` (boolean): Filtrar por estado activo

### 🏷️ Módulo de Categorías (CategoriesController)

**Ruta base:** `/categories`

| Método | Endpoint                           | Descripción                                 |
| ------ | ---------------------------------- | ------------------------------------------- |
| POST   | `/categories`                      | Crear nueva categoría                       |
| GET    | `/categories`                      | Obtener todas las categorías con filtros    |
| GET    | `/categories/global`               | Obtener solo categorías globales            |
| GET    | `/categories/business/:businessId` | Obtener categorías de un negocio específico |
| GET    | `/categories/:id`                  | Obtener categoría específica                |
| PATCH  | `/categories/:id`                  | Actualizar categoría                        |
| DELETE | `/categories/:id`                  | Eliminar categoría                          |
| GET    | `/categories/hierarchy/tree`       | Obtener jerarquía completa de categorías    |
| GET    | `/categories/stats/summary`        | Obtener estadísticas de categorías          |

**Parámetros de consulta para `/categories`:**

- `businessId` (UUID): Filtrar por negocio específico
- `includeGlobal` (boolean): Incluir categorías globales (default: true)
- `includeHierarchy` (boolean): Incluir jerarquía completa (default: false)

## 📊 Resumen de Endpoints

- **Total de endpoints activos:** 23
- **Endpoints comentados/preparados:** 4
- **Módulos implementados:** 6
- **Endpoints con autenticación:** 0 (temporalmente deshabilitada para testing)

## 🔧 Estado de Implementación

### ✅ Completamente Implementados

- **Autenticación:** Sistema completo de registro, login y verificación
- **Productos:** CRUD completo con filtros avanzados
- **Categorías:** CRUD completo con jerarquías y categorías globales

### ⚠️ Parcialmente Implementados

- **Usuarios:** Solo creación de perfiles de propietario
- **Negocios:** Solo creación de negocios
- **Onboarding:** Solo completar perfil

### ❌ Pendientes de Implementación

- Sistema de empleados
- Gestión de roles y permisos
- OAuth con Google
- Reportes y analytics
- Sistema de inventario avanzado

## 🚀 Recomendaciones de Nuevos Endpoints

### 🔐 Autenticación y Autorización

GET /auth/profile - Obtener perfil del usuario autenticado
POST /auth/refresh-token - Renovar token de acceso
POST /auth/logout - Cerrar sesión
GET /auth/google - Iniciar autenticación con Google
GET /auth/google/redirect - Callback de Google OAuth
POST /auth/change-password - Cambiar contraseña
GET /auth/verify-token - Verificar validez del token

### 👥 Gestión de Usuarios y Empleados

GET /users - Listar usuarios (admin)
GET /users/:id - Obtener usuario específico
PATCH /users/:id - Actualizar usuario
DELETE /users/:id - Eliminar usuario
POST /users/create-employee - Crear empleado
GET /users/business/:businessId - Obtener usuarios de un negocio
PATCH /users/:id/role - Cambiar rol de usuario
PATCH /users/:id/status - Activar/desactivar usuario

### 🏢 Gestión de Negocios

GET /business - Listar negocios del usuario
GET /business/:id - Obtener negocio específico
PATCH /business/:id - Actualizar negocio
DELETE /business/:id - Eliminar negocio
GET /business/:id/stats - Estadísticas del negocio
GET /business/:id/employees - Empleados del negocio
POST /business/:id/invite - Invitar empleado
PATCH /business/:id/settings - Configuraciones del negocio

### 📊 Reportes y Analytics

GET /reports/sales - Reporte de ventas
GET /reports/inventory - Reporte de inventario
GET /reports/products/performance - Rendimiento de productos
GET /reports/categories/usage - Uso de categorías
GET /reports/business/:id/summary - Resumen ejecutivo
GET /analytics/dashboard - Datos para dashboard

### 📦 Mejoras para Productos

POST /products/bulk - Crear productos en lote
PATCH /products/bulk - Actualizar productos en lote
GET /products/search - Búsqueda avanzada de productos
POST /products/:id/duplicate - Duplicar producto
GET /products/:id/history - Historial de cambios
PATCH /products/:id/stock - Actualizar stock
GET /products/export - Exportar productos
POST /products/import - Importar productos

### 🏷️ Mejoras para Categorías

POST /categories/bulk - Crear categorías en lote
POST /categories/:id/move - Mover categoría en jerarquía
GET /categories/:id/products - Productos de una categoría
POST /categories/import - Importar categorías
GET /categories/export - Exportar categorías

### 🔔 Notificaciones

GET /notifications - Obtener notificaciones
PATCH /notifications/:id/read - Marcar como leída
POST /notifications/mark-all-read - Marcar todas como leídas
DELETE /notifications/:id - Eliminar notificación

### ⚙️ Configuración del Sistema

GET /settings/business/:id - Configuraciones del negocio
PATCH /settings/business/:id - Actualizar configuraciones
GET /settings/user - Configuraciones del usuario
PATCH /settings/user - Actualizar configuraciones de usuario

### 📁 Gestión de Archivos

POST /files/upload - Subir archivo
GET /files/:id - Obtener archivo
DELETE /files/:id - Eliminar archivo
GET /files/business/:id - Archivos del negocio

## 🎯 Prioridades de Implementación

### Alta Prioridad

1. **Autenticación completa** - Habilitar guards y middleware de JWT
2. **Gestión de empleados** - Sistema completo de usuarios y roles
3. **CRUD completo de negocios** - Operaciones faltantes
4. **Sistema de archivos** - Para imágenes de productos

### Media Prioridad

1. **Reportes básicos** - Dashboard y estadísticas
2. **Notificaciones** - Sistema de alertas
3. **Búsqueda avanzada** - Filtros y búsqueda global
4. **Operaciones en lote** - Para productos y categorías

### Baja Prioridad

1. **OAuth con Google** - Autenticación social
2. **Exportación/Importación** - Funcionalidades avanzadas
3. **Analytics avanzados** - Métricas detalladas
4. **Configuraciones avanzadas** - Personalización del sistema

## 📝 Notas de Desarrollo

### Autenticación Temporal

Actualmente, los endpoints de categorías y productos tienen la autenticación comentada para facilitar el testing. En producción, se debe:

- Habilitar `JwtAuthGuard` en todos los endpoints protegidos
- Implementar `RolesGuard` para control de acceso basado en roles
- Configurar decoradores `@Roles()` según los permisos requeridos

### Validaciones

- Todos los DTOs implementan validaciones con `class-validator`
- Los UUIDs se validan automáticamente con `ParseUUIDPipe`
- Los parámetros opcionales tienen valores por defecto

### Paginación

- Los endpoints de listado implementan paginación estándar
- Parámetros: `page` (número de página) y `limit` (elementos por página)
- Respuesta incluye metadatos de paginación

### Filtros

- Búsqueda por texto en productos
- Filtros por categoría, estado activo, negocio
- Filtros booleanos para incluir/excluir elementos

---

_Última actualización: $(date)_
_Versión del sistema: 1.0.0_
