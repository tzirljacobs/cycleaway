import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const CycleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [cycle, setCycle] = useState(null);
  const [locations, setLocations] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDateState, setStartDateState] = useState('');
  const [endDateState, setEndDateState] = useState('');
  const [errorMessages, setErrorMessages] = useState({});

  const params = new URLSearchParams(location.search);
  const startParam = params.get('start');
  const endParam = params.get('end');
  const locationParam = params.get('location');
  const cameFromSearch = startParam && endParam && locationParam;

  useEffect(() => {
    const fetchInitialData = async () => {
      // All your async logic lives here
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return navigate('/login');

      const { data: cycleData } = await supabase
        .from('cycles')
        .select('*')
        .eq('id', id)
        .single();
      setCycle(cycleData);

      const { data: locationData } = await supabase
        .from('locations')
        .select('*');
      setLocations(locationData || []);

      const { data: accessoryData } = await supabase
        .from('accessories')
        .select('*');
      setAccessories(accessoryData || []);

      // ✅ Prefill after location list is available
      if (locationParam && locationData?.length > 0) {
        const match = locationData.find(
          (loc) => loc.name.toLowerCase() === locationParam.toLowerCase()
        );
        if (match) {
          setSelectedLocation(String(match.id));
        }
      }

      if (startParam) setStartDateState(startParam);
      if (endParam) setEndDateState(endParam);
    };

    // ⬇️⬇️⬇️ THIS LINE is CRITICAL — it actually calls the async function ⬇️⬇️⬇️
    fetchInitialData();
  }, [id, navigate, locationParam, startParam, endParam]);
  useEffect(() => {
    if (!locationParam || locations.length === 0) return;

    const match = locations.find(
      (loc) => String(loc.id) === String(locationParam)
    );

    if (match) {
      setSelectedLocation(String(match.id));
    } else {
      console.log('❌ No matching location found for ID:', locationParam);
    }
  }, [locationParam, locations]);

  if (
    !cycle ||
    locations.length === 0 ||
    (cameFromSearch && selectedLocation === '')
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading booking details...
      </div>
    );
  }

  const totalDays =
    startDateState && endDateState
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDateState) - new Date(startDateState)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const accessoriesTotal = accessories
    .filter((a) => selectedAccessories.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const rentalTotal = totalDays * (cycle.price_per_day || 0);
  const totalCost = rentalTotal + accessoriesTotal;

  const handleConfirm = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return navigate('/login');

    const newErrors = {};
    if (!selectedLocation) newErrors.location = 'Please select a location.';
    if (!startDateState) newErrors.start = 'Please select a start date.';
    if (!endDateState) newErrors.end = 'Please select an end date.';
    setErrorMessages(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const accessoryParams = selectedAccessories
      .map((id) => `accessory=${id}`)
      .join('&');

    navigate(
      `/payment?cycle=${cycle.id}&start=${startDateState}&end=${endDateState}&location=${selectedLocation}&${accessoryParams}`
    );
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-6 pb-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow overflow-hidden">
        {cycle.image_url && (
          <img
            src={cycle.image_url}
            alt={cycle.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-primary mb-4">{cycle.name}</h1>
          <p className="text-gray-700 mb-4">{cycle.description}</p>
          <p className="text-lg font-semibold mb-4">
            Price: £{cycle.price_per_day}/day
          </p>

          {/* Booking Form */}
          <div className="bg-base-100 p-4 rounded-xl shadow mb-4">
            <h2 className="text-lg font-bold mb-2">Booking Details</h2>

            {/* Location */}
            <div className="mb-2">
              <label className="block mb-1 font-medium">Location:</label>
              <select
                className="select select-bordered w-full"
                value={String(selectedLocation)}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={cameFromSearch}
              >
                {!cameFromSearch && <option value="">Select a location</option>}

                {locations.map((l) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errorMessages.location && (
                <p className="text-error text-sm">{errorMessages.location}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={startDateState}
                  onChange={(e) => setStartDateState(e.target.value)}
                  disabled={cameFromSearch}
                />
                {errorMessages.start && (
                  <p className="text-error text-sm">{errorMessages.start}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">End Date</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={endDateState}
                  onChange={(e) => setEndDateState(e.target.value)}
                  disabled={cameFromSearch}
                />
                {errorMessages.end && (
                  <p className="text-error text-sm">{errorMessages.end}</p>
                )}
              </div>
            </div>

            {/* Summary */}
            {startDateState && endDateState && (
              <div className="mt-4 space-y-1">
                <p>
                  <strong>Total Days:</strong> {totalDays}
                </p>
                <p>
                  <strong>Rental:</strong> £{rentalTotal}
                </p>
                <p>
                  <strong>Accessories:</strong> £{accessoriesTotal}
                </p>
                <p className="text-primary font-bold text-xl">
                  Total: £{totalCost}
                </p>
              </div>
            )}
          </div>

          {/* Accessories */}
          {accessories.length > 0 && (
            <div className="bg-base-100 p-4 rounded-xl shadow mb-4">
              <h2 className="text-lg font-bold mb-2">Add Accessories</h2>
              <div className="space-y-2">
                {accessories.map((a) => (
                  <label key={a.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAccessories.includes(a.id)}
                      onChange={() => {
                        setSelectedAccessories((prev) =>
                          prev.includes(a.id)
                            ? prev.filter((id) => id !== a.id)
                            : [...prev, a.id]
                        );
                      }}
                    />
                    <span>
                      🧰 {a.name} (£{a.price})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary w-full" onClick={handleConfirm}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CycleDetail;
