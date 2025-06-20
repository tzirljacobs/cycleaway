import React from 'react';

const testimonials = [
  {
    name: 'Alice J.',
    quote:
      'CycleAway made my weekend trip so easy! The bikes were great and booking was smooth.',
  },
  {
    name: 'Ben K.',
    quote: 'Fantastic service and really friendly staff. Highly recommend!',
  },
  {
    name: 'Priya M.',
    quote:
      'Loved the accessory options! Everything was ready to go when I arrived.',
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
            <div key={i} className="bg-white p-6 rounded-xl shadow">
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
