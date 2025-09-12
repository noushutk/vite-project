
// src/components/products/EditProductSection.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

export default function EditProductSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    prodname: "",
    categoryid: "",
    brandid: "",
    unitid: "",
    opbalance: "",
    opprice: "",
    sellprice: "",
  });
  const [dropdowns, setDropdowns] = useState({
    categories: [],
    brands: [],
    units: [],
  });

  useEffect(() => {
    async function loadDropdowns() {
      const [cat, brand, unit] = await Promise.all([
        supabase.from("category").select("*"),
        supabase.from("brands").select("*"),
        supabase.from("units").select("*"),
      ]);
      setDropdowns({
        categories: cat.data || [],
        brands: brand.data || [],
        units: unit.data || [],
      });
    }
    loadDropdowns();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      const { data, error } = await supabase
        .from("products")
        .select("*, brands(brname)")
        .ilike("prodname", `%${searchTerm}%`);

      if (data) {
        setSearchResults(data);
      }
    };
    fetchMatches();
  }, [searchTerm]);

  const handleFetch = () => {
    if (!selectedProduct) return;
    setForm({
      prodname: selectedProduct.prodname,
      categoryid: selectedProduct.categoryid,
      brandid: selectedProduct.brandid,
      unitid: selectedProduct.unitid,
      opbalance: selectedProduct.opbalance,
      opprice: selectedProduct.opprice,
      sellprice: selectedProduct.sellprice,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedProduct?.id) return;

    const { error } = await supabase
      .from("products")
      .update({
        ...form,
        opbalance: parseInt(form.opbalance) || 0,
        opprice: parseFloat(form.opprice) || 0,
        sellprice: parseFloat(form.sellprice) || 0,
      })
      .eq("id", selectedProduct.id);

    if (error) {
      toast.error("Failed to update product");
    } else {
      toast.success("Product updated successfully");
      setForm({
        id: "",
        prodname: "",
        categoryid: "",
        brandid: "",
        unitid: "",
        opbalance: "",
        opprice: "",
        sellprice: "",
      });
       setSelectedProduct(null);
       setSearchResults([]);
        setSearchTerm("");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct?.id) return;

    const { error } = await supabase.from("products").delete().eq("id", selectedProduct.id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Product deleted");
      setForm({ id:"", prodname: "", categoryid: "", brandid: "", unitid: "", opbalance: "", opprice: "", sellprice: "" });
      setSelectedProduct(null);
      setSearchResults([]);
      setSearchTerm("");
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 space-y-4 bg-white shadow rounded">
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product name..."
          className="input input-bordered w-full"
        />
        {searchResults.length > 0 && (
          <ul className="border rounded mt-2 bg-white max-h-48 overflow-y-auto">
            {searchResults.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setSelectedProduct(item);
                  setSearchTerm(item.prodname);
                  setSearchResults([]);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {item.brands?.brname || "No Brand"} - {item.prodname}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="btn btn-outline w-full" onClick={handleFetch}>
        Fetch Product
      </button>

      {selectedProduct && (
        <div className="space-y-3">
          <div>
            <label className="block font-medium mb-1">Product Name</label>
            <input
              name="prodname"
              value={form.prodname}
              onChange={(e) => setForm({ ...form, prodname: e.target.value })}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              value={form.categoryid || ""}
              onChange={(e) => setForm({ ...form, categoryid: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="">Select Category</option>
              {dropdowns.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.catname}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Brand</label>
            <select
              value={form.brandid || ""}
              onChange={(e) => setForm({ ...form, brandid: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="">Select Brand</option>
              {dropdowns.brands.map((b) => (
                <option key={b.id} value={b.id}>{b.brname}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Unit</label>
            <select
              value={form.unitid || ""}
              onChange={(e) => setForm({ ...form, unitid: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="">Select Unit</option>
              {dropdowns.units.map((u) => (
                <option key={u.id} value={u.id}>{u.unitname}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Opening Quantity</label>
            <input
              type="number"
              value={form.opbalance}
              onChange={(e) => setForm({ ...form, opbalance: e.target.value })}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Opening Price</label>
            <input
              type="number"
              value={form.opprice}
              onChange={(e) => setForm({ ...form, opprice: e.target.value })}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Selling Price</label>
            <input
              type="number"
              value={form.sellprice}
              onChange={(e) => setForm({ ...form, sellprice: e.target.value })}
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex justify-between gap-4 mt-4">
            <button onClick={handleUpdate} className="btn btn-success w-1/2">Update</button>
            <button onClick={handleDelete} className="btn btn-error w-1/2">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}