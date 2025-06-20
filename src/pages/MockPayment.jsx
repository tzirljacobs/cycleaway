import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const MockPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessoryData, setAccessoryData] = useState([]);

  const params = new URLSearchParams(location.search);
  const cycleId = params.get('cycle');
  const startDate = params.get('start');
  const endDate = params.get('end');
  const accessoryIds = params.getAll('accessory'); // ✅ new

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

  useEffect(() => {
    const loadAccessories = async () => {
      if (accessoryIds.length === 0) return;

      const { data, error } = await supabase
        .from('accessories')
        .select('id, name, price')
        .in('id', accessoryIds);

      if (error) {
        console.error('❌ Failed to load accessories:', error.message);
      } else {
        setAccessoryData(data);
      }
    };

    loadAccessories();
  }, [accessoryIds]);

  const handlePayment = async () => {
    setError('');
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('❌ You must be logged in to complete the booking.');
      setLoading(false);
      return;
    }

    const userId = user.id;
    // Get cycle data and check if it's available
    const { data: cycle, error: cycleError } = await supabase
      .from('cycles')
      .select('location_id, price_per_day, name, available')
      .eq('id', cycleId)
      .single();

    if (cycleError || !cycle) {
      setError('❌ Could not find the selected cycle.');
      setLoading(false);
      return;
    }

    if (!cycle.available) {
      setError('🚫 This cycle is currently out of service.');
      setLoading(false);
      return;
    }

    // Check if the cycle is already booked for the selected dates
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('cycle_id', cycleId);

    if (bookingsError) {
      setError('❌ Failed to check existing bookings.');
      setLoading(false);
      return;
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const isOverlapping = existingBookings.some((b) => {
      const bookedStart = new Date(b.start_time);
      const bookedEnd = new Date(b.end_time);
      return newStart < bookedEnd && newEnd > bookedStart;
    });

    if (isOverlapping) {
      setError('⚠️ This cycle is already booked during your selected dates.');
      setLoading(false);
      return;
    }

    // Step 1: insert the booking
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
      console.error('❌ Booking failed:', bookingError.message);
      setError('❌ Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    // Step 2: insert accessories (if any)
    if (accessoryIds.length > 0) {
      const accessoryInserts = accessoryIds.map((id) => ({
        booking_id: booking.id,
        accessory_id: id.toString(),
      }));

      const { error: accessoryInsertError } = await supabase
        .from('booking_accessories')
        .insert(accessoryInserts);

      if (accessoryInsertError) {
        console.error(
          '❌ Failed to add accessories:',
          accessoryInsertError.message
        );
        setError('❌ Booking created, but failed to add accessories.');
        setLoading(false);
        return;
      }
    }

    navigate('/booking-summary', {
      state: {
        cycleName: cycle.name,
        startDate,
        endDate,
        total: calculateTotal(
          startDate,
          endDate,
          cycle.price_per_day,
          accessoryData
        ),
        accessories: accessoryData, // ✅ Add this line
      },
    });
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-primary">Payment</h1>
        <p className="mb-4">Enter your card details to complete the booking:</p>

        {error && (
          <div className="bg-red-100 text-error text-sm p-3 rounded mb-4">
            {error}
            <button
              onClick={() => navigate('/')}
              className="btn btn-outline btn-sm mt-3"
            >
              🔍 Return to Search
            </button>
          </div>
        )}

        {loading && (
          <div className="text-sm text-info mb-4">Processing payment...</div>
        )}

        <div className="grid gap-4 mb-6">
          <input
            type="text"
            placeholder="Card Number"
            className="input input-bordered w-full"
          />
          <input
            type="text"
            placeholder="Name on Card"
            className="input input-bordered w-full"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM/YY"
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="CVV"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default MockPayment;
