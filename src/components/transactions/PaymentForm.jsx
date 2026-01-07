import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
registerLocale("en-GB", enGB);

export default function PaymentForm() {
  const [date, setDate] = useState(new Date());
  const [toAccount, setToAccount] = useState('');
  const [forAccount, setForAccount] = useState('');
  const [references, setReferences] = useState([{ refid: '', amt: '' }]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [banks, setBanks] = useState([]);
  const [nonbanks, setNonbanks] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data: accounts } = await supabase.from('accounts').select('*');
      setBanks(accounts.filter(a => a.actgroupid < 3));
      setNonbanks(accounts.filter(a => a.actgroupid >= 3));
    };
    fetchAccounts();
  }, []);

  const handleAddRow = () => {
    setReferences([...references, { refid: '', amt: '' }]);
  };

  const handleRefChange = (idx, field, value) => {
    const updated = [...references];
    updated[idx][field] = value;
    setReferences(updated);
    if (field === 'amt') {
      const total = updated.reduce((sum, r) => sum + parseFloat(r.amt || 0), 0);
      setAmount(total);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Form submitted successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 rounded-lg shadow-lg bg-gradient-to-br from-blue-50 to-purple-100 border border-blue-300 space-y-6">
      <h2 className="text-2xl font-bold text-center text-blue-800">💳 Payment Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
  <label className="block text-blue-900 font-medium mb-1 mb-2">Date</label>
  <DatePicker
    selected={date}
    onChange={setDate}
    locale="en-GB"
    dateFormat="dd/MM/yyyy"
    className="input input-bordered w-full border border-blue-400 rounded"
  />
</div>

        <div></div>
      </div>

      {/* To & For in same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-blue-900 font-medium mb-1">To (Bank Account)</label>
          <select value={toAccount} onChange={(e) => setToAccount(e.target.value)} className="select select-bordered w-full border border-green-400 rounded">
            <option value="">Select</option>
            {banks.map((b) => (
              <option key={b.accountid} value={b.accountid}>{b.accountname}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-blue-900 font-medium mb-1">For (Account)</label>
          <select value={forAccount} onChange={(e) => setForAccount(e.target.value)} className="select select-bordered w-full border border-green-400 rounded">
            <option value="">Select</option>
            {nonbanks.map((nb) => (
              <option key={nb.accountid} value={nb.accountid}>{nb.accountname}</option>
            ))}
          </select>
        </div>
      </div>

      {/* References table */}
      <div className="mt-4">
        <label className="block text-blue-900 font-medium mb-2">References</label>
        <div className="overflow-x-auto">
          <table className="w-full max-w-md border border-gray-400 rounded bg-white">
            <thead className="bg-yellow-100 text-gray-800 text-sm">
              <tr>
                <th className="border px-3 py-2">Ref</th>
                <th className="border px-3 py-2">Amt</th>
              </tr>
            </thead>
            <tbody>
              {references.map((ref, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={ref.refid}
                      onChange={(e) => handleRefChange(idx, 'refid', e.target.value)}
                      className="input input-sm w-full border border-purple-400"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={ref.amt}
                      onChange={(e) => handleRefChange(idx, 'amt', e.target.value)}
                      className="input input-sm w-full border border-purple-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={handleAddRow} className="btn btn-sm btn-outline mt-2 border-blue-400 text-blue-800">
          ➕ Add Row
        </button>
      </div>

      {/* Amount + Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-blue-900 font-medium mb-1">Amount</label>
          <input
            value={amount.toFixed(2)}
            readOnly
            className="input input-bordered w-full bg-blue-100 text-blue-900 border border-blue-400"
          />
        </div>
        <div>
          <label className="block text-blue-900 font-medium mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input input-bordered w-full border border-blue-400"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button type="reset" className="btn btn-outline border border-red-400 text-red-600 hover:bg-red-50">Reset</button>
        <button type="submit" className="btn btn-primary bg-green-500 hover:bg-green-600 border-green-700">Submit Payment</button>
      </div>
    </form>
  );
}
