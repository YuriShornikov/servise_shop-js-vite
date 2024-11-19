import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import CreateProduct from './components/CreateProduct';
import CreateShop from './components/CreateShop';
import FilterStocksAndProducts from './components/FilterStocksAndProducts';
import ActionHistory from './components/ActionHistory';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create-product">Create Product</Link></li>
            <li><Link to="/create-shop">Create Shop</Link></li>
            <li><Link to="/filter-stocks-products">filterList</Link></li>
            <li><Link to="/history">History</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/filter-stocks-products" element={<FilterStocksAndProducts />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/create-shop" element={<CreateShop />} />
          <Route path="/history" element={<ActionHistory />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
