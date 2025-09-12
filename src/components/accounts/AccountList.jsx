// Placeholder for AccountList.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AccountFormModal from './AccountFormModal'; // reuse modal for editing

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data, error } = await supabase.from('accounts').select('*').order('accountid');
    if (!error) setAccounts(data);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
    loadAccounts(); // refresh after edit
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Accounts List</h2>
      <table className="w-full text-sm text-left border">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Group</th>
            <th className="p-2">Opening Balance</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.accountid} className="border-t">
              <td className="p-2">{acc.accountid}</td>
              <td className="p-2">{acc.accountname}</td>
              <td className="p-2">{acc.actgroupid}</td>
              <td className="p-2">{acc.opbalance}</td>
              <td className="p-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(acc)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <AccountFormModal
          isOpen={showModal}
          onClose={closeModal}
          accountToEdit={selectedAccount}
        />
      )}
    </div>
  );
}
