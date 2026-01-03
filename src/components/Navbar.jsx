import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="navbar bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-1">
          <a href="/">
            <img src="/logo.png" alt="CycleAway Logo" className="h-20" />
          </a>
        </div>

        {/* Hamburger for small screens */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-ghost btn-square"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={24} color="black" />
            ) : (
              <Menu size={24} color="black" />
            )}
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex flex-none items-center space-x-4">
          <NavLinks role={role} />
          <UserLinks user={user} userName={userName} onLogout={handleLogout} />
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-base-100 shadow-md px-6 pt-4 pb-6">
          <div className="flex flex-col space-y-4">
            <NavLinks role={role} onLinkClick={() => setMenuOpen(false)} />
            <UserLinks
              user={user}
              userName={userName}
              onLogout={handleLogout}
              onLinkClick={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NavLinks({ role, onLinkClick }) {
  return (
    <>
      <NavItem to="/about" onClick={onLinkClick}>
        About
      </NavItem>
      <NavItem to="/faq" onClick={onLinkClick}>
        FAQ
      </NavItem>
      <NavItem to="/contact" onClick={onLinkClick}>
        Contact
      </NavItem>
      {role === 'customer' && (
        <NavItem to="/customer-bookings" onClick={onLinkClick}>
          My Bookings
        </NavItem>
      )}
      {role === 'employee' && (
        <NavItem to="/employee-dashboard" onClick={onLinkClick}>
          Employee Dashboard
        </NavItem>
      )}
    </>
  );
}

function UserLinks({ user, userName, onLogout, onLinkClick }) {
  return (
    <>
      {user && (
        <NavItem to="/profile" onClick={onLinkClick}>
          Profile
        </NavItem>
      )}
      {user && userName && (
        <span className="text-sm text-primary font-semibold">
          Hello, {userName}!
        </span>
      )}
      {user ? (
        <button
          onClick={onLogout}
          className="btn btn-secondary w-full md:w-auto"
        >
          Log Out
        </button>
      ) : (
        <a className="btn btn-primary w-full md:w-auto" href="/login">
          Login
        </a>
      )}
    </>
  );
}

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `btn btn-ghost justify-start w-full md:w-auto ${
          isActive ? 'btn-active text-primary font-bold' : ''
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default Navbar;
