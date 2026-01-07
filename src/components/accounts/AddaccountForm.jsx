import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountForm({ onAccountCreated }) {
  const [account, setAccount] = useState({
    accountname: "",
    actgroupid: 0,
    opbalance: 0,
  });

  const [contactDetails, setContactDetails] = useState({
    tel: "",
    fax: "",
    email: "",
    contactname: "",
    address: "",
    trn: ""
  });

  const [accountGroups, setAccountGroups] = useState([]);

  useEffect(() => {
    const loadGroups = async () => {
      const { data } = await supabase.from("actgroup").select("*");
      setAccountGroups(data || []);
    };
    loadGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: nextId, error: idError } = await supabase.rpc("get_next_id", {
      table_name: "accounts",
      column_name: "accountid",
    });

    if (idError) {
      alert("Failed to generate Account ID");
      return;
    }

    const newAccount = {
      ...account,
      accountid: nextId,
    };
    console.log("Creating account:", account); 
    const { data: createdAccount, error } = await supabase
      .from("accounts")
      .insert([newAccount])
      .select()
      .single();

    if (error) {
      alert("Account creation failed.");
      return;
    }

    if (parseInt(newAccount.actgroupid) === 10) {
      const { error: contactErr } = await supabase.from("customer").insert([{
        accountid: createdAccount.accountid,
        ...contactDetails,
      }]);
      if (contactErr) alert("Contact save failed.");
    }

    onAccountCreated?.();

    setAccount({ accountname: "", actgroupid: 0, opbalance: 0 });
    setContactDetails({
      tel: "", fax: "", email: "", contactname: "", address: "", trn: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-100 shadow-lg max-w-2xl mx-auto mt-8"
    >
      <h2 className="text-xl font-bold text-blue-800">Add New Account</h2>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Account Name</label>
        <input
          type="text"
          placeholder="Enter account name"
          value={account.accountname}
          onChange={(e) =>
            setAccount({ ...account, accountname: e.target.value })
          }
          className="input input-bordered w-full border-blue-400 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Account Group</label>
        <select
          value={account.actgroupid}
          onChange={(e) =>
            setAccount({ ...account, actgroupid: parseInt(e.target.value) })
          }
          className="select select-bordered w-full border-purple-400 focus:ring-purple-500"
          required
        >
          <option value="">Select Group</option>
          {accountGroups.map((g) => (
            <option key={g.actgroupid} value={g.actgroupid}>
              {g.actgroupname}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Opening Balance</label>
        <input
          type="number"
          placeholder="0"
          value={account.opbalance}
          onChange={(e) =>
            setAccount({ ...account, opbalance: parseFloat(e.target.value) })
          }
          className="input input-bordered w-full border-green-400 focus:ring-green-500"
        />
      </div>

      {parseInt(account.actgroupid) === 10 && (
        <div className="bg-white p-4 rounded border border-blue-200 shadow-sm mt-4">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Contact Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="Phone"
                value={contactDetails.tel}
                onChange={(e) =>
                  setContactDetails({ ...contactDetails, tel: e.target.value })
                }
                className="input input-bordered w-full border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Fax</label>
              <input
                type="text"
                placeholder="Fax"
                value={contactDetails.fax}
                onChange={(e) =>
                  setContactDetails({ ...contactDetails, fax: e.target.value })
                }
                className="input input-bordered w-full border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={contactDetails.email}
                onChange={(e) =>
                  setContactDetails({ ...contactDetails, email: e.target.value })
                }
                className="input input-bordered w-full border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="Contact Person"
                value={contactDetails.contactname}
                onChange={(e) =>
                  setContactDetails({ ...contactDetails, contactname: e.target.value })
                }
                className="input input-bordered w-full border-gray-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                placeholder="Address"
                value={contactDetails.address}
                onChange={(e) =>
                  setContactDetails({ ...contactDetails, address: e.target.value })
                }
                className="input input-bordered w-full border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">TRN</label>
              <input
                type="text"
                placeholder="TRN"
                value={contactDetails.trn}
                onChange={(e) =>
                  setContactDetails({ ...contactDetails, trn: e.target.value })
                }
                className="input input-bordered w-full border-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      <div className="text-right pt-4">
        <button
          type="submit"
          className="btn bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Account
        </button>
      </div>
    </form>
  );
}
