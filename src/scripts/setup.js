const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurar la ruta correcta al .env.production
const envPath = path.join(__dirname, '../../.env.production');
require('dotenv').config({ path: envPath });

async function setupDatabase() {
  // Verificar que el archivo existe
  if (!fs.existsSync(envPath)) {
    console.error(`Error: No se encuentra el archivo .env.production en ${envPath}`);
    process.exit(1);
  }

  // Verificar que tenemos las variables necesarias
  if (!process.env.POSTGRES_URL) {
    console.error('Error: POSTGRES_URL no está definida en .env.production');
    console.log('Variables disponibles:', Object.keys(process.env));
    process.exit(1);
  }

  console.log('Usando archivo .env.production en:', envPath);
  console.log('URL de conexión encontrada:', process.env.POSTGRES_URL.substring(0, 20) + '...');

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + "?sslmode=require",
    ssl: true
  });

  try {
    // Verificar la conexión
    await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a la base de datos');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar las queries
    await pool.query(sql);
    
    // Crear usuario admin por defecto
    const adminQuery = `
      INSERT INTO "user" (username, email, password, role)
      VALUES (
        'admin',
        'admin@example.com',
        '$2b$10$X4kv7j3nDyF9CrwqX9QnrOBsAgHR6gQRHN6uHMvTXWrE0meMxw2Ne',
        'ADMIN'
      )
      ON CONFLICT (username) DO NOTHING;
    `;
    
    await pool.query(adminQuery);
    
    console.log('Base de datos configurada exitosamente');
  } catch (error) {
    console.error('Error configurando la base de datos:', error);
    console.error('Detalles del error:', error.stack);
  } finally {
    await pool.end();
  }
}

setupDatabase();