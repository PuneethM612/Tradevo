
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  // Hide static navbar on auth pages, landing page (which uses FloatingNav), 
  // and hide it entirely when logged in to give full focus to the terminal.
  if (isAuthPage || isLandingPage || isLoggedIn) return null;

  const navLinks = [
    { name: 'Platform', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'Methodology', href: '#methodology' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-6 h-6 border-2 border-[#00ff9c] flex items-center justify-center">
            <div className="w-2 h-2 bg-[#00ff9c] group-hover:scale-150 transition-transform duration-300"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase italic">Tradevo</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-[10px] font-bold tracking-[0.3em] uppercase">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-white/40 hover:text-[#00ff9c] transition-colors cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#00ff9c] text-black hover:shadow-[0_0_20px_rgba(0,255,156,0.4)] transition-all duration-300 rounded-sm"
          >
            Initialize
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
