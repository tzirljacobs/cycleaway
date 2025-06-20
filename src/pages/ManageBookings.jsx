import React, { useEffect, useState } from 'react';
import '/src/printStyles.css';

import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [locations, setLocations] = useState([]);

  // ✅ Filter & Sort State
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await fetchAllBookings();
      await fetchAllLocations();
    };
    loadData();
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        user:user_id(name, email),
       cycle:cycle_id(name, location_id, available),

        accessories:booking_accessories(accessory_id, accessory:accessory_id(name, price))
      `
      )
      .order('start_time', { ascending: false });

    if (error) {
      setError('❌ Could not load bookings.');
    } else {
      setBookings(data);
    }

    setLoading(false);
  };

  const fetchAllLocations = async () => {
    const { data, error } = await supabase.from('locations').select('id, name');
    if (error) {
      console.error('❌ Could not load locations.', error);
    } else {
      setLocations(data);
    }
  };

  const updateBooking = async (id, updates) => {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      setError('❌ Failed to update booking.');
      console.error(error);
    } else {
      setMessage('✅ Booking updated.');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-6xl mx-auto mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="btn btn-secondary"
        >
          ⬅️ Back to Dashboard
        </button>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          ➕ New Booking
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-primary mb-4">All Bookings</h1>
        <button
          className="btn btn-outline btn-primary mb-4"
          onClick={() => window.print()}
        >
          🖨️ Print Bookings
        </button>

        {/* ✅ Filter + Sort UI */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="select select-bordered"
            value={selectedLocationFilter}
            onChange={(e) => setSelectedLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Start Date ↓ (Latest first)</option>
            <option value="asc">Start Date ↑ (Earliest first)</option>
          </select>
        </div>

        {loading && <p className="text-info">Loading bookings...</p>}
        {error && <p className="text-error mb-2">{error}</p>}
        {message && <p className="text-success mb-2">{message}</p>}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-600">No bookings found.</p>
        )}

        {!loading && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .filter((b) =>
                    selectedLocationFilter
                      ? b.cycle?.location_id === selectedLocationFilter
                      : true
                  )
                  .sort((a, b) => {
                    const aDate = new Date(a.start_time);
                    const bDate = new Date(b.start_time);
                    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
                  })
                  .map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div className="font-semibold">
                          {b.cycle?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {b.cycle?.available
                            ? '✅ Available'
                            : '🚫 Out of Service'}
                        </div>

                        {b.accessories?.length > 0 ? (
                          <ul className="text-sm text-gray-500 mt-1 space-y-1">
                            {b.accessories.map((a, i) => (
                              <li key={i}>
                                🧰 {a.accessory?.name} (£{a.accessory?.price})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-gray-400">
                            No accessories
                          </div>
                        )}
                      </td>

                      <td>{b.user?.name || 'Unknown'}</td>

                      <td>
                        <select
                          className="select select-sm select-bordered"
                          value={b.cycle?.location_id || ''}
                          onChange={async (e) => {
                            const newLoc = e.target.value;
                            const { error } = await supabase
                              .from('bookings')
                              .update({ location_id: newLoc })
                              .eq('id', b.id);

                            if (error) {
                              console.error(error);
                              setError('❌ Failed to update location.');
                            } else {
                              setBookings((prev) =>
                                prev.map((bk) =>
                                  bk.id === b.id
                                    ? {
                                        ...bk,
                                        cycle: {
                                          ...bk.cycle,
                                          location_id: newLoc,
                                        },
                                      }
                                    : bk
                                )
                              );
                              setMessage('✅ Location updated.');
                              setTimeout(() => setMessage(''), 3000);
                            }
                          }}
                          disabled={
                            b.status === 'active' || b.status === 'complete'
                          }
                        >
                          <option value="">Select location</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          type="date"
                          className="input input-sm input-bordered"
                          value={b.start_time?.slice(0, 10)}
                          onChange={(e) =>
                            updateBooking(b.id, { start_time: e.target.value })
                          }
                          disabled={
                            b.status === 'active' || b.status === 'complete'
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="input input-sm input-bordered"
                          value={b.end_time?.slice(0, 10)}
                          onChange={(e) =>
                            updateBooking(b.id, { end_time: e.target.value })
                          }
                          disabled={
                            b.status === 'active' || b.status === 'complete'
                          }
                        />
                      </td>

                      <td className="capitalize">{b.status}</td>
                      <td className="space-x-2">
                        {b.status === 'confirmed' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                updateBooking(b.id, { status: 'active' })
                              }
                            >
                              Start
                            </button>
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() =>
                                updateBooking(b.id, { status: 'cancelled' })
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {b.status === 'active' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              updateBooking(b.id, { status: 'complete' })
                            }
                          >
                            End
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
