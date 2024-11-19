import React from 'react';
import ShopList from './components/ShopList';
import { ProductList } from './components/ProductList';
import StockList from './components/StocksList';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Inventory Management System</h1>
      <ShopList />
      <ProductList />
      <StockList />
    </div>
  );
};

export default Home;
