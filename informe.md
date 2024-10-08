# Informe de Funcionalidades de la API de Reservas Deportivas

## Introducción

Este informe detalla las funcionalidades implementadas en la API de Reservas Deportivas. La API está construida utilizando NestJS y proporciona endpoints para la gestión de usuarios, autenticación, reservas y equipos.

## Autenticación y Autorización

La API utiliza JSON Web Tokens (JWT) para la autenticación y autorización. Se implementa un sistema de roles (ADMIN, JUGADOR) para controlar el acceso a ciertas funcionalidades.

### Endpoints de Autenticación

#### 1. Registro de Usuario

- **Endpoint**: `POST /auth/register`
- **Descripción**: Registra un nuevo usuario en el sistema.
- **Parámetros**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Respuesta**: 
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "accessToken": "string",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

#### 2. Inicio de Sesión

- **Endpoint**: `POST /auth/login`
- **Descripción**: Autentica a un usuario y devuelve un token de acceso.
- **Parámetros**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Respuesta**:
  ```json
  {
    "access_token": "string",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

#### 3. Cierre de Sesión

- **Endpoint**: `POST /auth/logout`
- **Descripción**: Invalida el token de acceso del usuario.
- **Autenticación**: Requiere token JWT.
- **Respuesta**:
  ```json
  {
    "message": "Logout exitoso"
  }
  ```

## Gestión de Usuarios

### Endpoints de Usuarios

#### 1. Crear Usuario (Solo Admin)

- **Endpoint**: `POST /users`
- **Descripción**: Crea un nuevo usuario (solo accesible para administradores).
- **Autenticación**: Requiere token JWT y rol ADMIN.
- **Parámetros**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```
- **Respuesta**: Detalles del usuario creado.

#### 2. Listar Usuarios (Solo Admin)

- **Endpoint**: `GET /users`
- **Descripción**: Obtiene una lista de todos los usuarios.
- **Autenticación**: Requiere token JWT y rol ADMIN.
- **Respuesta**: Array de usuarios.

#### 3. Obtener Usuario por ID (Solo Admin)

- **Endpoint**: `GET /users/:id`
- **Descripción**: Obtiene los detalles de un usuario específico.
- **Autenticación**: Requiere token JWT y rol ADMIN.
- **Respuesta**: Detalles del usuario.

#### 4. Actualizar Usuario (Solo Admin)

- **Endpoint**: `PUT /users/:id`
- **Descripción**: Actualiza los datos de un usuario.
- **Autenticación**: Requiere token JWT y rol ADMIN.
- **Parámetros**: Datos del usuario a actualizar.
- **Respuesta**: Detalles del usuario actualizado.

#### 5. Eliminar Usuario (Solo Admin)

- **Endpoint**: `DELETE /users/:id`
- **Descripción**: Elimina un usuario del sistema.
- **Autenticación**: Requiere token JWT y rol ADMIN.
- **Respuesta**: Confirmación de eliminación.

## Gestión de Reservas

### Endpoints de Reservas

#### 1. Crear Reserva

- **Endpoint**: `POST /reservas/crear`
- **Descripción**: Crea una nueva reserva.
- **Autenticación**: Requiere token JWT.
- **Parámetros**:
  ```json
  {
    "nombreReservante": "string",
    "correo": "string",
    "telefono": "string",
    "cantidadPersonas": "number",
    "fechaHora": "Date",
    "deporte": "string"
  }
  ```
- **Respuesta**: Detalles de la reserva creada.

#### 2. Listar Reservas

- **Endpoint**: `GET /reservas/listar`
- **Descripción**: Obtiene una lista de todas las reservas.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Array de reservas.

#### 3. Obtener Reserva por ID

- **Endpoint**: `GET /reservas/buscar/:id`
- **Descripción**: Obtiene los detalles de una reserva específica.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Detalles de la reserva.

#### 4. Actualizar Reserva

- **Endpoint**: `PATCH /reservas/editar/:id`
- **Descripción**: Actualiza los datos de una reserva.
- **Autenticación**: Requiere token JWT.
- **Parámetros**: Datos de la reserva a actualizar.
- **Respuesta**: Detalles de la reserva actualizada.

#### 5. Cancelar Reserva

- **Endpoint**: `DELETE /reservas/cancelar/:id`
- **Descripción**: Cancela una reserva existente.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Confirmación de cancelación.

## Gestión de Equipos

### Endpoints de Equipos

#### 1. Crear Equipo

- **Endpoint**: `POST /equipos/create`
- **Descripción**: Crea un nuevo equipo.
- **Autenticación**: Requiere token JWT.
- **Parámetros**:
  ```json
  {
    "nombre": "string"
  }
  ```
- **Respuesta**: Detalles del equipo creado.

#### 2. Listar Equipos

- **Endpoint**: `GET /equipos/list`
- **Descripción**: Obtiene una lista de todos los equipos.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Array de equipos.

#### 3. Obtener Equipo por ID

- **Endpoint**: `GET /equipos/:id`
- **Descripción**: Obtiene los detalles de un equipo específico.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Detalles del equipo.

#### 4. Añadir Jugador a Equipo

- **Endpoint**: `PATCH /equipos/:id/add-jugador/:jugadorId`
- **Descripción**: Añade un jugador a un equipo.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Equipo actualizado con el nuevo jugador.

#### 5. Eliminar Jugador de Equipo

- **Endpoint**: `PATCH /equipos/:id/remove-jugador/:jugadorId`
- **Descripción**: Elimina un jugador de un equipo.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Equipo actualizado sin el jugador.

#### 6. Eliminar Equipo

- **Endpoint**: `DELETE /equipos/:id`
- **Descripción**: Elimina un equipo del sistema.
- **Autenticación**: Requiere token JWT.
- **Respuesta**: Confirmación de eliminación.

## Implementación de Características Clave

### Autenticación y Autorización

- Se utiliza `@nestjs/jwt` para generar y verificar tokens JWT.
- Los guards `JwtAuthGuard` y `RolesGuard` se utilizan para proteger rutas y verificar roles.
- El decorador `@Roles()` se usa para especificar los roles requeridos para acceder a ciertas rutas.

### Persistencia en Base de Datos

- Se utiliza TypeORM para la interacción con la base de datos PostgreSQL.
- Las entidades (`User`, `Reserva`, `Equipo`) se definen utilizando decoradores de TypeORM.
- Los servicios (`UsersService`, `ReservasService`, `EquiposService`) utilizan repositorios de TypeORM para realizar operaciones CRUD.

## Conclusión

La API implementa un sistema completo de gestión de reservas deportivas, incluyendo autenticación, autorización y persistencia de datos. Se han implementado medidas de seguridad como la protección de rutas y la validación de roles para garantizar un acceso seguro a los recursos.