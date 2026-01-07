import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "../components/InvoicePDF"; // Adjust path
import { pdf } from "@react-pdf/renderer";


export default function TransactionView() {
  const [transactions, setTransactions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trstype, setTrsType] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const printableRef = useRef();

  const transactionTypes = [
    { label: "Purchase", value: 1, labelForAccount: "Supplier", groupIds: [1, 2, 11, 16] },
    { label: "Sales", value: 2, labelForAccount: "Customer", groupIds: [10] },
    { label: "Purchase Return", value: 3, labelForAccount: "Supplier", groupIds: [1, 2, 11, 16] },
    { label: "Sales Return", value: 4, labelForAccount: "Customer", groupIds: [10] },
  ];

  const currentType = transactionTypes.find((t) => t.value === parseInt(trstype));
  const currentTransaction = transactions[currentIndex] || { inventory: [] };

  useEffect(() => {
    if (trstype) loadAccounts();
  }, [trstype]);

  async function loadAccounts() {
    const { data, error } = await supabase.from("accounts").select("accountid, accountname, actgroupid");
    if (error) return console.error(error);
    const filtered = data.filter((a) => currentType?.groupIds.includes(a.actgroupid));
    setAccounts(filtered);
  }

  async function fetchTransactionsByAccount(accountId) {
    setLoading(true);
    console.log("Fetching transactions for account ID:", accountId, "and type:", trstype);
    if (!trstype || !accountId) {
      setTransactions([]);
      setLoading(false);
      return;
    } 
    const { data, error } = await supabase.rpc("fetch_transactions", {
      _type: parseInt(trstype),
      _customer_supplier: accountId,
    });
    if (error) console.error(error);
    else {
      setTransactions(data || []);
      setCurrentIndex(0);
    }
    setLoading(false);
  }

  function calculateTotal(trx) {
    return trx.inventory?.reduce((sum, item) => {
      const qty = [1, 3].includes(parseInt(trstype)) ? item.qtyin : item.qtyout;
      return sum + qty * item.price;
    }, 0) || 0;
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleNext() {
    if (currentIndex < transactions.length - 1) setCurrentIndex((i) => i + 1);
  }

  async function handlePrint() {
    /*const element = printableRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, width - 20, height);
    pdf.save("transaction.pdf");
    
    <PDFDownloadLink
  document={
    <InvoicePDF
      transaction={currentTransaction}
      account={selectedAccount}
      typeLabel={currentType?.label}
    />
  }
  fileName={`transaction_${currentTransaction.trsid || "invoice"}.pdf`}
  className="btn btn-success"
>
  {({ loading }) => (loading ? "Generating..." : "Export to PDF")}
</PDFDownloadLink>*/
if (!currentTransaction || !currentTransaction.date || !selectedAccount || !currentType) {
    console.error("Missing data for PDF generation");
    return;
  }

  const blob = await pdf(
    <InvoicePDF
      transaction={currentTransaction}
      account={selectedAccount}
      typeLabel={currentType.label}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url); // 

  }

  function handleAccountSelect(account) {
    setSelectedAccount(account);
    setSearchTerm(account.accountname);
    fetchTransactionsByAccount(account.accountid);
  }

  const filteredAccounts = accounts.filter((a) =>
    a.accountname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Transaction Details</h2>

      {/* Filters */ }
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={trstype}
          onChange={(e) => {
            setTrsType(e.target.value);
            setSelectedAccount(null);
            setSearchTerm("");
            setTransactions([]);
          }}
          className="select select-bordered w-40"
        >
          <option value="">Select Type</option>
          {transactionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {trstype && (
          <div className="relative w-64">
            <input
              type="text"
              placeholder={`Search ${currentType?.labelForAccount}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedAccount(null);
                setTransactions([]);
              }}
              className="input input-bordered w-full"
            />
            {searchTerm && !selectedAccount && (
              <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto mt-1">
                {filteredAccounts.map((acc) => (
                  <li
                    key={acc.accountid}
                    onClick={() => handleAccountSelect(acc)}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {acc.accountname}
                  </li>
                ))}
                {filteredAccounts.length === 0 && (
                  <li className="px-3 py-2 text-gray-500">No matches</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {transactions.length > 0 && (
        <div className="flex justify-between mb-2">
          <button
            onClick={handlePrev}
            className="btn btn-outline"
            disabled={currentIndex === 0}
          >
            &#8592; Previous
          </button>
          <span className="font-semibold text-lg">
            Transaction {currentIndex + 1} of {transactions.length}
          </span>
          <button
            onClick={handleNext}
            className="btn btn-outline"
            disabled={currentIndex === transactions.length - 1}
          >
            Next &#8594;
          </button>
        </div>
      )}

      {/* Printable Area */}

      {transactions.length > 0 && (
        <div ref={printableRef} className="bg-white p-4 border rounded shadow mt-2">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold uppercase">Transaction Invoice</h3>
            <p className="text-gray-600">{new Date(currentTransaction.date).toLocaleDateString()}</p>
          </div>

          <div className="mb-2">
            <p><strong>Description:</strong> {currentTransaction.description}</p>
            <p>
              <strong>{currentType?.labelForAccount}:</strong>{" "}
              {selectedAccount?.accountname || ""}
            </p>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead className="bg-green-200 text-green-900 font-semibold">
              <tr>
                <th className="border px-3 py-2">Product</th>
                <th className="border px-3 py-2">Qty</th>
                <th className="border px-3 py-2">Price</th>
                <th className="border px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentTransaction.inventory?.map((item, i) => {
                const qty = [1, 3].includes(parseInt(trstype)) ? item.qtyin : item.qtyout;
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border px-3 py-2">{item.product_name}</td>
                    <td className="border px-3 py-2 text-right">{qty}</td>
                    <td className="border px-3 py-2 text-right">{item.price.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-right">{(qty * item.price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="border px-3 py-2 text-right">Total</td>
                <td className="border px-3 py-2 text-right">
                  {currentTransaction.inventory?.reduce((sum, item) => {
                    const qty = [1, 3].includes(parseInt(trstype)) ? item.qtyin : item.qtyout;
                    return sum + qty;
                  }, 0)}
                </td>
                <td className="border px-3 py-2"></td>
                <td className="border px-3 py-2 text-right">
                  {calculateTotal(currentTransaction).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Action Buttons */}
      {transactions.length > 0 && (
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={handlePrint} className="btn btn-success">
            Export to PDF
          </button>
          <button onClick={() => window.history.back()} className="btn btn-outline">
            Close
          </button>
        </div>
      )}
    </div>
  );
}
