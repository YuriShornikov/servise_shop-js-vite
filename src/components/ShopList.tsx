import React, { useEffect, useState } from 'react';
import { getShops } from '../api';

const ShopList: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data } = await getShops();
        console.log(data);
        setShops(data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };
    fetchShops();
  }, []);

  return (
    <div>
      <h2>Shops</h2>
      <ul>
        {shops.length > 0 ? (
          shops.map((shop) => (
            <li key={shop.id}>
              {shop.name} ({shop.location})
            </li>
          ))
        ) : (
          // Сообщение, если магазины не найдены
          <p>No shops found</p>
        )}
      </ul>
    </div>
  );
};

export default ShopList;
