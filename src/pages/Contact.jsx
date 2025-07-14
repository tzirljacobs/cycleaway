import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Banner Image */}
      <div className="w-full h-[60vh] sm:h-[50vh] md:h-[400px] overflow-hidden">
        <img
          src="/contact-banner.jpg"
          alt="Contact Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contact Info */}
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-4">
          Get in Touch
        </h1>
        <p className="text-base sm:text-lg text-center mb-6 text-gray-700">
          Have questions? We’re here to help!
        </p>

        <div className="text-center space-y-3 text-sm sm:text-base">
          <p>
            Email:{' '}
            <a
              href="mailto:hello@cycleaway.com"
              className="font-medium text-primary hover:underline"
            >
              hello@cycleaway.com
            </a>
          </p>
          <p>
            Phone:{' '}
            <a
              href="tel:+15551234567"
              className="font-medium text-primary hover:underline"
            >
              +1 (555) 123-4567
            </a>
          </p>
          <p>Hours: Mon–Fri, 9am–5pm</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
