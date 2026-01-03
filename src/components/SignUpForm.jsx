import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import AddressInput from '../components/AddressInput';

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agree) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: userId,
          name,
          role,
          email,
          phone,
          address,
          latitude,
          longitude,
        },
      ]);

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }

      setSuccess('✅ Account created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

      {error && <div className="text-error text-sm mb-2">❌ {error}</div>}
      {success && <div className="text-success text-sm mb-2">{success}</div>}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
          <label className="label">Phone</label>
          <input
            type="tel"
            className="input input-bordered w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Address</label>
          <AddressInput
            address={address}
            setAddress={setAddress}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
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

        <div>
          <label className="label">Confirm Password</label>
          <input
            type="password"
            className="input input-bordered w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Role</label>
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="form-control">
          <label className="cursor-pointer label flex gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span className="label-text text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-primary underline">
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
