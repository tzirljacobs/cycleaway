import React from 'react';

const testimonials = [
  {
    name: 'Alice J.',
    quote:
      'CycleAway made my weekend trip so easy! The bikes were great and booking was smooth.',
    image: '/avatars/alice Cropped.jpg',
  },
  {
    name: 'Ben K.',
    quote: 'Fantastic service and really friendly staff. Highly recommend!',
    image: '/avatars/ben Cropped.jpg',
  },
  {
    name: 'Priya M.',
    quote:
      'Loved the accessory options! Everything was ready to go when I arrived.',
    image: '/avatars/camera Cropped.jpg',
  },
];

const Testimonials = () => {
  return (
    <section className="bg-base-100 py-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-primary">
          What Our Customers Say
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow flex flex-col items-center text-center"
            >
              <img
                src={t.image}
                alt={t.name}
                className="w-20 h-20 object-cover rounded-full mb-4"
              />
              {/* ⭐⭐⭐⭐⭐ */}
              <div className="flex mb-2">
                {Array(5)
                  .fill()
                  .map((_, idx) => (
                    <span key={idx} className="text-yellow-400 text-lg">
                      ★
                    </span>
                  ))}
              </div>

              <p className="italic text-gray-700">“{t.quote}”</p>
              <p className="mt-4 font-semibold text-gray-900">– {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
