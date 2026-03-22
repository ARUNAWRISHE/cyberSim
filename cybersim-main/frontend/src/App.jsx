import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LiveBackground from './components/LiveBackground';
import ChatButton from './components/ChatButton';
import AttackLab from './labs/AttackLab';
import DefenseLab from './labs/DefenseLab';
import Landing from './pages/Landing';
import Learn from './pages/Learn';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Articles from './pages/Articles';
import ArticleView from './pages/ArticleView';
import Support from './pages/Support';

function LabRouter() {
  const { slug } = useParams();
  const [labType, setLabType] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLabType = async () => {
      try {
        const { labsAPI } = await import('./services/api');
        const response = await labsAPI.getBySlug(slug);
        setLabType(response.data.category);
      } catch (err) {
        console.error('Failed to fetch lab type:', err);
        setLabType('attack');
      } finally {
        setLoading(false);
      }
    };
    fetchLabType();
  }, [slug]);
  
  if (loading) {
    return (
      <div className="lab-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lab...</p>
        </div>
      </div>
    );
  }
  
  return labType === 'defense' ? <DefenseLab /> : <AttackLab />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;
  const isLabActive = () => location.pathname.startsWith('/lab');

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          <span className="brand-text">CyberSim</span>
        </Link>

        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-icon">⌂</span>
            Home
          </Link>
          <Link to="/learn" className={`nav-link ${isActive('/learn') || isLabActive() ? 'active' : ''}`}>
            <span className="nav-icon">⚔</span>
            Training Labs
          </Link>
          <Link to="/articles" className={`nav-link ${isActive('/articles') ? 'active' : ''}`}>
            <span className="nav-icon">◈</span>
            Intel Base
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <span className="nav-icon">◉</span>
            Dashboard
          </Link>
          
          {isAuthenticated && user ? (
            <div className="user-profile-menu" ref={menuRef}>
              <button 
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-avatar">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="profile-name">{user.username || 'Agent'}</span>
                <span className={`profile-arrow ${showProfileMenu ? 'rotated' : ''}`}>▼</span>
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-details">
                      <div className="profile-username">{user.username || 'Agent'}</div>
                      <div className="profile-email">{user.email || 'agent@cybersim.com'}</div>
                    </div>
                  </div>
                  <div className="profile-menu-items">
                    <Link to="/profile" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                      <span className="menu-icon">👤</span> Profile
                    </Link>
                    <Link to="/dashboard" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                      <span className="menu-icon">◉</span> Dashboard
                    </Link>
                    <div className="menu-divider"></div>
                    <button className="profile-menu-item logout-item" onClick={handleLogout}>
                      <span className="menu-icon">⏻</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link login-link">Sign In</Link>
              <Link to="/signup" className="btn primary btn-small">Join Now</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  return (
    <div id="root">
      <LiveBackground />
      <ScrollToTop />
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleView />} />
          <Route path="/support" element={<Support />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/lab/:slug" element={<LabRouter />} />
        </Routes>
      </div>
      <ChatButton />
    </div>
  );
}

export default App;
