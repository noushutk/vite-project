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

  // Step 1: Get new account ID via RPC
  const { data: nextId, error: idError } = await supabase.rpc("get_next_id", {
  table_name: "accounts",
  column_name: "accountid",
  });
  
  if (idError) {
    console.error("Failed to generate account ID", idError);
    alert("Failed to generate Account ID");
    return;
  }

  const newAccount = {
    ...account,
    accountid: nextId, // Set the generated ID
  };
  console.log("Sending data to Supabase:", newAccount);
  // Step 2: Insert into accounts table
  const { data: createdAccount, error } = await supabase
    .from("accounts")
    .insert([newAccount])
    .select()
    .single();

  if (error) {
    
    alert("Account creation failed.");
    return;
  }

  // Step 3: Insert into customers if actgroupid === 10
  if (parseInt(newAccount.actgroupid) === 10) {
    const { error: contactErr } = await supabase.from("customer").insert([{
      accountid: createdAccount.accountid,
      ...contactDetails,
    }]);
    if (contactErr) alert("Contact save failed.");
  }

  onAccountCreated?.();
  setAccount({ accountname: "", actgroupid: 0, opbalance: 0 });
  setContactDetails({ tel: "", fax: "", email: "", contact_person: "", address: "", trn: "" });
};


  

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white shadow">
      <input
        type="text"
        placeholder="Account Name"
        value={account.accountname}
        onChange={(e) => setAccount({ ...account, accountname: e.target.value })}
        className="input input-bordered w-full"
      />

      <select
        value={account.actgroupid}
        onChange={(e) => setAccount({ ...account, actgroupid: parseInt(e.target.value) })}
        className="select select-bordered w-full"
      >
        <option value="">Select Group</option>
        {accountGroups.map((g) => (
          <option key={g.actgroupid} value={g.actgroupid}>{g.actgroupname}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Opening Balance"
        value={account.opbalance}
        onChange={(e) => setAccount({ ...account, opbalance: parseFloat(e.target.value) })}
        className="input input-bordered w-full"
      />

      {/* Show contact fields only for group ID 10 */}
      {parseInt(account.actgroupid) === 10 && (
        <div className="space-y-2">
          <input type="text" placeholder="Tel" value={contactDetails.tel} onChange={(e) => setContactDetails({ ...contactDetails, tel: e.target.value })} className="input input-bordered w-full" />
          <input type="text" placeholder="Fax" value={contactDetails.fax} onChange={(e) => setContactDetails({ ...contactDetails, fax: e.target.value })} className="input input-bordered w-full" />
          <input type="email" placeholder="Email" value={contactDetails.email} onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })} className="input input-bordered w-full" />
          <input type="text" placeholder="Contact Person" value={contactDetails.cp} onChange={(e) => setContactDetails({ ...contactDetails, contactname: e.target.value })} className="input input-bordered w-full" />
          <input type="text" placeholder="Address" value={contactDetails.address} onChange={(e) => setContactDetails({ ...contactDetails, address: e.target.value })} className="input input-bordered w-full" />
          <input type="text" placeholder="TRN" value={contactDetails.trn} onChange={(e) => setContactDetails({ ...contactDetails, trn: e.target.value })} className="input input-bordered w-full" />
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full">Save Account</button>
    </form>
  );
}