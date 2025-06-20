import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

function Navbar() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const loggedInUser = data.user;
      setUser(loggedInUser);

      if (loggedInUser) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', loggedInUser.id)
          .single();

        setUserName(userProfile?.name || '');
        setRole(userProfile?.role || '');
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-100 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-1">
          <a href="/">
            <img src="/logo.png" alt="CycleAway Logo" className="h-24 ml-2" />
          </a>
        </div>

        {/* Navigation links and buttons */}
        <div className="flex-none flex items-center space-x-6">
          {/* Left links */}
          <div className="flex space-x-3">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `btn btn-ghost ${
                  isActive ? 'btn-active text-primary font-bold' : ''
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `btn btn-ghost ${
                  isActive ? 'btn-active text-primary font-bold' : ''
                }`
              }
            >
              FAQ
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `btn btn-ghost ${
                  isActive ? 'btn-active text-primary font-bold' : ''
                }`
              }
            >
              Contact
            </NavLink>

            {role === 'customer' && (
              <NavLink
                to="/customer-bookings"
                className={({ isActive }) =>
                  `btn btn-ghost ${
                    isActive ? 'btn-active text-primary font-bold' : ''
                  }`
                }
              >
                My Bookings
              </NavLink>
            )}

            {role === 'employee' && (
              <NavLink
                to="/employee-dashboard"
                className={({ isActive }) =>
                  `btn btn-ghost ${
                    isActive ? 'btn-active text-primary font-bold' : ''
                  }`
                }
              >
                Employee Dashboard
              </NavLink>
            )}
          </div>

          {/* Right-side: Profile, greeting, and logout/login */}
          <div className="flex items-center space-x-3">
            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `btn btn-ghost ${
                    isActive ? 'btn-active text-primary font-bold' : ''
                  }`
                }
              >
                Profile
              </NavLink>
            )}

            {user && userName && (
              <span className="text-sm text-primary font-semibold">
                Hello, {userName}!
              </span>
            )}

            {user ? (
              <button onClick={handleLogout} className="btn btn-error">
                Log Out
              </button>
            ) : (
              <a className="btn btn-primary" href="/login">
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
