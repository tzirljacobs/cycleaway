import React from 'react';

const About = () => {
  return (
    <div>
      {/* Page Layout Grid */}
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <div className="h-64 md:h-auto">
          <img
            src="/about.jpg"
            alt="About CycleAway"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text content */}
        <div className="bg-white px-4 py-8 sm:px-6 sm:py-10 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">
            About CycleAway
          </h1>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
            CycleAway is a platform that helps people find and rent cycles from
            trusted local providers. Whether you're commuting, exploring, or
            just cruising around, we make it easy to find the perfect ride.
          </p>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mt-4">
            Our goal is to connect the community with convenient, eco-friendly,
            and affordable transportation. We're currently in beta — thank you
            for riding with us!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
