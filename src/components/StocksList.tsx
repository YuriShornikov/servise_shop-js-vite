import React, { useEffect, useState } from 'react';
import { getStocks, updateStockQuantity } from '../api';

// Типы данных для stocks
interface Stock {
  product_id: number;
  shop_id: number;
  shelf_quantity: number;
  order_quantity: number;
}

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStock, setLoadingStock] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await getStocks();
        if (Array.isArray(data)) {
          setStocks(data);
        } else {
          setError('Некорректные данные от сервера');
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setError('Ошибка при загрузке данных');
      }
    };

    fetchStocks();
  }, []);

  const handleQuantityChange = async (
    productId: number,
    shopId: number,
    field: 'shelf_quantity' | 'order_quantity',
    action: 'increment' | 'decrement'
  ) => {
    const stockKey = `${productId}-${shopId}-${field}`;
    const updatedStocks = [...stocks];
    const stock = updatedStocks.find((s) => s.product_id === productId && s.shop_id === shopId);
    if (!stock) return;

    const currentQuantity = stock[field];
    const newQuantity =
      action === 'increment' ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);

    setLoadingStock(stockKey);

    try {
      await updateStockQuantity(productId, shopId, { [field]: newQuantity });
      stock[field] = newQuantity;
      setStocks(updatedStocks);
    } catch (error) {
      console.error('Error updating stock quantity:', error);
      setError('Ошибка при обновлении остатков');
    } finally {
      setLoadingStock(null);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!stocks.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Stocks</h2>
      <ul>
        {stocks.map((stock, index) => (
          <li key={`${stock.product_id}-${stock.shop_id}-${index}`}>
            <div>
              Product ID: {stock.product_id}, Shop ID: {stock.shop_id}
            </div>
            <div>
              Shelf: {stock.shelf_quantity}
              <button
                onClick={() => handleQuantityChange(stock.product_id, stock.shop_id, 'shelf_quantity', 'increment')}
              >
                +
              </button>
              <button
                onClick={() => handleQuantityChange(stock.product_id, stock.shop_id, 'shelf_quantity', 'decrement')}
              >
                -
              </button>
            </div>
            <div>
              Order: {stock.order_quantity}
              <button
                onClick={() => handleQuantityChange(stock.product_id, stock.shop_id, 'order_quantity', 'increment')}
              >
                +
              </button>
              <button
                onClick={() => handleQuantityChange(stock.product_id, stock.shop_id, 'order_quantity', 'decrement')}
              >
                -
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockList;
