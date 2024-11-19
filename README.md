Оба сервиса бэкенды написаны на node.js
1. Для проверки работоспособности необходимо создать у себя на ПК БД shop.
2. Далее через sql создать таблицы:

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  plu VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT null,
  location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  shelf_quantity INT NOT NULL,
  order_quantity INT NOT NULL,
  shop_id INT NOT NULL,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE  -- Добавлен внешний ключ
);

CREATE TABLE actions_history (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  shop_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,  -- Тип действия: "create", "update", "increase", "decrease"
  action_date TIMESTAMP DEFAULT NOW(),
  details JSONB,  -- Дополнительные данные об изменениях
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

3. В папке Shop находится фронтенд с бэкендами. Установить зависимости. Запустить каждый сервис server и server log через консоль:
- npm i
- npm run start

4. Запустить фронтенд через консоль:
- npm i
- npm run dev

5. Для корректной работы вам необходимо изменить password - пароль к БД на каждом сервере в соответствии с вашим паролем.


Пс. У серверов есть файлы setupDatabase, которые не успел отладить для установки бд и таблиц. Код рабочий, стили не причесывал. Магазицы, товары, остатки создаются и изменяются. Фильтры работают. Логирование происходит, в истории отображается. Конечно, код не идеален, но это все можно доработать.
