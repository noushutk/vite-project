// src/components/purchase/ProductSearch.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ProductSearch({ value, onChange }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      if (term.length < 2) return setResults([]);
      const { data } = await supabase
        .from("products")
        .select("id, prodname")
        .ilike("prodname", `%${term}%`);
      setResults(data || []);
    };
    fetch();
  }, [term]);

  return (
    <div className="relative z-50"> {/* ← ensure high z-index and positioning */}
      <input
        type="text"
        placeholder="Product Name"
        value={value?.prodname || term}
        onChange={(e) => {
          setTerm(e.target.value);
          onChange(null);
        }}
        className="input input-bordered w-full"
      />
      {results.length > 0 && !value && (
        <ul className="absolute left-0 top-full z-50 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => {
                onChange(p);
                setTerm("");
                setResults([]);
              }}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              {p.prodname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
