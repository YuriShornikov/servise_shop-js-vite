import express from 'express';  // Для использования express
import pkg from 'pg';
import cors from 'cors';
const { Client } = pkg;

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
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

// Запись события в историю
app.post('/history', async (req, res) => {
  const { product_id, shop_id, action, details } = req.body;

  if (!product_id || !shop_id || !action) {
    return res.status(400).json({ error: 'product_id, shop_id, and action are required' });
  }

  try {
    await client.query(
      'INSERT INTO actions_history (product_id, shop_id, action, details) VALUES ($1, $2, $3, $4)',
      [product_id, shop_id, action, details || {}]
    );
    res.status(201).json({ message: 'Action logged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/history', async (req, res) => {
  const { shop_id, plu, date_from, date_to, action } = req.query;

  // Строим SQL запрос с параметрами пагинации
  const query = `
    SELECT * FROM actions_history
    WHERE ($1::int IS NULL OR shop_id = $1)
    AND ($2::text IS NULL OR product_id = (SELECT id FROM products WHERE plu = $2))
    AND ($3::date IS NULL OR action_date >= $3)
    AND ($4::date IS NULL OR action_date <= $4)
    AND ($5::text IS NULL OR action = $5)
  `;

  try {
    const results = await client.query(query, [shop_id || null, plu || null, date_from || null, date_to || null, action || null ]);
    res.json(results.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching history');
  }
});

// Запуск сервера
const port = 3001;
app.listen(port, () => {
  console.log(`History service is running on port ${port}`);
});
