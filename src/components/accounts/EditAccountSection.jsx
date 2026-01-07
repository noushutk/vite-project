import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const EditAccountSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [contact, setContact] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCustomer = account?.actgroupid === 10;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const { data: accData, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .eq('accountid', id)
      .single();

    if (accError) {
      toast.error('Failed to load account');
      return;
    }

    setAccount(accData);

    if (accData.actgroupid === 10) {
      const { data: contactData, error: contactError } = await supabase
        .from('customer')
        .select('*')
        .eq('accountid', id)
        .single();

      if (contactError && contactError.code !== 'PGRST116') {
        toast.error('Failed to load contact details');
      } else {
        setContact(contactData || {});
      }
    }

    const { data: groupData } = await supabase.from('actgroup').select('*');
    console.log("Fetched groups:", groupData);
  
    setGroups(groupData || []);
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setAccount({ ...account, [field]: value });
  };

  const handleContactChange = (field, value) => {
    setContact({ ...contact, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error: accUpdateError } = await supabase
      .from('accounts')
      .update({
        accountname: account.accountname,
        actgroupid: account.actgroupid,
        opbalance: account.opbalance,
      })
      .eq('accountid', id);

    if (accUpdateError) {
      toast.error('Failed to update account');
      setLoading(false);
      return;
    }

    if (isCustomer) {
      if (contact?.id) {
        const { error: contactUpdateError } = await supabase
          .from('customer')
          .update(contact)
          .eq('accountid', contact.id);

        if (contactUpdateError) {
          toast.error('Failed to update contact');
          setLoading(false);
          return;
        }
      } else {
        const { error: contactInsertError } = await supabase.from('customer').insert({
          ...contact,
          accountid: id,
        });

        if (contactInsertError) {
          toast.error('Failed to add contact');
          setLoading(false);
          return;
        }
      }
    }

    toast.success('Account updated successfully');
    setLoading(false);
    navigate('/accounts');
  };
    const handleCancel = () => {
    navigate('/accounts'); // Navigate back to the accounts list
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!account) return <div className="p-4">Account not found</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Edit Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Account Name</label>
          <input
            type="text"
            value={account.accountname || ''}
            onChange={(e) => handleChange('accountname', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Group</label>
          <select
            value={account.actgroupid || ''}
            onChange={(e) => handleChange('actgroupid', parseInt(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">-- Select Group --</option>
            {groups.map((g) => (
              <option key={g.actgroupid} value={g.actgroupid}>
                {g.actgroupname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Opening Balance</label>
          <input
            type="number"
            value={account.opbalance || 0}
            onChange={(e) => handleChange('opbalance', parseFloat(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {isCustomer && (
          <>
            <hr className="my-4" />
            <h3 className="text-lg font-semibold">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Telephone"
                value={contact?.tel || ''}
                onChange={(e) => handleContactChange('tel', e.target.value)}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Fax"
                value={contact?.fax || ''}
                onChange={(e) => handleContactChange('fax', e.target.value)}
                className="border rounded p-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={contact?.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="TRN"
                value={contact?.trn || ''}
                onChange={(e) => handleContactChange('trn', e.target.value)}
                className="border rounded p-2"
              />
              <textarea
                placeholder="Address"
                value={contact?.address || ''}
                onChange={(e) => handleContactChange('address', e.target.value)}
                className="border rounded p-2 col-span-full"
              />
            </div>
          </>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Account
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAccountSection;
