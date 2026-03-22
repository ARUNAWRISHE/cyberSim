import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Modern Cybersecurity Training.
          </h1>
          <p className="hero-subtitle">
            Equip yourself to neutralize threats and harden systems through realistic, hands-on labs.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn primary">Go to Dashboard</Link>
            ) : (
              <Link to="/signup" className="btn primary">Start Training Free</Link>
            )}
            <Link to="/learn" className="btn secondary">Explore Curriculum</Link>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Defense & Hardening</h3>
            <p>Master defensive setups, incident response, and network security across interactive environments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Offensive Tactics</h3>
            <p>Understand how attackers think to better protect infrastructure. Labs include XSS, SQLi, and more.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Continuous Tracking</h3>
            <p>Monitor your performance, collect flags, and establish a tangible history of your security skills.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
