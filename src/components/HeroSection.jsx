import React from 'react';
import SearchBar from './SearchBar'; // ✅ use your existing form logic

function HeroSection() {
  return (
    <section
      className="relative bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/Heroimage.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-6 sm:pt-10 pb-16 min-h-screen">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
          Ride Into Adventure
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white drop-shadow-sm mb-6">
          Find and book quality cycles at your favorite locations — fast, easy,
          and affordable.
        </p>

        <div className="w-full max-w-4xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
