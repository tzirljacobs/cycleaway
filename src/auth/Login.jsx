import React from 'react';
import LoginForm from '../components/LoginForm';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirectTo');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Log In to CycleAway
        </h1>
        <LoginForm redirectTo={redirectTo} />
        <p className="text-sm text-center mt-4 text-gray-700">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
