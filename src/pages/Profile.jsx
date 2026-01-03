import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import AddressInput from '../components/AddressInput'; // ✅ step 1

function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
  });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Optional lat/lng tracking (can use later if needed)
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone, address, role')
          .eq('id', user.id)
          .single();

        if (!error) {
          setUserData(data);
          setOriginalData(data);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setMessage('');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', user.id);

    if (!error) {
      setMessage('✅ Profile updated!');
      setOriginalData(userData);
    } else {
      setMessage('❌ Update failed.');
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setUserData(originalData);
      setMessage('');
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 mt-28 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-primary">My Profile</h2>

      {message && <div className="text-success">{message}</div>}

      <div className="space-y-2">
        <label className="label">Name</label>
        <input
          className="input input-bordered w-full"
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />

        <label className="label">Phone</label>
        <input
          className="input input-bordered w-full"
          value={userData.phone}
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
        />

        <label className="label">Address</label>
        <AddressInput
          address={userData.address}
          setAddress={(value) =>
            setUserData((prev) => ({ ...prev, address: value }))
          }
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />

        <label className="label">Email</label>
        <input
          className="input input-bordered w-full"
          value={userData.email}
          disabled
        />

        <label className="label">Role</label>
        <input
          className="input input-bordered w-full"
          value={userData.role}
          disabled
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
        <button
          type="button"
          className="btn btn-outline sm:w-auto w-full"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary sm:w-auto w-full"
          onClick={handleUpdate}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Profile;
