import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

export default function AccountFormModal({ isOpen, onClose, accountToEdit }) {
  const [accountName, setAccountName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [opBalance, setOpBalance] = useState('');
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (accountToEdit) {
      setAccountName(accountToEdit.accountname);
      setGroupId(accountToEdit.actgroupid);
      setOpBalance(accountToEdit.opbalance);
    } else {
      setAccountName('');
      setGroupId('');
      setOpBalance('');
    }
  }, [accountToEdit]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('account_groups').select('*');
      if (!error) setGroups(data);
    };
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountName || !groupId) {
      toast.error('Account Name and Group are required');
      return;
    }

    const payload = {
      accountname: accountName,
      actgroupid: groupId,
      opbalance: parseFloat(opBalance) || 0,
    };

    if (accountToEdit) {
      // Editing existing account
      const { error } = await supabase
        .from('accounts')
        .update(payload)
        .eq('accountid', accountToEdit.accountid);

      if (error) toast.error('Failed to update account');
      else {
        toast.success('Account updated');
        onClose();
      }
    } else {
      // Adding new account
      const { error } = await supabase.from('accounts').insert(payload);
      if (error) toast.error('Failed to add account');
      else {
        toast.success('Account added');
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-bold mb-4">
            {accountToEdit ? 'Edit Account' : 'Add Account'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Account Group</label>
              <select
                className="w-full border p-2 rounded"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
              >
                <option value="">Select Group</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opening Balance</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={opBalance}
                onChange={(e) => setOpBalance(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {accountToEdit ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
