import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import AddMasterModal from "../common/AddMasterModal"; // Reusable modal

export default function ProductForm({ onProductAdded }) {
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

  const [openModal, setOpenModal] = useState(null); // 'category' | 'brand' | 'unit'

  const loadDropdowns = async () => {
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
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: idData, error: idError } = await supabase.rpc("get_next_id", {
      table_name: "products",
      column_name: "id",
    });

    if (idError) {
      toast.error("Failed to generate Product ID");
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        ...form,
        id: idData,
        categoryid: parseInt(form.categoryid),
        brandid: parseInt(form.brandid),
        unitid: parseInt(form.unitid),
        opbalance: parseInt(form.opbalance) || 0,
        opprice: parseFloat(form.opprice) || 0,
        sellprice: parseFloat(form.sellprice) || 0,
      },
    ]);

    if (error) {
      toast.error("Failed to add product");
    } else {
      toast.success("Product added!");
      setForm({
        prodname: "",
        categoryid: "",
        brandid: "",
        unitid: "",
        opbalance: "",
        opprice: "",
        sellprice: "",
      });
      onProductAdded?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <input
        name="prodname"
        placeholder="Product Name"
        value={form.prodname}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <div className="flex items-center gap-2">
        <select name="categoryid" value={form.categoryid} onChange={handleChange} className="select select-bordered flex-1">
          <option value="">Select Category</option>
          {dropdowns.categories.map((c) => (
            <option key={c.id} value={c.id}>{c.catname}</option>
          ))}
        </select>
        <button type="button" className="btn" onClick={() => setOpenModal("category")}>+</button>
      </div>

      <div className="flex items-center gap-2">
        <select name="brandid" value={form.brandid} onChange={handleChange} className="select select-bordered flex-1">
          <option value="">Select Brand</option>
          {dropdowns.brands.map((b) => (
            <option key={b.id} value={b.id}>{b.brname}</option>
          ))}
        </select>
        <button type="button" className="btn" onClick={() => setOpenModal("brand")}>+</button>
      </div>

      <div className="flex items-center gap-2">
        <select name="unitid" value={form.unitid} onChange={handleChange} className="select select-bordered flex-1">
          <option value="">Select Unit</option>
          {dropdowns.units.map((u) => (
            <option key={u.id} value={u.id}>{u.unitname}</option>
          ))}
        </select>
        <button type="button" className="btn" onClick={() => setOpenModal("unit")}>+</button>
      </div>

      <input
        type="number"
        name="opbalance"
        placeholder="Opening Qty"
        value={form.opbalance}
        onChange={handleChange}
        className="input input-bordered w-full"
      />
      <input
        type="number"
        name="opprice"
        placeholder="Opening Price"
        value={form.opprice}
        onChange={handleChange}
        className="input input-bordered w-full"
      />
      <input
        type="number"
        name="sellprice"
        placeholder="Selling Price"
        value={form.sellprice}
        onChange={handleChange}
        className="input input-bordered w-full"
      />

      <button type="submit" className="btn btn-primary w-full">Add Product</button>

      {openModal && (
        <AddMasterModal
          type={openModal}
          onClose={() => {
            setOpenModal(null);
            loadDropdowns(); // Refresh dropdowns after modal
          }}
        />
      )}
    </form>
  );
}
