import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

function SearchBar() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: locationData } = await supabase
        .from('locations')
        .select('*');
      const { data: categoryData } = await supabase
        .from('cycle_categories')
        .select('*');
      setLocations(locationData || []);
      setCategories(categoryData || []);
    };
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      location: selectedLocation,
      category: selectedCategory,
      start: startDate,
      end: endDate,
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section id="search" className="w-full px-4">
      <form
        className="grid gap-4 md:grid-cols-4 bg-white bg-opacity-97 p-6 rounded-xl shadow-md"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="label">
            <span className="label-text">Location</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Cycle Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Type</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 flex justify-end mt-4">
          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Search
          </button>
        </div>
      </form>
    </section>
  );
}

export default SearchBar;
