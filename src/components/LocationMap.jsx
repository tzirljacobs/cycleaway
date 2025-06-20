import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import supabase from '../supabaseClient';
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

const LocationMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error) setLocations(data);
    };
    fetchLocations();
  }, []);

  console.log('📦 Locations fetched from Supabase:', locations);
  if (locations.length > 0) {
    console.log('🖼️ First location data:', locations[0]);
  }

  const ensureCrop = (url) => {
    if (!url) return null;
    return url.includes('fit=crop') ? url : `${url}&fit=crop`;
  };

  return (
    <div className="max-w-5xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4 text-center">📍 Our Locations</h2>
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
            console.log(`📍 ${loc.name} image:`, croppedUrl);
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
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => {
          const croppedUrl = ensureCrop(loc.photo_url);
          return (
            <div
              key={loc.id}
              className="bg-white shadow rounded-xl overflow-hidden"
            >
              {croppedUrl ? (
                <img
                  src={croppedUrl}
                  alt={loc.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-base-200 flex items-center justify-center text-sm text-gray-500">
                  No image available
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{loc.name}</h3>
                <p className="text-sm text-gray-600">{loc.address}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationMap;
