import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shirt } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo_minimal.svg" className="w-10 h-10 rounded-xl" alt="Logo" />
          <span className="text-2xl font-black tracking-tighter text-foreground">TRY-ON</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`text-sm font-bold ${location.pathname === link.to ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border p-6 space-y-4 animate-slide-up">
           {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-black text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
