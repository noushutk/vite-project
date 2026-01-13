import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const typeConfig = {
  payment: {
    label: "Payment",
    tpid: 3,
    fromGroup: [1, 2],          // Bank
    excludeGroups: [1, 2],      // All except Bank
    bg: "bg-red-100",
    fromLabel: "For",
    forLabel: "From",
  },
  receipt: {
    label: "Receipt",
    tpid: 4,
    fromGroup: [1, 2],          // Bank
    excludeGroups: [1, 2],      // All except Bank
    bg: "bg-green-100",
    fromLabel: "To",
    forLabel: "For",
  },
  transfer: {
    label: "Transfer",
    tpid: 5,
    excludeGroups: [1, 2],      // Non-banking only, exclude 1 & 2 for both sides
    bg: "bg-yellow-100",
    fromLabel: "From",
    forLabel: "To",
  },
  deposit: {
    label: "Deposit",
    tpid: 6,
    fromGroup: [2],      // Cash
    forGroup: [1],       // Banks
    bg: "bg-blue-100",
    fromLabel: "From",
    forLabel: "To",
  },
  withdrawal: {
    label: "Withdrawal",
    tpid: 7,
    fromGroup: [1],      // Banks
    forGroup: [2],       // Cash
    bg: "bg-purple-100",
    fromLabel: "From",
    forLabel: "To",
  },
};

export default function FundTransactionForm() {
  const { type } = useParams();
  const config = typeConfig[type];

  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [description, setDescription] = useState("");
  const [refRows, setRefRows] = useState([{ refid: "", amt: "" }]);
  const [accounts, setAccounts] = useState([]);
  const [totalAmt, setTotalAmt] = useState(0);
  const [refSuggestions, setRefSuggestions] = useState([]);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase.from("accounts").select("*");
      if (error) toast.error("Failed to load accounts");
      else setAccounts(data);
    };
    fetchAccounts();
  }, []);

  // Calculate total amount for payment/receipt
  useEffect(() => {
    if (config.tpid === 3 || config.tpid === 4) {
      const total = refRows.reduce(
        (sum, row) => sum + parseFloat(row.amt || 0),
        0
      );
      setTotalAmt(total || 0);
    }
  }, [refRows]);

  // Fetch ref suggestions from Supabase
  const fetchRefSuggestions = async (accountId, currentRef, searchText) => {
    if (!accountId || !searchText) {
      setRefSuggestions([]);
      return;
    }

    const { data, error } = await supabase.rpc("get_ref_details", {
      _accountid: parseInt(accountId),
      _refid: currentRef || "",
      _search: searchText,
    });

    if (error) {
      console.error(error);
    } else {
      setRefSuggestions(data || []);
    }
  };

  const handleAmtChange = (index, field, value) => {
  const updated = [...refRows];

  // Case 1: called from autocomplete → fieldOrItem is the item object
  if (typeof fieldOrItem === "object" && fieldOrItem.refid) {
    const item = fieldOrItem;
    updated[index].refid = item.refid;
    updated[index].amt = parseFloat(item.balance) || 0;
    updated[index].suggestions = [];
  } 
  // Case 2: called from manual input → fieldOrItem is field name
  else {
    updated[index][field] = value;
  }

  setRefRows(updated);
}; 

const handleRefChange = (index, item) => {
  if (!item || !item.refid) {
    console.error("Invalid item passed to handleRefChange", item);
    return;
  }

  const updated = [...refRows];
  updated[index].refid = item.refid;
  updated[index].amt = parseFloat(item.balance) || 0; // ✅ auto-fill amount
  updated[index].suggestions = [];
  setRefRows(updated);
};

