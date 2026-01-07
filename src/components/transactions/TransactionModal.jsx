import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProductSearch from "../products/ProductSearch";

const typeConfig = {
  purchase: {
    label: "Purchase",
    debitGroup: [11],
    creditGroup: [1, 2],
    bg: "from-white to-blue-100",
  },
  sales: {
    label: "Sales",
    debitGroup: [10],
    creditGroup: [1, 2],
    bg: "from-white to-orange-100",
  },
  purchase_return: {
    label: "Purchase Return",
    debitGroup: [1, 2],
    creditGroup: [11],
    bg: "from-white to-yellow-100",
  },
  sales_return: {
    label: "Sales Return",
    debitGroup: [1, 2],
    creditGroup: [10],
    bg: "from-white to-red-100",
  },
};

export default function TransactionModal({ type, onClose, onSuccess }) {
  const { label, debitGroup, creditGroup, bg } = typeConfig[type] || {};

  const [date, setDate] = useState(new Date());
  const [ref, setRef] = useState("");
  const [counterRef, setCounterRef] = useState("");
  const [supplier, setSupplier] = useState("");
  const [accountsOptions, setAccountsOptions] = useState({ debit: [], credit: [] });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ product: null, qty: "", price: "" });

  useEffect(() => {
    async function loadAccounts() {
      const { data: allAccounts } = await supabase.from("accounts").select("*");
      setAccountsOptions({
        debit: allAccounts.filter(a => debitGroup.includes(a.actgroupid)),
        credit: allAccounts.filter(a => creditGroup.includes(a.actgroupid)),
      });
    }
    loadAccounts();
  }, [type]);

  const addItem = () => {
    if (!newItem.product || !newItem.qty || !newItem.price) return;
    setItems(prev => [...prev, newItem]);
    setNewItem({ product: null, qty: "", price: "" });
  };

  const deleteItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handleSubmit = async () => {
    if (!supplier || items.length === 0) {
      toast.error("Please fill mandatory fields and add items.");
      return;
    }

    const { data, error } = await supabase.rpc("insert_full_transaction", {
      _trs_type: Object.keys(typeConfig).indexOf(type),
      _trs_description: `${label} - ${ref}`,
      _date: date.toISOString(),
      _caid: parseInt(supplier),
      _acttrans: JSON.stringify([
        {
          AccountID: parseInt(supplier),
          Debit: type.includes("sales") ? 0 : calculateTotal(),
          Credit: type.includes("sales") ? calculateTotal() : 0,
        },
      ]),
      _inventory: JSON.stringify(
        items.map(i => ({
          Products_ID: i.product.id,
          QtyIn: type.includes("purchase") ? parseInt(i.qty) : 0,
          QtyOut: type.includes("sales") ? parseInt(i.qty) : 0,
          Price: parseFloat(i.price),
        }))
      ),
      _ref: JSON.stringify([
        {
          ID: Date.now(),
          REFID: ref,
          AccountID: parseInt(supplier),
          Debit: 0,
          Credit: calculateTotal(),
        },
      ]),
    });

    if (error) {
      toast.error("Transaction failed: " + error.message);
    } else {
      toast.success(`${label} successful (TRS ID: ${data})`);
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 p-6 overflow-y-auto">
      <div
        className={`bg-gradient-to-br ${bg} border border-gray-300 rounded-lg shadow-xl p-6 w-full max-w-5xl min-w-[700px] resize overflow-auto space-y-6`}
        style={{ maxHeight: "90vh" }}
      >
        <h2 className="text-2xl font-bold text-blue-900">{label}</h2>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Date</label>
            <DatePicker
              selected={date}
              onChange={setDate}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Reference</label>
            <input
              value={ref}
              onChange={e => setRef(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Counter Ref</label>
            <input
              value={counterRef}
              onChange={e => setCounterRef(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Supplier / Customer */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            {type.includes("purchase") ? "Supplier" : "Customer"}
          </label>
          <select
            value={supplier}
            onChange={e => setSupplier(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            {accountsOptions.debit.map(a => (
              <option key={a.accountid} value={a.accountid}>
                {a.accountname}
              </option>
            ))}
          </select>
        </div>

        {/* Inventory Table with Input Row */}
        <div className="overflow-x-auto">
          <table className="table w-full border border-gray-300 rounded mt-4">
            <thead className="bg-blue-200 text-blue-900 font-semibold">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Product</th>
                <th className="border px-3 py-2">Qty</th>
                <th className="border px-3 py-2">Price</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="bg-white hover:bg-blue-50">
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{item.product?.prodname}</td>
                  <td className="border px-3 py-2">{item.qty}</td>
                  <td className="border px-3 py-2">{item.price}</td>
                  <td className="border px-3 py-2">{(item.qty * item.price).toFixed(2)}</td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => deleteItem(idx)}
                      className="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {/* Input Row */}
              <tr className="bg-green-50 font-medium">
                <td className="border px-3 py-2">+</td>
                <td className="border px-3 py-2">
                  <ProductSearch
                    value={newItem.product}
                    onChange={product => setNewItem(prev => ({ ...prev, product }))}
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="number"
                    value={newItem.qty}
                    onChange={e => setNewItem(prev => ({ ...prev, qty: e.target.value }))}
                    className="input input-bordered w-full"
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    className="input input-bordered w-full"
                  />
                </td>
                <td className="border px-3 py-2 text-center font-semibold">
                  {(newItem.qty * newItem.price || 0).toFixed(2)}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button onClick={addItem} className="btn btn-primary btn-sm">
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn btn-success">
            Submit {label}
          </button>
        </div>
      </div>
    </div>
  );
}
