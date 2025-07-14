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

  useEffect(() => {
    setMessage('✅ Booking confirmed successfully!');
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-4 sm:px-6 pb-10">
      <div className="max-w-xl mx-auto">
        {message && (
          <div className="alert alert-success shadow-lg mb-6 text-sm sm:text-base">
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md sm:shadow-lg text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-success mb-4">
            ✅ Booking Confirmed!
          </h1>
          <p className="mb-2 text-sm sm:text-base">
            Thank you for booking with CycleAway.
          </p>

          <div className="bg-base-100 rounded-lg p-4 text-left my-4 text-sm sm:text-base">
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
              <div className="mt-3">
                <p className="font-semibold mb-1">Included Accessories:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {accessories.map((a, i) => (
                    <li key={i}>
                      🧰 {a.name} (£{a.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="font-bold text-primary mt-4">
              Total Paid: £{total ?? '—'}
            </p>
          </div>

          {/* Responsive Buttons */}
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
      </div>
    </div>
  );
};

export default BookingSummary;
