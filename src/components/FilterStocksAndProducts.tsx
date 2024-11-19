import React, { useState } from 'react';
import { filterStocks, getProducts } from '../api';

const FilterStocksAndProducts: React.FC = () => {
  const [plu, setPlu] = useState<string>('');
  const [shopId, setShopId] = useState<number | undefined>(undefined);
  const [shelfQuantity, setShelfQuantity] = useState<number | undefined>(undefined);
  const [orderQuantity, setOrderQuantity] = useState<number | undefined>(undefined);

  const [stocks, setStocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const handleFilter = async () => {
    try {
      // Собираем фильтры
      const filters: Record<string, any> = {};
      if (plu) filters.plu = plu;
      if (shopId !== undefined) filters.shop_id = shopId;
      if (shelfQuantity !== undefined) filters.shelf_quantity = shelfQuantity;
      if (orderQuantity !== undefined) filters.order_quantity = orderQuantity;

      // Получаем данные с API
      const [stocksResponse, productsResponse] = await Promise.all([
        filterStocks(filters),
        getProducts(plu ? plu : undefined),
      ]);

      setStocks(stocksResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching filtered stocks and products:', error);
    }
  };

  return (
    <div>
      <h2>Filter Stocks and Products</h2>

      {/* Поля для фильтрации */}
      <div>
        <label>PLU:</label>
        <input
          type="text"
          value={plu}
          onChange={(e) => setPlu(e.target.value)}
          placeholder="Введите PLU"
        />
      </div>

      <div>
        <label>Shop ID:</label>
        <input
          type="number"
          value={shopId ?? ''}
          onChange={(e) => setShopId(Number(e.target.value) || undefined)}
          placeholder="Введите ID магазина"
        />
      </div>

      <div>
        <label>Shelf Quantity:</label>
        <input
          type="number"
          value={shelfQuantity ?? ''}
          onChange={(e) => setShelfQuantity(Number(e.target.value) || undefined)}
          placeholder="Введите количество на полке"
        />
      </div>

      <div>
        <label>Order Quantity:</label>
        <input
          type="number"
          value={orderQuantity ?? ''}
          onChange={(e) => setOrderQuantity(Number(e.target.value) || undefined)}
          placeholder="Введите количество в заказе"
        />
      </div>

      <button onClick={handleFilter}>Filter</button>

      {/* Список остатков */}
      <div>
        <h3>Stocks:</h3>
        {stocks.length > 0 ? (
          <ul>
            {stocks.map((stock) => (
              <li key={stock.id}>
                <strong>PLU:</strong> {stock.plu}, <strong>Shop ID:</strong> {stock.shop_id}, 
                <strong> Shelf Quantity:</strong> {stock.shelf_quantity}, 
                <strong> Order Quantity:</strong> {stock.order_quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No stocks found.</p>
        )}
      </div>

      {/* Список товаров */}
      <div>
        <h3>Products:</h3>
        {products.length > 0 ? (
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <strong>PLU:</strong> {product.plu}, <strong>Name:</strong> {product.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default FilterStocksAndProducts;
