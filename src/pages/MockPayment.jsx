import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const MockPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 👇 Build a return path with all query params
        const returnPath = `/payment?cycle=${cycleId}&start=${startDate}&end=${endDate}&accessory=${accessoryIds.join(
          ','
        )}`;
        navigate(`/login?redirectTo=${encodeURIComponent(returnPath)}`);
      }
    };

    checkUser();
  }, []);

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

    const { data: cycle, error: cycleError } = await supabase
      .from('cycles')
      .select('name, price_per_day, available')
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

    // Calculate total
    const total = calculateTotal(
      startDate,
      endDate,
      cycle.price_per_day,
      accessoryData
    );

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: total,
          cycleName: cycle.name,
          success_url: `${
            window.location.origin
          }/booking-summary?cycle=${cycleId}&start=${startDate}&end=${endDate}&accessory=${accessoryIds.join(
            ','
          )}`,
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

        <button
          onClick={() => navigate('/')}
          className="btn btn-outline btn-error w-full mt-4"
          disabled={loading}
        >
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
};

export default MockPayment;
