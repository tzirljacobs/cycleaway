import React from 'react';

const About = () => {
  return (
    <div className="grid md:grid-cols-2 min-h-screen">
      {/* Left: Image */}
      <img
        src="/about.jpg"
        alt="About CycleAway"
        className="w-full h-full object-cover"
      />

      {/* Right: Text content */}
      <div className="bg-white p-10 flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          About CycleAway
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed">
          CycleAway is a platform that helps people find and rent cycles from
          trusted local providers. Whether you're commuting, exploring, or just
          cruising around, we make it easy to find the perfect ride.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mt-4">
          Our goal is to connect the community with convenient, eco-friendly,
          and affordable transportation. We're currently in beta — thank you for
          riding with us!
        </p>
      </div>
    </div>
  );
};

export default About;
