import React from 'react';
import LoginForm from '../components/LoginForm';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirectTo'); // ✅ grab the URL param

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Log In to CycleAway
        </h1>
        <LoginForm redirectTo={redirectTo} /> {/* ✅ pass it in */}
        <p className="text-sm text-center mt-4 text-gray-700 dark:text-gray-300">
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
