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

| Método | Endpoint                | Descripción                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/users/complete-profile` | Completar perfil de usuario |

**Requiere autenticación JWT**

### 🏢 Módulo de Negocios (BusinessController)

**Ruta base:** `/business`

| Método | Endpoint                    | Descripción                         | Roles Requeridos    | Guards                                    |
| ------ | --------------------------- | ----------------------------------- | ------------------- | ----------------------------------------- |
| POST   | `/business/create-business` | Crear nuevo negocio                 | OWNER               | JWT, EmailConfirmed, Roles                |
| GET    | `/business/all`             | Listar negocios del usuario         | Cualquier autenticado | JWT, EmailConfirmed                       |
| GET    | `/business/find/:businessId` | Obtener negocio específico          | Cualquier autenticado | JWT, EmailConfirmed, BusinessAccess       |
| PATCH  | `/business/update/:id`      | Actualizar negocio                  | OWNER, ADMIN        | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/business/delete/:id`      | Eliminar negocio                    | OWNER               | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/business/stats/:id`       | Obtener estadísticas del negocio    | OWNER, ADMIN        | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/business/employees/:id`   | Obtener empleados del negocio       | OWNER, ADMIN        | JWT, EmailConfirmed, BusinessAccess, Roles |
| POST   | `/business/invite/:id`      | Invitar empleado al negocio         | OWNER               | JWT, EmailConfirmed, BusinessAccess, Roles |
| PATCH  | `/business/settings/:id`    | Actualizar configuraciones del negocio | OWNER               | JWT, EmailConfirmed, BusinessAccess, Roles |

**Parámetros de consulta para `/business/all`:**
- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)

### 🎯 Módulo de Onboarding (OnboardingController)

**Ruta base:** `/onboarding`

| Método | Endpoint                       | Descripción                         | Roles Requeridos |
| ------ | ------------------------------ | ----------------------------------- | ---------------- |
| POST   | `/onboarding/create-business`  | Crear negocio durante onboarding    | OWNER            |
| POST   | `/onboarding/create-products`  | Crear productos durante onboarding  | OWNER            |
| POST   | `/onboarding/create-categories`| Crear categorías durante onboarding | OWNER            |

**Todos los endpoints requieren: JWT, EmailConfirmed, Roles**

### 📦 Módulo de Productos (ProductsController)

**Ruta base:** `/products`

| Método | Endpoint                                       | Descripción                                              | Roles Requeridos        | Guards                                    |
| ------ | ---------------------------------------------- | -------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| POST   | `/products`                                    | Crear nuevo producto                                     | OWNER, ADMIN, EMPLOYEE  | JWT, EmailConfirmed, Roles                |
| GET    | `/products/business/:businessId`               | Obtener productos por negocio (con filtros y paginación) | Cualquier autenticado   | JWT, EmailConfirmed, BusinessAccess       |
| GET    | `/products/business/:businessId/:id`           | Obtener producto específico                              | Cualquier autenticado   | JWT, EmailConfirmed, BusinessAccess       |
| PATCH  | `/products/business/:businessId/update/:id`    | Actualizar producto                                      | OWNER, ADMIN, EMPLOYEE  | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/products/business/:businessId/delete/:id`    | Eliminar producto (soft delete)                          | OWNER, ADMIN            | JWT, EmailConfirmed, BusinessAccess, Roles |
| DELETE | `/products/business/:businessId/permanent/:id` | Eliminar producto permanentemente                        | OWNER                   | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/products/business/:businessId/featured`      | Obtener productos destacados                             | OWNER, ADMIN            | JWT, EmailConfirmed, BusinessAccess, Roles |
| GET    | `/products/business/:businessId/low-stock`     | Obtener productos con stock bajo *(no implementado)*     | OWNER, ADMIN            | JWT, EmailConfirmed, BusinessAccess, Roles |

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

| Método | Endpoint                           | Descripción                                 | Roles Requeridos    | Guards                                    |
| ------ | ---------------------------------- | ------------------------------------------- | ------------------- | ----------------------------------------- |
| POST   | `/categories`                      | Crear nueva categoría                       | OWNER, ADMIN        | JWT, EmailConfirmed, Roles                |
| GET    | `/categories`                      | Obtener todas las categorías con filtros    | Cualquier autenticado | JWT, EmailConfirmed                       |
| GET    | `/categories/business/:businessId` | Obtener categorías de un negocio específico | Cualquier autenticado | JWT, EmailConfirmed, BusinessAccess       |
| GET    | `/categories/:id`                  | Obtener categoría específica                | Cualquier autenticado | JWT, EmailConfirmed                       |
| PATCH  | `/categories/:id`                  | Actualizar categoría                        | OWNER, ADMIN        | JWT, EmailConfirmed, Roles                |
| DELETE | `/categories/:id`                  | Eliminar categoría                          | OWNER, ADMIN        | JWT, EmailConfirmed, Roles                |
| GET    | `/categories/hierarchy/tree`       | Obtener jerarquía completa de categorías    | Público             | Ninguno (@Public)                         |
| GET    | `/categories/stats/summary`        | Obtener estadísticas de categorías          | OWNER, ADMIN        | JWT, EmailConfirmed, Roles                |

**Parámetros de consulta para `/categories`:**
- `businessId` (UUID): Filtrar por negocio específico
- `includeHierarchy` (boolean): Incluir jerarquía completa (default: false)

**Parámetros de consulta para `/categories/business/:businessId`:**
- `includeHierarchy` (boolean): Incluir jerarquía completa (default: false)

**Parámetros de consulta para `/categories/hierarchy/tree`:**
- `businessId` (UUID): Filtrar por negocio específico

**Parámetros de consulta para `/categories/stats/summary`:**
- `businessId` (UUID): Filtrar por negocio específico

### 📧 Módulo de Mail (MailController)

**Ruta base:** `/mail`

| Método | Endpoint                | Descripción                    | Guards    |
| ------ | ----------------------- | ------------------------------ | --------- |
| GET    | `/mail/verify-connection` | Verificar conexión del servicio de correo | Público (@Public) |
| POST   | `/mail/send-test`       | Enviar correo de prueba        | Público (@Public) |

**Parámetros para `/mail/send-test`:**
- `to` (string): Dirección de correo destino

## 📊 Resumen de Endpoints

- **Total de endpoints activos:** 32
- **Endpoints públicos:** 8
- **Endpoints con autenticación:** 24
- **Módulos implementados:** 7

## 🔧 Estado de Implementación

### ✅ Completamente Implementados

- **Autenticación:** Sistema completo de registro, login, verificación y recuperación de contraseña
- **Productos:** CRUD completo con filtros avanzados, soft delete y endpoints de utilidad
- **Categorías:** CRUD completo con jerarquías (solo categorías de negocio)
- **Negocios:** CRUD completo con estadísticas, empleados e invitaciones
- **Mail:** Sistema de verificación y envío de correos de prueba

### ⚠️ Parcialmente Implementados

- **Usuarios:** Solo completar perfil
- **Onboarding:** Endpoints básicos para creación durante onboarding
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

*Última actualización: $(date)*
*Versión del sistema: 2.0.0*
