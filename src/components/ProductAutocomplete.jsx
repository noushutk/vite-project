import React, { useState } from 'react';

const ProductAutocomplete = ({ products, onSelect }) => {
  const [query, setQuery] = useState('');
  const filtered = products.filter(p =>
    (p.brand + ' ' + p.name).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search product..."
      />
      {query && (
        <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto shadow">
          {filtered.map((p) => (
            <li key={p.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
              onSelect(p);
              setQuery(p.brand + ' ' + p.name);
            }}>
              {p.brand} {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductAutocomplete;