import React from 'react';

const FAQ = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: "url('/faq-bg.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-primary text-center">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {[
            {
              question: 'How do I book a cycle?',
              answer:
                'You can search and select a cycle from the homepage, then follow the booking steps.',
            },
            {
              question: 'Do I need an account?',
              answer:
                'Yes, you’ll need to sign up for a CycleAway account to make a booking.',
            },
            {
              question: 'Where can I pick up the cycle?',
              answer:
                'Pick-up locations are listed in each cycle’s details. Some also offer delivery.',
            },
            {
              question: 'What if I need to cancel?',
              answer:
                'You can cancel your booking from your dashboard. Please review our cancellation policy for any charges.',
            },
            {
              question: 'Are helmets or accessories included?',
              answer:
                'You can add accessories like helmets or baskets during the booking process.',
            },
            {
              question: 'How do I contact support?',
              answer:
                'You can reach us via the contact form or email at support@cycleaway.com.',
            },
          ].map((faq, index) => (
            <div
              key={index}
              tabIndex={0}
              className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
            >
              <div className="collapse-title text-lg font-medium">
                {faq.question}
              </div>
              <div className="collapse-content">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
