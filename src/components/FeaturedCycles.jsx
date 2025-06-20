import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

function FeaturedCycles() {
  const [cycles, setCycles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedCycles = async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('available', true)
        .limit(3); // show 3 featured cycles

      if (error) {
        console.error('❌ Error fetching featured cycles:', error.message);
      } else {
        setCycles(data);
      }
    };

    fetchFeaturedCycles();
  }, []);

  return (
    <section className="bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold">Featured Cycles</h2>
        <p className="text-gray-600 mt-2">
          Popular picks available for booking
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={cycle.image_url}
                alt={cycle.name}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title">{cycle.name}</h3>
              <p className="text-gray-600">{cycle.description}</p>
              <p className="text-lg font-semibold">
                £{cycle.price_per_day}/day
              </p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();

                    if (!user) {
                      navigate('/login');
                    } else {
                      // Just go to cycle detail — no location/dates passed yet
                      navigate(`/cycle/${cycle.id}`);
                    }
                  }}
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCycles;
