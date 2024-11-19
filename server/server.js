import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import axios from 'axios';
const { Client } = pkg;

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Настройки подключения к PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'shop',
  password: 'password',
  port: 5432,
});

client.connect().then(() => {
  console.log('Connected to the database');
}).catch(err => {
  console.error('Connection error', err.stack);
});

// Функция отправки события в сервис истории
const logAction = async (product_id, shop_id, action, details) => {
  try {
    await axios.post('http://localhost:3001/history', {
      product_id,
      shop_id,
      action,
      details
    });
    console.log('Action logged successfully');
  } catch (err) {
    console.error('Error logging action', err);
  }
};

// Создание магазина
app.post('/shops', async (req, res) => {
  const { name, location } = req.body;
  console.log('Request data for shop creation:', { name, location });
  try {
    const result = await client.query(
      'INSERT INTO shops (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    );
    // Логируем действие в сервис истории (создание магазина)
    await logAction(null, null, 'create_shop', { name, location });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating shop:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/products', async (req, res) => {
  const { plu, name, shop_name } = req.body;
  console.log('Request data for product creation:', { plu, name, shop_name });

  try {
    // Проверяем, существует ли товар с таким PLU
    const existingProduct = await client.query(
      'SELECT * FROM products WHERE plu = $1',
      [plu]
    );

    let productId;
    if (existingProduct.rows.length > 0) {

      // Если товар существует, берем его ID
      productId = existingProduct.rows[0].id;
    } else {
      // Если товара нет, создаем его
      const newProduct = await client.query(
        'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING id',
        [plu, name]
      );
      productId = newProduct.rows[0].id;
    }

    // Проверяем, существует ли магазин с таким именем
    const existingShop = await client.query(
      'SELECT * FROM shops WHERE name = $1',
      [shop_name]
    );

    let shopId;
    if (existingShop.rows.length > 0) {

      // Если магазин существует, берем его ID
      shopId = existingShop.rows[0].id;
    } else {

      // Если магазина нет, создаем его
      const newShop = await client.query(
        'INSERT INTO shops (name) VALUES ($1) RETURNING id',
        [shop_name]
      );
      shopId = newShop.rows[0].id;
    }

    

    // Проверяем, существует ли связь между товаром и магазином
    const existingStock = await client.query(
      'SELECT * FROM stocks WHERE product_id = $1 AND shop_id = $2',
      [productId, shopId]
    );

    if (existingStock.rows.length > 0) {

      // Если связь уже существует, возвращаем сообщение об ошибке
      return res.status(400).json({ error: 'This product is already assigned to this shop' });
    }

    // Добавляем связь в таблицу stocks
    await client.query(
      `INSERT INTO stocks (product_id, shop_id, shelf_quantity, order_quantity) 
      VALUES ($1, $2, 0, 0)`,
      [productId, shopId]
    );

    // Логируем действие в сервис истории (создание товара или связи)
    await logAction(productId, shopId, 'create_product', { plu, name, shop_name, shelf_quantity: 0, order_quantity: 0 });

    res.status(201).json({ message: 'Product created and linked to shop successfully' });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// Создание остатка
app.post('/stocks', async (req, res) => {
  const { product_id, shop_id, shelf_quantity, order_quantity } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO stocks (product_id, shop_id, shelf_quantity, order_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, shop_id, shelf_quantity, order_quantity]
    );

    // Логируем действие в сервис истории
    await logAction(product_id, shop_id, 'create_stock', { shelf_quantity, order_quantity });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Изменение остатков
app.put('/stocks', async (req, res) => {
  const { product_id, shop_id, shelf_quantity, order_quantity } = req.body;

  if (!product_id || !shop_id) {
    return res.status(400).json({ error: 'Product ID and Shop ID are required' });
  }

  try {
    const updates = [];
    const values = [];

    if (shelf_quantity !== undefined) {
      updates.push(`shelf_quantity = $${updates.length + 1}`);
      values.push(shelf_quantity);
    }

    if (order_quantity !== undefined) {
      updates.push(`order_quantity = $${updates.length + 1}`);
      values.push(order_quantity);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE stocks
      SET ${updates.join(', ')}
      WHERE product_id = $${updates.length + 1} AND shop_id = $${updates.length + 2}
      RETURNING *
    `;
    values.push(product_id, shop_id);

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    await logAction(result.rows[0].product_id, result.rows[0].shop_id, 'put', {product_id, shop_id, shelf_quantity, order_quantity });
    res.json({ success: true, stock: result.rows[0] });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Получение остатков по фильтрам
app.get('/stocks', async (req, res) => {
  const { plu, shop_id, shelf_quantity, order_quantity } = req.query;

  let query = 'SELECT * FROM stocks WHERE 1=1';
  let values = [];

  if (plu) {
    query += ` AND product_id IN (SELECT id FROM products WHERE plu = $${values.length + 1})`;
    values.push(plu);
  }

  if (shop_id) {
    query += ` AND shop_id = $${values.length + 1}`;
    values.push(Number(shop_id));
  }

  if (shelf_quantity) {
    query += ` AND shelf_quantity >= $${values.length + 1}`;
    values.push(Number(shelf_quantity));
  }

  if (order_quantity) {
    query += ` AND order_quantity >= $${values.length + 1}`;
    values.push(Number(order_quantity));
  }

  try {
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получение товаров по фильтрам
app.get('/products', async (req, res) => {
  const { name, plu } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  let values = [];

  if (name) {
    query += ' AND name ILIKE $1';
    values.push(`%${name}%`);
  }

  if (plu) {
    query += ' AND plu = $2';
    values.push(plu);
  }

  try {
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получение магазинов
app.get('/shops', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM shops');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Запуск сервера
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});