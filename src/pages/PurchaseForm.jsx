import React, { useState } from 'react';
import ProductAutocomplete from '../components/ProductAutocomplete';

const mockProducts = [
  { id: 1, name: 'Laptop', brand: 'HP' },
  { id: 2, name: 'Phone', brand: 'Samsung' },
  { id: 3, name: 'Monitor', brand: 'Dell' }
];

const PurchaseForm = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Purchase Form</h2>
      <form className="space-y-4">
        <ProductAutocomplete products={mockProducts} onSelect={setSelectedProduct} />
        {selectedProduct && <div>Selected: {selectedProduct.brand} {selectedProduct.name}</div>}
        <input type="number" placeholder="Quantity" className="w-full p-2 border rounded" />
        <input type="number" placeholder="Price" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
};

export default PurchaseForm;