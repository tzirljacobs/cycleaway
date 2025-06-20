import React, { useEffect, useState } from 'react';
import '../printStyles.css';

import { useLocation, useNavigate } from 'react-router-dom';

const BookingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const cycleName = state?.cycleName || 'Unknown Cycle';
  const startDate = state?.startDate;
  const endDate = state?.endDate;
  const total = state?.total;
  const accessories = state?.accessories || [];

  // Set the success message and remove it after 3 seconds
  useEffect(() => {
    setMessage('✅ Booking confirmed successfully!');
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-xl mx-auto">
        {/* ✅ Green success alert */}
        {message && (
          <div className="alert alert-success shadow-lg mb-6">
            <span>{message}</span>
          </div>
        )}

        {/* 🧾 Booking summary card */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h1 className="text-3xl font-bold text-success mb-4">
            ✅ Booking Confirmed!
          </h1>
          <p className="mb-2">Thank you for booking with CycleAway.</p>

          <div className="bg-base-100 rounded-lg p-4 text-left my-4">
            <p>
              <strong>Cycle:</strong> {cycleName}
            </p>
            <p>
              <strong>Start Date:</strong>{' '}
              {startDate
                ? new Date(startDate).toLocaleString()
                : 'Not available'}
            </p>

            <p>
              <strong>End Date:</strong>{' '}
              {endDate ? new Date(endDate).toLocaleString() : 'Not available'}
            </p>
            {accessories.length > 0 && (
              <div className="mt-2">
                <strong>Accessories:</strong>
                <ul className="list-disc list-inside ml-2 text-sm text-gray-700">
                  {accessories.map((a) => (
                    <li key={a.id}>
                      {a.name} – £{a.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {state?.accessories?.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold mb-1">Included Accessories:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {state.accessories.map((a, i) => (
                    <li key={i}>
                      🧰 {a.name} (£{a.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="font-bold text-primary mt-2">
              Total Paid: £{total ?? '—'}
            </p>
          </div>

          {/* 🏠 Manual return to homepage button */}
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
          <button
            className="btn btn-secondary mt-2 ml-2"
            onClick={() => window.print()}
          >
            🖨️ Print or Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
