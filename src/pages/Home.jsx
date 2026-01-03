import React from 'react';
import HeroSection from '../components/HeroSection';

import FeaturedCycles from '../components/FeaturedCycles';
import Testimonials from '../components/Testimonials';
import LocationMap from '../components/LocationMap';

const Home = () => {
  return (
    <>
      <HeroSection />

      <FeaturedCycles />
      <LocationMap />
      <Testimonials />
    </>
  );
};

export default Home;
