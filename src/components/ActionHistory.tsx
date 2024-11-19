import React, { useState, useEffect } from 'react';
import { getActionHistory } from '../api'; // Импортируем функцию для получения истории действий

// Тип для данных истории
interface ActionHistoryData {
  id: number;
  product_id: number;
  shop_id: number;
  action: string;
  action_date: string;
  details: Record<string, any>;
}

const ActionHistory: React.FC = () => {
  const [history, setHistory] = useState<ActionHistoryData[]>([]);
  const [filters, setFilters] = useState({
    shop_id: '',
    plu: '',
    date_from: '',
    date_to: '',
    action: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Обработка изменений в фильтрах
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Получение данных с учетом фильтров
  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getActionHistory({
        ...filters,
      });

      setHistory(response.data);

    } catch (error) {
      setError('Error fetching action history');
    } finally {
      setLoading(false);
    }
  };

  // Эффект, который перезапускает запрос при изменении фильтров
  useEffect(() => {
    fetchHistory();
  }, [filters]);

  return (
    <div>
      <h1>Action History</h1>
      
      {/* Форма для фильтров */}
      <div>
        <input
          type="text"
          name="shop_id"
          placeholder="Shop ID"
          value={filters.shop_id}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="plu"
          placeholder="PLU"
          value={filters.plu}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="date_from"
          placeholder="From Date"
          value={filters.date_from}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="date_to"
          placeholder="To Date"
          value={filters.date_to}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="action"
          placeholder="Action (create, update, etc.)"
          value={filters.action}
          onChange={handleFilterChange}
        />
        <button onClick={fetchHistory}>Search</button>
      </div>

      {/* Отображение ошибок */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Таблица с историей действий */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product ID</th>
              <th>Shop ID</th>
              <th>Action</th>
              <th>Action Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6}>No data available</td>
              </tr>
            ) : (
              history.map((action) => (
                <tr key={action.id}>
                  <td>{action.id}</td>
                  <td>{action.product_id}</td>
                  <td>{action.shop_id}</td>
                  <td>{action.action}</td>
                  <td>{new Date(action.action_date).toLocaleString()}</td>
                  <td>
                    <pre>{JSON.stringify(action.details, null, 2)}</pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActionHistory;
