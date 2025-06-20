import React from 'react';
import SearchBar from './SearchBar'; // ✅ use your existing form logic

function HeroSection() {
  return (
    <section
      className="hero min-h-[80vh] bg-cover bg-center relative"
      style={{ backgroundImage: "url('/Heroimage.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="hero-content relative z-10 flex flex-col items-center justify-center text-center w-full px-4">
        <h1 className="text-5xl font-bold text-white drop-shadow-md mb-4">
          Ride Into Adventure
        </h1>
        <p className="text-lg text-white drop-shadow-sm mb-6">
          Find and book quality cycles at your favorite locations — fast, easy,
          and affordable.
        </p>

        {/* 🔍 SearchBar goes directly below, no card */}
        <div className="w-full max-w-4xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
