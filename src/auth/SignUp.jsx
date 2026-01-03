import React from 'react';
import SignUpForm from '../components/SignUpForm';

const SignUp = () => {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Create your CycleAway account
        </h1>
        <SignUpForm />
        <p className="text-sm text-center mt-4 text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
