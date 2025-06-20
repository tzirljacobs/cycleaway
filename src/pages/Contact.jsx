import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Banner Image - taller and responsive */}
      <div className="w-full h-[70vh] sm:h-[60vh] md:h-[500px] overflow-hidden">
        <img
          src="/contact-banner.jpg"
          alt="Contact Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contact Info */}
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Get in Touch</h1>
        <p className="text-lg text-center mb-4 text-gray-700">
          Have questions? We’re here to help!
        </p>

        <div className="text-center space-y-2">
          <p>
            Email: <span className="font-medium">hello@cycleaway.com</span>
          </p>
          <p>
            Phone: <span className="font-medium">+1 (555) 123-4567</span>
          </p>
          <p>Hours: Mon–Fri, 9am–5pm</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
