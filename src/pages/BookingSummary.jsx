import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const BookingSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const cycleId = params.get('cycle');
  const startDate = params.get('start');
  const endDate = params.get('end');
  const accessoryParam = params.get('accessory'); // comma-separated
  const accessoryIds = accessoryParam ? accessoryParam.split(',') : [];

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const confirmBooking = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('You must be logged in to view your booking.');
          return;
        }

        const userId = user.id;

        // Get cycle info
        const { data: cycle, error: cycleError } = await supabase
          .from('cycles')
          .select('name, location_id, price_per_day')
          .eq('id', cycleId)
          .single();

        if (cycleError || !cycle) {
          setError('Could not load cycle details.');
          return;
        }

        // Get accessory details
        let accessories = [];
        if (accessoryIds.length > 0) {
          const { data: accData } = await supabase
            .from('accessories')
            .select('id, name, price')
            .in('id', accessoryIds);
          accessories = accData;
        }

        // Insert booking
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([
            {
              user_id: userId,
              cycle_id: cycleId,
              start_time: startDate,
              end_time: endDate,
              location_id: cycle.location_id,
              status: 'confirmed',
            },
          ])
          .select()
          .single();

        if (bookingError || !booking) {
          setError('Something went wrong saving your booking.');
          return;
        }

        // Insert accessories
        if (accessories.length > 0) {
          const accessoryInserts = accessories.map((a) => ({
            booking_id: booking.id,
            accessory_id: a.id,
          }));
          await supabase.from('booking_accessories').insert(accessoryInserts);
        }

        const totalPrice = calculateTotal(
          startDate,
          endDate,
          cycle.price_per_day,
          accessories
        );

        setSummary({
          cycleName: cycle.name,
          startDate,
          endDate,
          accessories,
          total: totalPrice,
        });

        setMessage('✅ Booking confirmed successfully!');
      } catch (err) {
        console.error('BookingSummary error:', err.message);
        setError('❌ Something went wrong.');
      }
    };

    confirmBooking();
  }, []);

  function calculateTotal(start, end, price, accessories = []) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const days = Math.max(
      1,
      Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24))
    );
    const accessoryTotal = accessories.reduce((sum, a) => sum + a.price, 0);
    return days * price + accessoryTotal;
  }

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-4 sm:px-6 pb-10">
      <div className="max-w-xl mx-auto">
        {message && (
          <div className="alert alert-success shadow-lg mb-6 text-sm sm:text-base">
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error shadow-lg mb-6 text-sm sm:text-base">
            <span>{error}</span>
          </div>
        )}

        {summary && (
          <div className="bg-white p-6 rounded-xl shadow-md sm:shadow-lg text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-success mb-4">
              ✅ Booking Confirmed!
            </h1>
            <div className="bg-base-100 rounded-lg p-4 text-left my-4 text-sm sm:text-base">
              <p>
                <strong>Cycle:</strong> {summary.cycleName}
              </p>
              <p>
                <strong>Start:</strong>{' '}
                {new Date(summary.startDate).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{' '}
                {new Date(summary.endDate).toLocaleString()}
              </p>

              {summary.accessories.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold mb-1">Accessories:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {summary.accessories.map((a, i) => (
                      <li key={i}>
                        🧰 {a.name} (£{a.price})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="font-bold text-primary mt-4">
                Total Paid: £{summary.total}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-4">
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Return to Home
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                🖨️ Print or Save as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
