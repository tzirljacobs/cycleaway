import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const ManageCycles = () => {
  const [cycles, setCycles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCycle, setNewCycle] = useState({
    name: '',
    location_id: '',
    category_id: '',
    photo_url: '', // <-- new field
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCycles();
    fetchLocations();
    fetchCategories();
  }, []);

  const fetchCycles = async () => {
    const { data, error } = await supabase.from('cycles').select('*');
    if (error) {
      console.error(error);
      setError('❌ Could not fetch cycles.');
    } else {
      setCycles(data);
    }
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase.from('locations').select('id, name');
    if (!error) setLocations(data);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('cycle_categories')
      .select('id, name');
    if (!error) setCategories(data);
  };

  const handleAddCycle = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { data, error } = await supabase
      .from('cycles')
      .insert([
        {
          name: newCycle.name,
          location_id: newCycle.location_id,
          category_id: newCycle.category_id,
          available: true,
          photo_url: newCycle.photo_url,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      setError('❌ Could not add cycle.');
    } else {
      setCycles((prev) => [...prev, ...data]);
      setNewCycle({
        name: '',
        location_id: '',
        category_id: '',
        photo_url: '',
      });

      setMessage('✅ Cycle added successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteCycle = async (id) => {
    const { error } = await supabase.from('cycles').delete().eq('id', id);
    if (error) {
      console.error(error);
      setError('❌ Could not delete cycle.');
    } else {
      setCycles((prev) => prev.filter((c) => c.id !== id));
      setMessage('✅ Cycle deleted!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  const handleToggleAvailability = async (id, currentStatus) => {
    const { error } = await supabase
      .from('cycles')
      .update({ available: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error(error);
      setError('❌ Could not update availability.');
    } else {
      setCycles((prev) =>
        prev.map((c) => (c.id === id ? { ...c, available: !currentStatus } : c))
      );
      setMessage('✅ Availability updated!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-4 pb-10">
      {/* Back Button */}
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="btn btn-secondary"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="alert alert-success shadow-lg">
            <span>{message}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Add Cycle Form */}
      <div className="max-w-3xl mx-auto mb-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Add a New Cycle</h2>
        <form className="space-y-4" onSubmit={handleAddCycle}>
          <input
            type="text"
            placeholder="Cycle Name"
            className="input input-bordered w-full"
            value={newCycle.name}
            onChange={(e) =>
              setNewCycle((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          <input
            type="text"
            placeholder="Image URL"
            className="input input-bordered w-full"
            value={newCycle.photo_url}
            onChange={(e) =>
              setNewCycle((prev) => ({ ...prev, photo_url: e.target.value }))
            }
          />

          <select
            className="select select-bordered w-full"
            value={newCycle.location_id}
            onChange={(e) =>
              setNewCycle((prev) => ({ ...prev, location_id: e.target.value }))
            }
            required
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full"
            value={newCycle.category_id}
            onChange={(e) =>
              setNewCycle((prev) => ({ ...prev, category_id: e.target.value }))
            }
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary w-full">
            Add Cycle
          </button>
        </form>
      </div>

      {/* List of Existing Cycles */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 text-center">Existing Cycles</h3>
        {cycles.length === 0 ? (
          <p className="text-center">No cycles yet.</p>
        ) : (
          <ul className="space-y-2">
            {cycles.map((cycle) => (
              <li
                key={cycle.id}
                className="border rounded p-4 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {/* Cycle Image */}
                {cycle.image_url && cycle.image_url.startsWith('http') ? (
                  <img
                    src={cycle.image_url}
                    alt={cycle.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-32 h-32 bg-base-200 flex items-center justify-center text-xs text-gray-500 rounded">
                    No image
                  </div>
                )}

                {/* Cycle Info */}
                <div className="flex-1">
                  <strong>{cycle.name}</strong>
                  <div className="text-sm mt-1">
                    {cycle.available ? '✅ Available' : '🚫 Unavailable'}
                    <button
                      className={`ml-4 btn btn-xs ${
                        cycle.available ? 'btn-warning' : 'btn-success'
                      }`}
                      onClick={() =>
                        handleToggleAvailability(cycle.id, cycle.available)
                      }
                    >
                      {cycle.available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCycle(cycle.id)}
                  className="btn btn-sm btn-error"
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

export default ManageCycles;
