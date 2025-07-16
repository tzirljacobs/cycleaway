import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    'leaflet/dist/images/marker-icon-2x.png',
    import.meta.url
  ).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url)
    .href,
});

const ManageLocations = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadMoreLocations(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        loadMoreLocations(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [locations, hasMore]);

  const loadMoreLocations = async (initial = false) => {
    if (loadingMore || (!initial && !hasMore)) return;
    setLoadingMore(true);

    const start = initial ? 0 : page * 6;
    const end = start + 5;

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .range(start, end);

    if (!error) {
      if (data.length === 0) setHasMore(false);
      setLocations((prev) => {
        const all = initial ? data : [...prev, ...data];
        const unique = Array.from(
          new Map(all.map((item) => [item.id, item])).values()
        );
        return unique;
      });
      if (!initial) setPage((prev) => prev + 1);
    }

    setLoadingMore(false);
  };

  const handleDelete = async (id) => {
    const { data: cyclesUsingLocation, error: checkError } = await supabase
      .from('cycles')
      .select('id')
      .eq('location_id', id);

    if (checkError) {
      console.error(checkError);
      setError('Error checking linked cycles.');
      return;
    }

    if (cyclesUsingLocation.length > 0) {
      setError(
        `⚠️ This location is used by ${cyclesUsingLocation.length} cycle(s). Reassign or delete them first.`
      );
      return;
    }

    const { error } = await supabase.from('locations').delete().eq('id', id);

    if (error) {
      console.error(error);
      setError('Error deleting location.');
    } else {
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      setMessage('✅ Location deleted!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddressSearch = async (e) => {
    const query = e.target.value;
    setAddress(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
      setSuggestions([]);
    }
  };

  const handleAddressSelect = (selection) => {
    setAddress(selection.display_name);
    setLatitude(parseFloat(selection.lat));
    setLongitude(parseFloat(selection.lon));
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { data, error } = await supabase
      .from('locations')
      .insert([{ name, address, photo_url: photoUrl, latitude, longitude }])
      .select();

    if (error) {
      console.error(error);
      setError('❌ Error adding location.');
    } else {
      setLocations((prev) => [...data, ...prev]);
      setName('');
      setAddress('');
      setPhotoUrl('');
      setLatitude(null);
      setLongitude(null);
      setMessage('✅ Location added!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-4 pb-10">
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="btn btn-secondary"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {message && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="alert alert-success shadow-lg">
            <span>{message}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto mb-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Add a New Location
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Location Name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search for an address"
            className="input input-bordered w-full"
            value={address}
            onChange={handleAddressSearch}
          />
          <ul className="bg-white border rounded mt-1 max-h-40 overflow-y-auto">
            {suggestions.map((sugg, index) => (
              <li
                key={index}
                className="p-2 hover:bg-base-200 cursor-pointer"
                onClick={() => handleAddressSelect(sugg)}
              >
                {sugg.display_name}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Photo URL (optional)"
            className="input input-bordered w-full"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker
              setMessage={setMessage}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
            />
          </MapContainer>

          <button type="submit" className="btn btn-primary w-full">
            Add Location
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 text-center">
          Existing Locations
        </h3>
        {locations.length === 0 ? (
          <p className="text-center">No locations yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="border rounded p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4 w-full">
                  {loc.photo_url && loc.photo_url.startsWith('http') ? (
                    <img
                      src={
                        loc.photo_url.includes('fit=crop')
                          ? loc.photo_url
                          : `${loc.photo_url}&fit=crop`
                      }
                      alt={loc.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.textContent = 'No image';
                        fallback.className =
                          'w-20 h-20 bg-base-200 flex items-center justify-center text-xs text-gray-500 rounded';
                        e.target.parentNode.replaceChild(fallback, e.target);
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-base-200 flex items-center justify-center text-xs text-gray-500 rounded">
                      No image
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="font-semibold">{loc.name}</div>
                    <div className="text-sm text-gray-600">{loc.address}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="btn btn-sm btn-error w-full sm:w-auto"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        {loadingMore && (
          <p className="text-sm text-gray-400 text-center mt-4">
            Loading more locations...
          </p>
        )}
      </div>
    </div>
  );
};

function LocationMarker({ setMessage, setLatitude, setLongitude }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      setMessage(
        `📍 Location selected at [${position.lat.toFixed(
          4
        )}, ${position.lng.toFixed(4)}]`
      );
    }
  }, [position]);

  return position ? <Marker position={position} /> : null;
}

export default ManageLocations;
