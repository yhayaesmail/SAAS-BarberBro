import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/barbers?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      setMenuOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/barbers/suggestions?q=${encodeURIComponent(val.trim())}`);
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const selectSuggestion = (s) => {
    navigate(`/barbers/${s.id}`);
    setQuery('');
    setShowSuggestions(false);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-km">KM</span>
          <span className="brand-barber">BARBER</span>
        </Link>

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>

        <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/barbers" className="nav-link" onClick={() => setMenuOpen(false)}>Get A Cut</Link>
          {user && (
            <Link to="/my-reservations" className="nav-link" onClick={() => setMenuOpen(false)}>My Reservations</Link>
          )}
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {user && user.role === 'BARBER' && (
            <Link to="/my-schedule" className="nav-link" onClick={() => setMenuOpen(false)}>My Schedule</Link>
          )}
          <div className="nav-search" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search barbers..."
                value={query}
                onChange={handleInputChange}
                className="search-input"
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              />
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((s) => (
                  <button key={s.id} className="search-suggestion-item" onClick={() => selectSuggestion(s)}>
                    <span className="ss-name">{s.name}</span>
                    <span className="ss-username">@{s.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <Link to="/settings" className="nav-user-name" onClick={() => setMenuOpen(false)}>{user.firstName}</Link>
              <button className="btn-signin" onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
