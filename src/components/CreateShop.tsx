import React, { useState } from 'react';
import { createShop } from '../api';

const CreateShop: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShop(name, location);
      alert('Shop created successfully');
    } catch (error) {
      console.error('Error creating shop:', error);
      alert('Error creating shop');
    }
  };

  return (
    <div>
      <h2>Create Shop</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create Shop</button>
      </form>
    </div>
  );
};

export default CreateShop;
