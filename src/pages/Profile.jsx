import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

        if (!error) setUserData(data);
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
    } else {
      setMessage('❌ Update failed.');
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
        <input
          className="input input-bordered w-full"
          value={userData.address}
          onChange={(e) =>
            setUserData({ ...userData, address: e.target.value })
          }
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

      <button className="btn btn-primary w-full mt-4" onClick={handleUpdate}>
        Save Changes
      </button>
    </div>
  );
}

export default Profile;
