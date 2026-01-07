// Placeholder for TransactionForm.jsx

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

export default function TransactionForm() {
  const [form, setForm] = useState({
    trstype: "",
    date: new Date().toISOString().split("T")[0],
    debitAccount: "",
    creditAccount: "",
  });

    const [inventoryItems, setInventoryItems] = useState([
      { productid: "", qtyin: 0, qtyout: 0, price: 0 }
    ]);
  const handleInventoryChange = (index, field, value) => {
    const newItems = [...inventoryItems];
    newItems[index][field] = value;
    setInventoryItems(newItems);
  };

  const addInventoryItem = () => {
    setInventoryItems([...inventoryItems, { productid: "", qtyin: 0, qtyout: 0, price: 0 }]);
  };

  const removeInventoryItem = (index) => {
    const newItems = [...inventoryItems];
    newItems.splice(index, 1);
    setInventoryItems(newItems);
  };

  const [accounts, setAccounts] = useState({
    credit: [],
    debit: [],
  });

  useEffect(() => {
    const loadAccounts = async () => {
      let debitGroupIds = [];
      let creditGroupIds = [];

      switch (form.trstype) {
        case "sales":
          debitGroupIds = [10];
          creditGroupIds = [1, 2];
          break;
        case "purchase":
          debitGroupIds = [11];
          creditGroupIds = [1, 2];
          break;
        case "sales_return":
          debitGroupIds = [1, 2];
          creditGroupIds = [10];
          break;
        case "purchase_return":
          debitGroupIds = [1, 2];
          creditGroupIds = [11];
          break;
        default:
          break;
      }

      const { data: allAccounts, error } = await supabase
        .from("accounts")
        .select("accountid, accountname, actgroupid");

      if (error) return;

      const debitAccounts = allAccounts.filter((acc) =>
        debitGroupIds.includes(acc.actgroupid)
      );
      const creditAccounts = allAccounts.filter((acc) =>
        creditGroupIds.includes(acc.actgroupid)
      );

      setAccounts({ debit: debitAccounts, credit: creditAccounts });
    };

    if (form.trstype) {
      loadAccounts();
    }
  }, [form.trstype]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info("Submitting (dummy)...");

    console.log("Submitted:", form);
    toast.success("Transaction submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow max-w-2xl mx-auto">
      <div>
        <label className="block mb-1">Transaction Type</label>
        <select
          name="trstype"
          value={form.trstype}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">Select Transaction Type</option>
          <option value="sales">Sales</option>
          <option value="purchase">Purchase</option>
          <option value="sales_return">Sales Return</option>
          <option value="purchase_return">Purchase Return</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Transaction Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>

      <div>
        <label className="block mb-1">Debit Account</label>
        <select
          name="debitAccount"
          value={form.debitAccount}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">Select Debit Account</option>
          {accounts.debit.map((acc) => (
            <option key={acc.accountid} value={acc.accountid}>
              {acc.accountname}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Credit Account</label>
        <select
          name="creditAccount"
          value={form.creditAccount}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">Select Credit Account</option>
          {accounts.credit.map((acc) => (
            <option key={acc.accountid} value={acc.accountid}>
              {acc.accountname}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block font-semibold">Inventory Items</label>
        {inventoryItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 items-end">
            <input
              type="text"
              placeholder="Product ID"
              value={item.productid}
              onChange={(e) => handleInventoryChange(idx, "productid", e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="number"
              placeholder="Qty In"
              value={item.qtyin}
              onChange={(e) => handleInventoryChange(idx, "qtyin", e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="number"
              placeholder="Qty Out"
              value={item.qtyout}
              onChange={(e) => handleInventoryChange(idx, "qtyout", e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleInventoryChange(idx, "price", e.target.value)}
              className="input input-bordered w-full"
            />
            <button type="button" onClick={() => removeInventoryItem(idx)} className="text-red-500">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addInventoryItem} className="btn btn-sm btn-outline">+ Add Item</button>
      </div>


      <button type="submit" className="btn btn-primary w-full">Submit Transaction</button>
    </form>
  );
}
