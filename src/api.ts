import axios from 'axios';

// URL первого сервиса
const API_URL = 'http://localhost:3000';

// URL второго сервиса для истории действий
const HISTORY_API_URL = 'http://localhost:3001';

// Запросы для товаров
export const createProduct = async (plu: string, name: string, shop_name: string) => {
  return axios.post(`${API_URL}/products`, { plu, name, shop_name });
};

export const getProducts = async (name?: string, plu?: string) => {
  return axios.get(`${API_URL}/products`, { params: { name, plu } });
};

// Запросы для магазинов
export const createShop = async (name: string, location: string) => {
  return axios.post(`${API_URL}/shops`, { name, location });
};

export const getShops = async () => {
  return axios.get(`${API_URL}/shops`);
};

// Запросы для остатков
export const createStock = async (product_id: number, shop_id: number, shelf_quantity: number, order_quantity: number) => {
  return axios.post(`${API_URL}/stocks`, { product_id, shop_id, shelf_quantity, order_quantity });
};

export const filterStocks = async (filters: Record<string, any>) => {
  return axios.get(`${API_URL}/stocks`, { params: filters });
};

export const increaseStock = async (id: number, shelf_quantity: number, order_quantity: number) => {
  return axios.put(`${API_URL}/stocks/increase/${id}`, { shelf_quantity, order_quantity });
};

export const decreaseStock = async (id: number, shelf_quantity: number, order_quantity: number) => {
  return axios.put(`${API_URL}/stocks/decrease/${id}`, { shelf_quantity, order_quantity });
};

// Запросы для логирования действий (сервис истории)
export const logAction = async (product_id: number, shop_id: number, action: string, details: object) => {
  return axios.post(`${HISTORY_API_URL}/history`, {
    product_id,
    shop_id,
    action,
    details,
  });
};

// Запрос для получения истории действий с фильтрами
export const getActionHistory = async (filters: Record<string, any>) => {
  return axios.get(`${HISTORY_API_URL}/history`, { params: filters });
};


interface UpdateStockPayload {
  shelf_quantity?: number;
  order_quantity?: number;
}


// Функция для обновления остатков
export const updateStockQuantity = async (
  productId: number,
  shopId: number,
  payload: UpdateStockPayload
) => {
  try {
    const response = await axios.put(`${API_URL}/stocks`, {
      product_id: productId,
      shop_id: shopId,
      ...payload,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    throw new Error('Не удалось обновить данные об остатках');
  }
};

// Функция для получения данных о остатках
export const getStocks = async () => {
  try {
    const response = await axios.get(`${API_URL}/stocks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw new Error('Не удалось загрузить данные об остатках');
  }
};