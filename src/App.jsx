import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';
import CycleDetail from './pages/CycleDetail';
import MockPayment from './pages/MockPayment';
import BookingSummary from './pages/BookingSummary';
import CustomerBookings from './pages/CustomerBookings';
import EmployeeDashboard from './pages/EmployeeDashboard';

import ManageBookings from './pages/ManageBookings';
import ManageCycles from './pages/ManageCycles';
import ManageLocations from './pages/ManageLocations';
import ManageAccessories from './pages/ManageAccessories';

import { Routes, Route } from 'react-router-dom';

import Login from './auth/Login';
import SignUp from './auth/SignUp';
import './printStyles.css';
import Profile from './pages/Profile';

function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'cupcake');
  }, []);

  return (
    <>
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment" element={<MockPayment />} />
          <Route path="/booking-summary" element={<BookingSummary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cycle/:id" element={<CycleDetail />} />
          <Route path="/customer-bookings" element={<CustomerBookings />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />

          <Route path="/manage-bookings" element={<ManageBookings />} />
          <Route path="/manage-cycles" element={<ManageCycles />} />
          <Route path="/manage-locations" element={<ManageLocations />} />
          <Route path="/manage-accessories" element={<ManageAccessories />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
