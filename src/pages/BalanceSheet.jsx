import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

export default function BalanceSheet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchBalanceSheet = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_balance_sheet");
      if (error) console.error("Error fetching balance sheet:", error);
      else setData(data);
      setLoading(false);
    };
    fetchBalanceSheet();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data) return <p className="text-center mt-10">No data found</p>;

  const creditors = Array.isArray(data.creditors) ? data.creditors : [];
  const debtors = Array.isArray(data.debtors) ? data.debtors : [];
  const capital = Array.isArray(data.capital) ? data.capital : [];
  const cash = Array.isArray(data.cash) ? data.cash : [];
  const bank = Array.isArray(data.bank) ? data.bank : [];

  const total = (arr) => arr.reduce((sum, a) => sum + (a.balance || 0), 0);

  const totals = {
    creditors: total(creditors),
    debtors: total(debtors),
    capital: total(capital),
    cash: total(cash),
    bank: total(bank),
    closing_stock: data.closing_stock || 0,
  };

  const chartData = [
    { name: "Capital", value: Math.abs(totals.capital) },
    { name: "Creditors", value: Math.abs(totals.creditors) },
    { name: "Debtors", value: Math.abs(totals.debtors) },
    { name: "Cash", value: Math.abs(totals.cash) },
    { name: "Bank", value: Math.abs(totals.bank) },
    { name: "Closing Stock", value: Math.abs(totals.closing_stock) },
  ];

  const toggleExpand = (group) =>
    setExpanded((prev) => (prev === group ? null : group));

  const renderDetails = (groupName, groupData) => (
    <AnimatePresence>
      {expanded === groupName && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <table className="w-full text-sm ml-4 mb-2 border-l-2 border-indigo-300">
            <thead>
              <tr className="text-gray-600 font-semibold">
                <th className="text-left px-2">Account</th>
                <th className="text-right px-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {groupData.map((a) => (
                <tr key={a.accountid} className="hover:bg-gray-50">
                  <td className="px-2">{a.accountname}</td>
                  <td className="text-right px-2">
                    {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gradient-to-br from-indigo-50 to-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Balance Sheet
      </h1>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-indigo-100 text-indigo-800">
              <th className="py-2 px-4 text-left text-lg font-semibold">
                Liabilities
              </th>
              <th className="py-2 px-4 text-right text-lg font-semibold">
                Assets
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4 align-top">
                <div
                  onClick={() => toggleExpand("capital")}
                  className={`cursor-pointer hover:text-indigo-600 font-semibold transition ${
                    expanded === "capital" ? "text-indigo-600" : ""
                  }`}
                >
                  Capital : {totals.capital.toLocaleString()}
                </div>
                {renderDetails("capital", capital)}

                <div
                  onClick={() => toggleExpand("creditors")}
                  className={`cursor-pointer hover:text-indigo-600 font-semibold transition ${
                    expanded === "creditors" ? "text-indigo-600" : ""
                  }`}
                >
                  Creditors : {totals.creditors.toLocaleString()}
                </div>
                {renderDetails("creditors", creditors)}

                <div className="font-semibold text-gray-700">
                  Nett Profit : <span className="text-green-700">Coming soon</span>
                </div>
              </td>

              <td className="p-4 align-top">
                <div
                  onClick={() => toggleExpand("bank")}
                  className={`cursor-pointer hover:text-indigo-600 font-semibold transition ${
                    expanded === "bank" ? "text-indigo-600" : ""
                  }`}
                >
                  Bank Balance : {totals.bank.toLocaleString()}
                </div>
                {renderDetails("bank", bank)}

                <div
                  onClick={() => toggleExpand("cash")}
                  className={`cursor-pointer hover:text-indigo-600 font-semibold transition ${
                    expanded === "cash" ? "text-indigo-600" : ""
                  }`}
                >
                  Cash Balance : {totals.cash.toLocaleString()}
                </div>
                {renderDetails("cash", cash)}

                <div
                  onClick={() => toggleExpand("debtors")}
                  className={`cursor-pointer hover:text-indigo-600 font-semibold transition ${
                    expanded === "debtors" ? "text-indigo-600" : ""
                  }`}
                >
                  Customers : {totals.debtors.toLocaleString()}
                </div>
                {renderDetails("debtors", debtors)}

                <div className="font-semibold text-gray-700">
                  Closing Stock : {totals.closing_stock.toLocaleString()}
                </div>
              </td>
            </tr>

            <tr className="bg-gray-100 font-bold">
              <td className="p-4 text-right text-indigo-700">
                {(totals.capital + totals.creditors).toLocaleString()}
              </td>
              <td className="p-4 text-right text-indigo-700">
                {(
                  totals.bank +
                  totals.cash +
                  totals.debtors +
                  totals.closing_stock
                ).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold text-center text-indigo-600 mb-4">
          Balance Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
