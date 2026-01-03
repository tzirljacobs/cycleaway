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
    image_url: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
    fetchCategories();
    fetchCycles(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        fetchCycles(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [cycles, hasMore]);

  const fetchLocations = async () => {
    const { data } = await supabase.from('locations').select('id, name');
    if (data) setLocations(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('cycle_categories').select('id, name');
    if (data) setCategories(data);
  };

  const fetchCycles = async (initial = false) => {
    if (loadingMore || (!initial && !hasMore)) return;
    setLoadingMore(true);

    const start = initial ? 0 : page * 6;
    const end = start + 5;

    const { data, error } = await supabase
      .from('cycles')
      .select(
        `
        *,
        location:locations!fk_location_id(name)
      `
      )
      .range(start, end);

    if (error) {
      console.error('Supabase error:', error);
      setError('❌ Could not fetch cycles.');
      setLoadingMore(false);
      return;
    }

    if (data.length === 0) setHasMore(false);

    setCycles((prev) => (initial ? data : [...prev, ...data]));
    if (!initial) setPage((prev) => prev + 1);
    setLoadingMore(false);
  };

  const handleAddCycle = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { data, error } = await supabase
      .from('cycles')
      .insert([
        {
          ...newCycle,
          available: true,
        },
      ])
      .select();

    if (error) {
      setError('❌ Could not add cycle.');
    } else {
      setCycles((prev) => [...prev, ...data]);
      setNewCycle({
        name: '',
        location_id: '',
        category_id: '',
        image_url: '',
      });
      setMessage('✅ Cycle added successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteCycle = async (id) => {
    const { error } = await supabase.from('cycles').delete().eq('id', id);
    if (error) {
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
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="btn btn-secondary"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

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

      {/* Form */}
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
            value={newCycle.image_url}
            onChange={(e) =>
              setNewCycle((prev) => ({ ...prev, image_url: e.target.value }))
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

      {/* List */}
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
                {cycle.image_url && cycle.image_url.startsWith('http') ? (
                  <img
                    src={
                      cycle.image_url.includes('fit=crop')
                        ? cycle.image_url
                        : `${cycle.image_url}&fit=crop`
                    }
                    alt={cycle.name}
                    className="w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.textContent = 'No image';
                      fallback.className =
                        'w-32 h-32 bg-base-200 flex items-center justify-center text-xs text-gray-500 rounded';
                      e.target.parentNode.replaceChild(fallback, e.target);
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-base-200 flex items-center justify-center text-xs text-gray-500 rounded">
                    No image
                  </div>
                )}

                <div className="flex-1">
                  <strong>{cycle.name}</strong>
                  <p className="text-sm text-gray-500">
                    📍 Location: {cycle.location?.name || 'Unknown'}
                  </p>
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
        {loadingMore && (
          <p className="text-sm text-gray-400 text-center mt-4">
            Loading more cycles...
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageCycles;
