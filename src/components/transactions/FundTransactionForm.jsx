import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const typeConfig = {
  payment: {
    label: "Payment",
    tpid:3,
    fromGroup: [1, 2],        // Bank
    forGroup: [3, 4, 10, 11], // Non-bank
    bg: "bg-red-100",
    fromLabel: "From",
    forLabel: "For",
  },
  receipt: {
    label: "Receipt",
    tpid:4,
    fromGroup: [3, 4, 10, 11],
    forGroup: [1, 2],
    bg: "bg-green-100",
    fromLabel: "To",
    forLabel: "For",
  },
  transfer: {
    label: "Transfer",
    tpid:5,
    fromGroup: [3, 4, 10, 11],
    forGroup: [3, 4, 10, 11],
    bg: "bg-yellow-100",
    fromLabel: "From",
    forLabel: "To",
  },
  deposit: {
    label: "Deposit",
    tpid:6,
    fromGroup: [3],      // Cash
    forGroup: [1, 2],    // Banks
    bg: "bg-blue-100",
    fromLabel: "From",
    forLabel: "To",
  },
  withdrawal: {
    label: "Withdrawal",
    tpid:7,
    fromGroup: [1, 2],  // Banks
    forGroup: [3],      // Cash
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

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase.from("accounts").select("*");
      if (error) toast.error("Failed to load accounts");
      else setAccounts(data);
    };
    fetchAccounts();
  }, []);

  // Calculate total amount
  useEffect(() => {
    const total = refRows.reduce((sum, row) => sum + parseFloat(row.amt || 0), 0);
    setTotalAmt(total || 0);
  }, [refRows]);

  const handleRefChange = (index, field, value) => {
    const updated = [...refRows];
    updated[index][field] = value;
    setRefRows(updated);
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

    const { error } = await supabase.rpc("insertfundtransaction", {
      _type: config.tpid,
      _date: date.toISOString(),
      _from: parseInt(from),
      _to: parseInt(to),
      _description: description,
      _refs: JSON.stringify(refRows),
      _total: totalAmt,
    });

    if (error) {
      toast.error("Submission failed: " + error.message);
    } else {
      toast.success(`${config.label} successful`);
      resetForm();
    }
  };

  const filteredAccounts = (groups) =>
    accounts.filter((a) => groups.includes(a.actgroupid));

  return (
    <div className={`p-6 rounded shadow-lg max-w-3xl mx-auto mt-8 ${config.bg}`}>
      <h2 className="text-2xl font-bold mb-4">{config.label} Form</h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-semibold">{config.fromLabel} Account</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            {filteredAccounts(config.fromGroup).map((a) => (
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
            {filteredAccounts(config.forGroup).map((a) => (
              <option key={a.accountid} value={a.accountid}>
                {a.accountname}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border p-4 rounded bg-white shadow mb-4">
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
              <tr key={index} className="bg-gray-50">
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={row.refid}
                    onChange={(e) => handleRefChange(index, "refid", e.target.value)}
                    className="input input-bordered w-full"
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="number"
                    value={row.amt}
                    onChange={(e) => handleRefChange(index, "amt", e.target.value)}
                    className="input input-bordered w-full"
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

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Total Amount</label>
        <input
          type="number"
          value={totalAmt}
          readOnly
          className="input input-bordered w-full bg-gray-100"
        />
      </div>

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
