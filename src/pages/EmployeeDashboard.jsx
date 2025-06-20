import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Employee Dashboard
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome! You can manage bookings, cycles, accessories, and locations
          from here.
        </p>

        <div className="grid gap-4 mt-6">
          <button
            className="btn btn-outline btn-primary"
            onClick={() => navigate('/manage-bookings')}
          >
            📄 Manage Bookings
          </button>

          <button
            className="btn btn-outline btn-primary"
            onClick={() => navigate('/manage-cycles')}
          >
            🚲 Manage Cycles
          </button>

          <button
            className="btn btn-outline btn-primary"
            onClick={() => navigate('/manage-locations')}
          >
            📍 Manage Locations
          </button>

          <button
            className="btn btn-outline btn-primary"
            onClick={() => navigate('/manage-accessories')}
          >
            🧰 Manage Accessories
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
