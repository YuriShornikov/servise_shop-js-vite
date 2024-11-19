import React, { useState } from 'react';
import { createProduct } from '../api';

const CreateProduct: React.FC = () => {
  const [plu, setPlu] = useState('');
  const [name, setName] = useState('');
  const [shop_name, setShopName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(plu, name, shop_name);
      alert('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    }
  };

  return (
    <div>
      <h2>Create Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>PLU:</label>
          <input type="text" value={plu} onChange={(e) => setPlu(e.target.value)} required />
        </div>
        <div>
          <label>Product Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Shop Name:</label>
          <input type="text" value={shop_name} onChange={(e) => setShopName(e.target.value)} required />
        </div>
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default CreateProduct;
