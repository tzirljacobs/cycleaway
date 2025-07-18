import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import supabase from '../supabaseClient';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // 🧠 Get redirect path from URL
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirectTo');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        // ✅ Redirect to original path if it exists
        if (profile?.role === 'employee') {
          navigate('/employee-dashboard');
        } else if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded-lg mt-28">
      <h2 className="text-2xl font-bold mb-4 text-center text-primary">
        Log In
      </h2>

      {error && (
        <div className="alert alert-error mb-4 py-2 text-sm shadow">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="alert alert-info mb-4 py-2 text-sm shadow">
          Logging in...
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input input-bordered w-full pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="text-sm text-center mt-4 text-gray-500">
        Don’t have an account?{' '}
        <button
          className="text-primary hover:underline"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
