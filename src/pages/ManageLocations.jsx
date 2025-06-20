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
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (!error) setLocations(data);
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
      setLocations((prev) => [...prev, ...data]);
      setName('');
      setAddress('');
      setPhotoUrl(''); // ← add this here
      setLatitude(null); // optional: reset coordinates too
      setLongitude(null);
      setMessage('✅ Location added!');

      setTimeout(() => setMessage(''), 3000);
    }
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

  return (
    <div className="min-h-screen bg-base-200 pt-28 px-4 pb-10">
      {/* Back Button */}
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="btn btn-secondary"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {/* Success/Error Messages */}
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

      {/* Add Location Form */}
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
            center={[51.505, -0.09]} // Default center (London)
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

      {/* Existing Locations */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 text-center">
          Existing Locations
        </h3>
        {locations.length === 0 ? (
          <p className="text-center">No locations yet.</p>
        ) : (
          <ul className="space-y-2">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-4">
                    {loc.photo_url && (
                      <img
                        src={loc.photo_url}
                        alt={loc.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <strong>{loc.name}</strong> – {loc.address}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="btn btn-sm btn-error"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
function LocationMarker({ setMessage, setLatitude, setLongitude }) {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
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
