import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // ✅ useNavigate added
import supabase from '../supabaseClient';

const SearchResults = () => {
  const [cycles, setCycles] = useState([]);
  const location = useLocation();
  const navigate = useNavigate(); // ✅ initialize navigate

  const params = new URLSearchParams(location.search);
  const selectedLocation = params.get('location');
  const selectedCategory = params.get('category');
  const startDate = params.get('start');
  const endDate = params.get('end');

  useEffect(() => {
    const fetchCyclesAndBookings = async () => {
      let cycleQuery = supabase
        .from('cycles')
        .select('*')
        .eq('available', true);

      if (selectedLocation) {
        cycleQuery = cycleQuery.eq('location_id', selectedLocation);
      }

      if (selectedCategory) {
        cycleQuery = cycleQuery.eq('category_id', selectedCategory);
      }

      const { data: cyclesData, error: cyclesError } = await cycleQuery;
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

      if (!cyclesError && !bookingsError) {
        console.log('✅ Raw Cycles:', cyclesData);
        console.log('📅 Bookings:', bookingsData);
        setCycles(
          cyclesData.map((cycle) => ({
            ...cycle,
            bookings: bookingsData.filter((b) => b.cycle_id === cycle.id),
          }))
        );
      } else {
        console.error('❌ Error loading data:', cyclesError || bookingsError);
      }
    };

    fetchCyclesAndBookings();
  }, [selectedLocation, selectedCategory, startDate, endDate]);

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Available Cycles
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cycles.filter((cycle) =>
            startDate && endDate
              ? isAvailableForDates(cycle.bookings, startDate, endDate)
              : true
          ).length === 0 ? (
            <div className="col-span-full text-center bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold text-error mb-2">
                No cycles found
              </h2>
              <p className="text-gray-600 mb-4">
                Try changing the location, type, or dates and search again.
              </p>
              <button
                className="btn btn-outline btn-primary"
                onClick={() => navigate('/')}
              >
                🔍 Return to Search
              </button>
            </div>
          ) : (
            cycles
              .filter((cycle) =>
                startDate && endDate
                  ? isAvailableForDates(cycle.bookings, startDate, endDate)
                  : true
              )
              .map((cycle) => {
                const isAvailable =
                  startDate && endDate
                    ? isAvailableForDates(cycle.bookings, startDate, endDate)
                    : true;

                return (
                  <div
                    key={cycle.id}
                    className="bg-white rounded-xl shadow overflow-hidden"
                  >
                    {cycle.image_url && (
                      <img
                        src={cycle.image_url}
                        alt={cycle.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h2 className="text-xl font-semibold mb-2">
                        {cycle.name}
                      </h2>
                      <p className="text-gray-600">{cycle.description}</p>
                      <p className="mt-2 text-primary font-bold">
                        £{cycle.price_per_day}/day
                      </p>

                      <button
                        className="mt-4 btn btn-outline btn-primary w-full"
                        onClick={async () => {
                          const {
                            data: { user },
                          } = await supabase.auth.getUser();

                          if (!user) {
                            navigate('/login');
                          } else {
                            navigate(
                              `/cycle/${cycle.id}?start=${startDate}&end=${endDate}&location=${selectedLocation}`
                            );
                          }
                        }}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? 'Book Now' : 'Unavailable'}
                      </button>

                      {!isAvailable && (
                        <p className="text-xs text-error mt-2 text-center">
                          ❌ Not available for selected dates
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

function isAvailableForDates(bookings, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return !bookings.some((booking) => {
    const bookedStart = new Date(booking.start_time);
    const bookedEnd = new Date(booking.end_time);
    return start < bookedEnd && end > bookedStart;
  });
}

export default SearchResults;
