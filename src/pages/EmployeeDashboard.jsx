import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-4 pb-10">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-primary text-center mb-6">
          Employee Dashboard
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Welcome! You can manage bookings, cycles, accessories, and locations
          from here.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            className="btn btn-outline btn-primary w-full"
            onClick={() => navigate('/manage-bookings')}
          >
            <span className="mr-2">📄</span> Manage Bookings
          </button>

          <button
            className="btn btn-outline btn-primary w-full"
            onClick={() => navigate('/manage-cycles')}
          >
            <span className="mr-2">🚲</span> Manage Cycles
          </button>

          <button
            className="btn btn-outline btn-primary w-full"
            onClick={() => navigate('/manage-locations')}
          >
            <span className="mr-2">📍</span> Manage Locations
          </button>

          <button
            className="btn btn-outline btn-primary w-full"
            onClick={() => navigate('/manage-accessories')}
          >
            <span className="mr-2">🧰</span> Manage Accessories
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
