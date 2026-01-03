import React, { useState, useEffect, useRef } from 'react';

const AddressInput = ({ address, setAddress, setLatitude, setLongitude }) => {
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
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
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    }
  };

  const handleSelect = (selection) => {
    setAddress(selection.display_name);
    if (setLatitude) setLatitude(parseFloat(selection.lat));
    if (setLongitude) setLongitude(parseFloat(selection.lon));
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search for an address"
        className="input input-bordered w-full"
        value={address}
        onChange={handleSearch}
      />
      {suggestions.length > 0 && (
        <ul className="bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10 relative">
          {suggestions.map((sugg, i) => (
            <li
              key={i}
              className="p-2 hover:bg-base-200 cursor-pointer"
              onClick={() => handleSelect(sugg)}
            >
              {sugg.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;
