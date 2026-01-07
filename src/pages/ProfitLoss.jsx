import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ProfitLossTable() {
  const [plData, setPlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

  useEffect(() => {
    fetchPLData();
  }, []);

  const fetchPLData = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_profit_loss", {
      start_date: startDate,
      end_date: endDate,
    });
    if (error) console.error("Error:", error);
    else setPlData(data);
    setLoading(false);
  };

  const COLORS = ["#2563EB", "#16A34A", "#DC2626", "#F59E0B", "#8B5CF6", "#10B981", "#EF4444"];

  const chartData = plData
    ? [
        { name: "Sales", value: plData.sales },
        { name: "Purchases", value: plData.purchases },
        { name: "Expenses", value: plData.expenses },
        { name: "Other Income", value: plData.other_income },
      ]
    : [];

  const numberFormat = (num) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 p-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl rounded-3xl p-8 border border-blue-100 w-full max-w-5xl"
      >
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          💼 Profit & Loss Statement
        </h2>

        {/* Date Filters */}
        <div className="flex justify-center gap-4 mb-6">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-blue-300 rounded-lg p-2 shadow-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-blue-300 rounded-lg p-2 shadow-sm"
          />
          <button
            onClick={fetchPLData}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-700"
          >
            Fetch
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-500 font-semibold">Loading data...</p>
        )}

        {plData && (
          <>
            {/* Modern Styled Table */}
            <div className="overflow-x-auto mb-10">
              <table className="w-full border border-blue-200 shadow-md rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th colSpan="2" className="py-3 text-lg font-semibold">
                      Profit & Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-gray-700">
                   <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium">Total Sales</td>
                    <td className="p-3 text-right">{numberFormat(Math.abs(plData.sales))}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium">Closing Stock</td>
                    <td className="p-3 text-right">{numberFormat(plData.closing_stock)}</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-blue-50 font-semibold">
                    <td className="p-3 text-right">Total</td>
                    <td className="p-3 text-right">
                      {numberFormat((Math.abs(plData.sales) || 0) + (plData.closing_stock || 0))}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium">Opening Stock</td>
                    <td className="p-3 text-right">{numberFormat(plData.opening_stock)}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium">Total Purchase</td>
                    <td className="p-3 text-right">{numberFormat(plData.purchases)}</td>
                  </tr>
                  
                  <tr className="border-t border-gray-200 bg-blue-50 font-semibold">
                    <td className="p-3 text-right"> - Total</td>
                    <td className="p-3 text-right">
                      {numberFormat(
                        (plData.opening_stock || 0) + (plData.purchases || 0) 
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium">Gross Profit</td>
                    <td className="p-3 text-right">{numberFormat(plData.gross_profit || 0)}</td>
                  </tr>

                  

                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium"> - Expenses</td>
                    <td className="p-3 text-right">{numberFormat(plData.expenses)}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium"> + Other Income</td>
                    <td className="p-3 text-right">{numberFormat(plData.other_income)}</td>
                  </tr>

                  <tr
                    className={`border-t border-gray-300 text-lg font-bold ${
                      plData.net_profit >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <td className="p-3">Net {plData.net_profit >= 0 ? "Profit" : "Loss"}</td>
                    <td className="p-3 text-right">{numberFormat(plData.net_profit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pie Chart Section */}
            <div className="bg-gradient-to-br from-pink-50 to-yellow-100 p-6 rounded-3xl shadow-xl border text-center">
              <h3 className="text-xl font-semibold text-pink-700 mb-4">P&L Breakdown</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => numberFormat(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
