import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import '../printStyles.css';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    const userId = sessionData?.session?.user?.id;
    if (!userId || sessionError) {
      setError('You must be logged in to view your bookings.');
      setLoading(false);
      return;
    }

    const [bookingRes, locationRes] = await Promise.all([
      supabase
        .from('bookings')
        .select(
          `
          id,
          start_time,
          end_time,
          status,
          cycle:cycle_id(name, location_id)
        `
        )
        .eq('user_id', userId)
        .order('start_time', { ascending: false }),

      supabase.from('locations').select('id, name'),
    ]);

    if (bookingRes.error) {
      setError('Failed to load bookings.');
    }
    if (locationRes.error) {
      setError('Failed to load locations.');
    }

    if (!bookingRes.error && !locationRes.error) {
      setBookings(bookingRes.data);
      setLocations(locationRes.data);
    }

    setLoading(false);
  };
  const isOverlappingBooking = (
    cycleId,
    newStart,
    newEnd,
    currentBookingId
  ) => {
    return bookings.some((b) => {
      if (b.cycle?.location_id !== cycleId || b.id === currentBookingId)
        return false;

      const bookedStart = new Date(b.start_time);
      const bookedEnd = new Date(b.end_time);
      const start = new Date(newStart);
      const end = new Date(newEnd);

      return start < bookedEnd && end > bookedStart;
    });
  };

  const updateBooking = async (id, updates) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const cycleId = booking.cycle?.location_id;
    const start = updates.start_time || booking.start_time;
    const end = updates.end_time || booking.end_time;

    if (isOverlappingBooking(cycleId, start, end, id)) {
      setError('⚠️ These new dates overlap with another booking.');
      return;
    }

    const { error: updateErr } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id);

    if (updateErr) {
      setError('Failed to update booking.');
    } else {
      setMessage('Booking updated.');
      fetchData();
    }
  };

  const getLocationName = (locId) => {
    const loc = locations.find((l) => l.id === locId);
    return loc ? loc.name : '—';
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-primary mb-4">Your Bookings</h1>
        <button
          className="btn btn-outline btn-primary mb-4"
          onClick={() => window.print()}
        >
          🖨️ Print Bookings
        </button>

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
                  <th>Location</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.cycle?.name || 'Unknown'}</td>
                    <td>{getLocationName(b.cycle?.location_id)}</td>
                    <td>
                      <input
                        type="date"
                        className="input input-sm input-bordered"
                        value={b.start_time?.slice(0, 10)}
                        disabled={b.status !== 'confirmed'}
                        onChange={(e) =>
                          updateBooking(b.id, { start_time: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="input input-sm input-bordered"
                        value={b.end_time?.slice(0, 10)}
                        disabled={b.status !== 'confirmed'}
                        onChange={(e) =>
                          updateBooking(b.id, { end_time: e.target.value })
                        }
                      />
                    </td>
                    <td className="capitalize">{b.status}</td>
                    <td>
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
                            className="btn btn-sm btn-error ml-2"
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

export default CustomerBookings;
