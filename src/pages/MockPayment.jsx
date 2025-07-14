// src/pages/MockPayment.jsx

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
  const accessoryIds = params.getAll('accessory');

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
      if (!error) setAccessoryData(data);
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

    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('cycle_id', cycleId)
      .in('status', ['confirmed', 'active']);

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

    // Step 1: insert booking in Supabase
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
      setError('❌ Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    // Step 2: insert accessories (if any)
    if (accessoryIds.length > 0) {
      const accessoryInserts = accessoryIds.map((id) => ({
        booking_id: booking.id,
        accessory_id: id,
      }));

      const { error: accessoryInsertError } = await supabase
        .from('booking_accessories')
        .insert(accessoryInserts);

      if (accessoryInsertError) {
        setError('❌ Booking created, but failed to add accessories.');
        setLoading(false);
        return;
      }
    }

    // Step 3: create Stripe Checkout session
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: calculateTotal(
            startDate,
            endDate,
            cycle.price_per_day,
            accessoryData
          ),
          cycleName: cycle.name,
          success_url: `${window.location.origin}/booking-summary`,
          cancel_url: `${window.location.origin}/cancelled`,
        }),
      });

      const session = await response.json();

      if (session.id) {
        window.location.href = session.url;
      } else {
        setError('❌ Failed to start payment session.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err.message);
      setError('❌ Error contacting payment server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-primary">Secure Payment</h1>
        <p className="mb-4">
          You'll be redirected to Stripe for a test payment.
        </p>

        {error && (
          <div className="bg-red-100 text-error text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-sm text-info mb-4">Redirecting to Stripe...</div>
        )}

        <button
          onClick={handlePayment}
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay with Stripe'}
        </button>
      </div>
    </div>
  );
};

export default MockPayment;
