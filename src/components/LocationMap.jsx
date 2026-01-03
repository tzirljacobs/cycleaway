import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import supabase from '../supabaseClient';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons for Leaflet
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

const LocationMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error) setLocations(data);
    };
    fetchLocations();
  }, []);

  const ensureCrop = (url) => {
    if (!url) return null;
    return url.includes('fit=crop') ? url : `${url}&fit=crop`;
  };

  return (
    <div className="max-w-5xl mx-auto my-10 px-4 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-primary">
        📍 Our Locations
      </h2>

      {/* Map */}
      <MapContainer
        center={[51.505, -0.09]}
        zoom={5}
        style={{ height: '400px', width: '100%' }}
        className="rounded-lg shadow"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {locations
          .filter((loc) => loc.latitude && loc.longitude)
          .map((loc) => {
            const croppedUrl = ensureCrop(loc.photo_url);
            return (
              <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <strong>{loc.name}</strong>
                    <br />
                    {loc.address}
                    {croppedUrl && (
                      <img
                        src={croppedUrl}
                        alt={loc.name}
                        className="mt-2 rounded"
                        style={{
                          width: '200px',
                          height: 'auto',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Location Cards */}
      <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => {
          const croppedUrl = ensureCrop(loc.photo_url);
          return (
            <div
              key={loc.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {croppedUrl ? (
                <img
                  src={croppedUrl}
                  alt={loc.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-48 bg-base-200 flex items-center justify-center text-sm text-gray-500 rounded-t-xl">
                  No image available
                </div>
              )}
              <div className="p-4">
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-1">
                  {loc.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {loc.address}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationMap;
