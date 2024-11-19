import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

dotenv.config();

// Подключение к серверу PostgreSQL (базе данных 'postgres' для создания новой базы)
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD || 'пароль',
  port: Number(process.env.DB_PORT) || 5432,
});

export async function setupDatabase() {
  try {
    
    // Подключаемся к серверу PostgreSQL
    await client.connect();

    // Название базы данных
    const dbName = process.env.DB_NAME || 'shop';

    // Теперь подключаемся к созданной базе данных 'shop'
    client.database = dbName;
    await client.connect();

    // Создание таблиц в базе данных 'actions_history'
    await client.query(`
      CREATE TABLE actions_history (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        shop_id INT NOT NULL,
        action VARCHAR(50) NOT NULL, -- Тип действия: "create", "update", "increase", "decrease"
        action_date TIMESTAMP DEFAULT NOW(),
        details JSONB, -- Дополнительные данные об изменениях
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    console.log('Table setup completed');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await client.end();
  }
}
