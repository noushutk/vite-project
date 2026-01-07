import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Ensure you have Supabase client configured
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Statement() {
  const [dropdown1, setDropdown1] = useState([]);
  const [dropdown2, setDropdown2] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [statementData, setStatementData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  // Load dropdown1 options (groups)
  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase.from("actgroup").select("*");
      if (error) {
        console.error("Error fetching groups:", error);
      } else {
        setDropdown1(data);
      }
    }
    fetchGroups();
  }, []);

  // Load dropdown2 options (accounts) based on selected group
  useEffect(() => {
    if (selectedGroup) {
      async function fetchAccounts() {
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("actgroupid", selectedGroup);
        if (error) {
          console.error("Error fetching accounts:", error);
        } else {
          setDropdown2(data);
        }
      }
      fetchAccounts();
    }
  }, [selectedGroup]);

 const fetchStatement = async () => {
  if (!selectedAccount) {
    alert("Please select an account.");
    return;
  }

  const bdate = fromDate.toISOString().split("T")[0];
  const edate = toDate.toISOString().split("T")[0];

  try {
    const { data: statement, error: statementError } = await supabase.rpc(
      "find_by_act_id_range",
      {
        account_id: selectedAccount,
        bdate,
        edate,
      }
    );

    const { data: summary, error: summaryError } = await supabase.rpc(
      "find_by_total_act_id_range",
      {
        account_id: selectedAccount,
        bdate,
        edate,
      }
    );

    if (statementError || summaryError) {
      console.error("Error fetching statement or summary:", {
        statementError,
        summaryError,
      });
      setStatementData([]); // Ensure statementData is an empty array on error
    } else {
      setStatementData(statement || []); // Ensure statementData is an array
      console.log("statement", statement);
      setSummaryData(summary?.[0] || null); // Handle summary data
    }
  } catch (error) {
    console.error("Error fetching statement data:", error);
    setStatementData([]); // Ensure statementData is an empty array on error
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Statement of Account
        </h2>

        {/* Date Pickers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              From:
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="dd/MM/yyyy"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              To:
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="dd/MM/yyyy"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Select Group:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select a group</option>
              {dropdown1.map((group) => (
                <option key={group.actgroupid} value={group.actgroupid}>
                  {group.actgroupname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Select Account:
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select an account</option>
              {dropdown2.map((account) => (
                <option key={account.accountid} value={account.accountid}>
                  {account.accountname}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fetch Statement Button */}
        <button
          onClick={fetchStatement}
          className="btn btn-primary w-full mb-4"
        >
          Fetch Statement
        </button>

        {/* Statement Table */}
        <table className="table-auto w-full border border-gray-300 rounded">
          <thead className="bg-blue-200 text-blue-900">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Description</th>
              <th className="border px-3 py-2">Credit</th>
              <th className="border px-3 py-2">Debit</th>
            </tr>
          </thead>
          <tbody>
  {summaryData && (
    <tr className="bg-gray-100">
      <td></td>
      <td>Opening Balance</td>
      <td className="text-right">
        {summaryData.opening_balance<= 0 ? Math.abs(summaryData.opening_balance) : ""}
      </td>
      <td className="text-right">
        {summaryData.opening_balance > 0
          ? summaryData.opening_balance
          : ""}
      </td>
      
    </tr>
  )}
  {Array.isArray(statementData) && statementData.length > 0 ? (
    statementData.map((item, index) => (
      <tr
        key={index}
        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
      >
        <td className="border px-3 py-2 text-center">{item.date}</td>
        <td className="border px-3 py-2">{item.trsdescription}</td>
        <td className="border px-3 py-2 text-right">
          {item.credit || ""}
        </td>
        <td className="border px-3 py-2 text-right">
          {item.debit || ""}
        </td>
      </tr>
    ))
    
  ) : (
    <tr>
      <td colSpan="4" className="text-center text-gray-500 py-4">
        No statement data available.
      </td>
    </tr>
  )}
  {summaryData && (
    <>
      <tr className="bg-gray-50">
        <td></td>
        <td>Total :</td>
        <td className="border px-3 py-2 text-right">
        {summaryData.total_credit}
        </td>
        <td className="border px-3 py-2 text-right">
        { summaryData.total_debit}
        </td>
      </tr>
      <tr className="bg-blue-100">
        <td></td>
        <td>Present Balance :</td>
        <td className="border px-3 py-2 text-right">
        {summaryData.final_balance<= 0 ? Math.abs(summaryData.final_balance) : ""}
      </td>
      
         <td className="border px-3 py-2 text-right">
        {summaryData.final_balance > 0
          ? summaryData.final_balance
          : ""}
      </td>
      
      </tr>
    </>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
}