const handleInputChange = (index, field, value) => {
  const updated = [...refRows];
  updated[index][field] = value;
  setRefRows(updated);

  if (field === "refid") {
    fetchRefSuggestions(to || from, value, value);
  }
};

  const addRefRow = () => {
    setRefRows([...refRows, { refid: "", amt: "" }]);
  };

  const resetForm = () => {
    setFrom("");
    setTo("");
    setDescription("");
    setRefRows([{ refid: "", amt: "" }]);
    setDate(new Date());
    setTotalAmt(0);
    setRefSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!from || !to || !totalAmt) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (type === "transfer" && from === to) {
      toast.error("From and To accounts must be different for transfer.");
      return;
    }
    console.log(refRows);
    const { error } = await supabase.rpc("insertfundtrs", {
      _type: config.tpid,
      _date: date.toISOString(),
      _from: parseInt(from),
      _to: parseInt(to),
      _description: description,
      _refs: refRows.map((r) => ({
        refid: r.refid,
        amt: parseFloat(r.amt || 0),
      })),
      _total: totalAmt,
      
    });
    
    if (error) {
      toast.error("Submission failed: " + error.message);
    } else {
      toast.success(`${config.label} successful`);
      resetForm();
    }
  };

  // Dynamic account filtering logic
  const getAccounts = (type, isFrom = false) => {
    if (!accounts.length) return [];

    // Deposit & Withdrawal: fixed lists
    if (type === "deposit" || type === "withdrawal") {
      const groups = isFrom ? config.fromGroup : config.forGroup;
      return accounts.filter((a) => groups.includes(a.actgroupid));
    }

    // Transfer: exclude 1,2 from both
    if (type === "transfer") {
      return accounts.filter((a) => !config.excludeGroups.includes(a.actgroupid));
    }

    // Payment & Receipt
    if (type === "receipt") {
      if (isFrom) {
        return accounts.filter((a) => config.fromGroup.includes(a.actgroupid));
      } else {
        return accounts.filter((a) => !config.excludeGroups.includes(a.actgroupid));
      }
    }

    if (type === "payment") {
      if (isFrom) {
        return accounts.filter((a) => !config.excludeGroups.includes(a.actgroupid));
      } else {
        return accounts.filter((a) => config.fromGroup.includes(a.actgroupid));
      }
    }

    return accounts;
  };

  return (
    <div className={`p-6 rounded shadow-lg max-w-3xl mx-auto mt-8 ${config.bg}`}>
      <h2 className="text-2xl font-bold mb-4">{config.label} Form</h2>

      {/* Date & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-semibold">Date</label>
          <DatePicker
            selected={date}
            onChange={setDate}
            dateFormat="dd/MM/yyyy"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      {/* Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-semibold">{config.fromLabel} Account</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            {getAccounts(type, true).map((a) => (
              <option key={a.accountid} value={a.accountid}>
                {a.accountname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">{config.forLabel} Account</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            {getAccounts(type, false).map((a) => (
              <option key={a.accountid} value={a.accountid}>
                {a.accountname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reference Details */}
      {(config.tpid === 3 || config.tpid === 4) && (
        <div className="border p-4 rounded bg-white shadow mb-4 relative">
          <h3 className="text-lg font-semibold mb-2">Reference Details</h3>
          <table className="table-auto w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border px-3 py-2">Ref ID</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {refRows.map((row, index) => (
                <tr key={index} className="bg-gray-50 relative">
                  <td className="border px-3 py-2 relative">
                    <input
                      type="text"
                      value={row.refid}
                      onChange={(e) => handleInputChange(index, "refid", e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Type to search Ref ID..."
                    />
                    {refSuggestions.length > 0 && (
                      <ul className="absolute z-10 bg-white border rounded shadow-lg w-full max-h-40 overflow-y-auto">
                        {refSuggestions.map((s, i) => (
                          <li
                            key={i}
                            onClick={() => {
                              handleRefChange(index, s);
                              setRefSuggestions([]);
                            }}
                            className="p-2 hover:bg-blue-100 cursor-pointer text-sm flex justify-between"
                          >
                            <span>{s.refid}</span>
                            <span className="text-gray-500">{s.balance}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="number"
                      value={row.amt}
                      onChange={(e) => handleAmtChange(index,"amt" , e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Enter amount"
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {index > 0 && (
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() =>
                          setRefRows(refRows.filter((_, i) => i !== index))
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-right">
            <button className="btn btn-sm btn-primary" onClick={addRefRow}>
              + Add Row
            </button>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Total Amount</label>
        {config.tpid === 3 || config.tpid === 4 ? (
          <input
            type="number"
            value={totalAmt}
            readOnly
            className="input input-bordered w-full bg-gray-100"
          />
        ) : (
          <input
            type="number"
            value={totalAmt}
            onChange={(e) => setTotalAmt(parseFloat(e.target.value) || 0)}
            className="input input-bordered w-full"
          />
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button className="btn btn-ghost" onClick={resetForm}>
          Reset
        </button>
        <button className="btn btn-success" onClick={handleSubmit}>
          Submit {config.label}
        </button>
      </div>
    </div>
  );
}
