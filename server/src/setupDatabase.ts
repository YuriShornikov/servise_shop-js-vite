import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

dotenv.config();

// Подключение к серверу PostgreSQL (базе данных 'postgres' для создания новой базы)
const initialClient = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres',  // Подключаемся к базе данных 'postgres'
  password: process.env.DB_PASSWORD || 'Irregularlypostgres2024!',
  port: Number(process.env.DB_PORT) || 5432,
});

export async function setupDatabase() {
  try {
    // Подключаемся к серверу PostgreSQL
    await initialClient.connect();
    console.log('Connected to PostgreSQL.');

    const dbName = process.env.DB_NAME || 'shop';
    const result = await initialClient.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    
    if (result.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      
      // Запрос на создание базы данных
      try {
        await initialClient.query(`CREATE DATABASE ${dbName};`);
        console.log(`Database '${dbName}' created successfully.`);
      } catch (error) {
        console.error(`Failed to create database '${dbName}':`, error);
      }
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }

    // Закрываем соединение с базой данных 'postgres'
    await initialClient.end();
    console.log('Connection closed.');

    // Создаём новое подключение к базе данных 'shop'
    const shopClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName, // Подключаемся к новой базе данных
      password: process.env.DB_PASSWORD || 'Irregularlypostgres2024!',
      port: Number(process.env.DB_PORT) || 5432,
    });

    await shopClient.connect();
    console.log('Connected to shop database.');

    // Создание таблиц в базе данных 'shop'
    await shopClient.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        plu VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL
      );
    `);
    console.log('Table products created.');

    await shopClient.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity_on_shelf INT NOT NULL,
        quantity_in_order INT NOT NULL,
        shop_id INT NOT NULL
      );
    `);
    console.log('Table stocks created.');

    await shopClient.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255) NOT NULL
      );
    `);
    console.log('Table actions created.');

    console.log('Database and tables setup completed');
    await shopClient.end();
  } catch (error) {
    console.error('Error setting up the database:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}
