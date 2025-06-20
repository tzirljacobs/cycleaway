import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const ManageAccessories = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accessories, setAccessories] = useState([]);

  // ✅ Load accessories
  const fetchAccessories = async () => {
    const { data, error } = await supabase.from('accessories').select('*');
    if (error) {
      console.error('❌ Error fetching accessories:', error.message);
    } else {
      setAccessories(data);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  // ✅ Form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setTimeout(() => setMessage(''), 3000);

    setError('');

    const { data, error } = await supabase
      .from('accessories')
      .insert([
        {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price), // ✅ This is the important fix
        },
      ])
      .select();

    if (error) {
      console.error('❌ Error adding accessory:', error.message);
      setError('Failed to add accessory.');
    } else {
      setMessage('Accessory added successfully!');

      setAccessories((prev) => [...prev, ...data]);
      setForm({ name: '', description: '', price: '' });
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('accessories').delete().eq('id', id);

    if (error) {
      console.error('❌ Error deleting accessory:', error.message);
      alert('Failed to delete accessory.');
    } else {
      setAccessories((prev) => prev.filter((a) => a.id !== id));
      setMessage('Accessory deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      {/* Back Button */}
      <div className="max-w-xl mx-auto mb-4">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="btn btn-secondary"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {/* Add Accessory Form */}
      {/* Success/Error Messages */}
      {message && (
        <div className="max-w-xl mx-auto mb-6">
          <div className="alert alert-success shadow-lg">
            <span>{message}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-xl mx-auto mb-6">
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Add Accessory Form */}
      <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Add a New Accessory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Accessory name"
            className="input input-bordered w-full"
            value={form.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="price"
            placeholder="Price (e.g. 5.00)"
            className="input input-bordered w-full"
            value={form.price}
            onChange={handleChange}
            pattern="^[0-9]+(\.[0-9]{1,2})?$"
            title="Enter a valid price like 5 or 5.99"
            required
          />

          <button type="submit" className="btn btn-primary w-full">
            ➕ Add Accessory
          </button>
        </form>
      </div>

      {/* Accessory List */}
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-center text-primary">
          Existing Accessories
        </h3>

        {accessories.length === 0 ? (
          <p className="text-center text-gray-500">No accessories yet.</p>
        ) : (
          <ul className="space-y-2">
            {accessories.map((a) => (
              <li
                key={a.id}
                className="border rounded p-4 flex flex-col md:flex-row md:justify-between md:items-center"
              >
                <div>
                  <strong>{a.name}</strong> – £{parseFloat(a.price).toFixed(2)}
                  <p className="text-sm text-gray-600">{a.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn btn-sm btn-error mt-2 md:mt-0"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageAccessories;
