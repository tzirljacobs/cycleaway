import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const SearchResults = () => {
  const [cycles, setCycles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const selectedLocation = params.get('location');
  const selectedCategory = params.get('category');
  const startDate = params.get('start');
  const endDate = params.get('end');

  useEffect(() => {
    const fetchCyclesAndBookings = async () => {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*');
      setBookings(bookingsData || []);
      setCycles([]); // reset on filter change
      setPage(1);
      setHasMore(true);
      await loadMore();
    };

    fetchCyclesAndBookings();
  }, [selectedLocation, selectedCategory, startDate, endDate]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    let query = supabase
      .from('cycles')
      .select('*')
      .eq('available', true)
      .range((page - 1) * 6, page * 6 - 1);

    if (selectedLocation) query = query.eq('location_id', selectedLocation);
    if (selectedCategory) query = query.eq('category_id', selectedCategory);

    const { data, error } = await query;

    if (error) {
      console.error(error.message);
      setHasMore(false);
    } else {
      if (data.length === 0) setHasMore(false);
      setCycles((prev) => [
        ...prev,
        ...data.map((cycle) => ({
          ...cycle,
          bookings: bookings.filter(
            (b) =>
              b.cycle_id === cycle.id &&
              (b.status === 'confirmed' || b.status === 'active')
          ),
        })),
      ]);
      setPage((prev) => prev + 1);
    }

    setLoadingMore(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cycles, hasMore]);

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
                    className="bg-white rounded-xl shadow overflow-hidden flex flex-col h-full"
                  >
                    {cycle.image_url && cycle.image_url.startsWith('http') ? (
                      <img
                        src={
                          cycle.image_url.includes('fit=crop')
                            ? cycle.image_url
                            : `${cycle.image_url}&fit=crop`
                        }
                        alt={cycle.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.textContent = 'No image';
                          fallback.className =
                            'w-full h-48 bg-base-200 flex items-center justify-center text-sm text-gray-500';
                          e.target.parentNode.replaceChild(fallback, e.target);
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-base-200 flex items-center justify-center text-sm text-gray-500">
                        No image
                      </div>
                    )}

                    <div className="p-4 flex flex-col flex-grow">
                      <h2 className="text-xl font-semibold mb-2">
                        {cycle.name}
                      </h2>
                      <p className="text-gray-600 flex-grow">
                        {cycle.description}
                      </p>
                      <p className="mt-2 text-primary font-bold">
                        £{cycle.price_per_day}/day
                      </p>

                      <button
                        className="mt-4 btn btn-outline btn-primary w-full"
                        onClick={async () => {
                          const {
                            data: { user },
                          } = await supabase.auth.getUser();

                          const cyclePath = `/cycle/${cycle.id}?start=${startDate}&end=${endDate}&location=${selectedLocation}`;

                          if (!user) {
                            navigate(
                              `/login?redirectTo=${encodeURIComponent(
                                cyclePath
                              )}`
                            );
                          } else {
                            navigate(cyclePath);
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

        {loadingMore && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Loading more...
          </div>
        )}
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
