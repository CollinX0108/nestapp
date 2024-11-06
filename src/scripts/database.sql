-- Crear enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'JUGADOR');

-- Crear tablas
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role DEFAULT 'JUGADOR'
);

CREATE TABLE "reserva" (
  id SERIAL PRIMARY KEY,
  nombre_reservante VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  cantidad_personas INTEGER NOT NULL,
  fecha_hora TIMESTAMP NOT NULL,
  deporte VARCHAR(50) NOT NULL,
  usuario_id INTEGER REFERENCES "user"(id)
);

CREATE TABLE "equipo" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  dueno_id INTEGER REFERENCES "user"(id)
);

CREATE TABLE "equipo_jugadores_user" (
  equipo_id INTEGER REFERENCES "equipo"(id),
  user_id INTEGER REFERENCES "user"(id),
  PRIMARY KEY (equipo_id, user_id)
);