// NOTE: This file (AuthPage.jsx) is not part of the main project build plan.
// It was created as a test layout to toggle between login and signup in one page.
// Currently not used in routing — safe to ignore or delete later.

import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md">
        {isLogin ? <LoginForm /> : <SignUpForm />}
        <div className="text-center mt-4">
          {isLogin ? (
            <>
              <p>Don’t have an account?</p>
              <button
                className="btn btn-link"
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <p>Already have an account?</p>
              <button className="btn btn-link" onClick={() => setIsLogin(true)}>
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
