import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

export default function StockSummaryPage() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch stock summary
  useEffect(() => {
    const fetchStockSummary = async () => {
      const { data, error } = await supabase.rpc("get_stock_summary");
      if (error) {
        console.error("Error fetching stock summary:", error);
        toast.error("Failed to fetch stock summary");
      } else {
        setStocks(data);
        setFilteredStocks(data);
      }
      setLoading(false);
    };
    fetchStockSummary();
  }, []);

  // Filter stocks when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStocks(stocks);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStocks(
        stocks.filter(
          (item) =>
            (item.prod_name?.toLowerCase().includes(term) ||
              item.brand_name?.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, stocks]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">📦 Stock Summary</h1>

      {/* Autocomplete Search */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Search by product or brand..."
          className="input input-bordered w-full max-w-md px-3 py-2 rounded shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-lg text-gray-600">Loading...</p>
      ) : filteredStocks.length === 0 ? (
        <p className="text-center text-red-500 font-semibold">No matching stock found.</p>
      ) : (
        <div className="overflow-auto shadow-lg rounded-lg border border-gray-300">
          <table className="min-w-full table-auto border-collapse bg-white text-sm text-gray-800">
            <thead className="bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 border">Product ID</th>
                <th className="px-4 py-3 border">Product Name</th>
                <th className="px-4 py-3 border">Opening Qty</th>
                <th className="px-4 py-3 border">Purchases</th>
                <th className="px-4 py-3 border">Sales</th>
                <th className="px-4 py-3 border">Closing Qty</th>
                <th className="px-4 py-3 border">Min Price</th>
                <th className="px-4 py-3 border">Avg Purchase Price</th>
                <th className="px-4 py-3 border">Avg Sale Price</th>
                <th className="px-4 py-3 border">Closing Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}
                >
                  <td className="px-4 py-2 border text-center">{item.product_id}</td>
                  <td className="px-4 py-2 border">
                    <span className="font-medium text-blue-700">{item.brand_name}</span> - {item.prod_name}
                  </td>
                  <td className="px-4 py-2 border text-right">{item.op_balance?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{item.tot_qty_in?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{item.tot_qty_out?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{item.closing_qty?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{item.min_price?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{item.avg_purchase_price?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{item.avg_sale_price?.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right font-semibold text-green-700">
                    ₹ {item.closing_value?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
