import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function FeaturedCycles() {
  const [cycles, setCycles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedCycles = async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('available', true)
        .limit(9); // ✅ Show up to 9

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
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Featured Cycles
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mt-2">
          Popular picks available for booking
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }, // ✅ 3 on desktop
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          className="pb-10"
        >
          {cycles.map((cycle) => (
            <SwiperSlide key={cycle.id}>
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition duration-200 h-full">
                <figure>
                  {cycle.image_url ? (
                    <img
                      src={cycle.image_url}
                      alt={cycle.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      No image available
                    </div>
                  )}
                </figure>

                <div className="card-body flex flex-col justify-between">
                  <div>
                    <h3 className="card-title text-lg sm:text-xl">
                      {cycle.name}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {cycle.description}
                    </p>
                    <p className="text-primary text-base sm:text-lg font-semibold">
                      £{cycle.price_per_day}/day
                    </p>
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary btn-sm mt-4"
                      onClick={async () => {
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();

                        const cyclePath = `/cycle/${cycle.id}`;
                        if (!user) {
                          navigate(
                            `/login?redirectTo=${encodeURIComponent(cyclePath)}`
                          );
                        } else {
                          navigate(cyclePath);
                        }
                      }}
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default FeaturedCycles;
