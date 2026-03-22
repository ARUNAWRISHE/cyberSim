import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { labsAPI } from '../services/api';
import '../App.css';

function Learn() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    loadLabs();
  }, []);

  const loadLabs = async () => {
    try {
      const response = await labsAPI.getAll();
      setLabs(response.data);
    } catch (err) {
      console.error('Failed to load labs:', err);
    } finally {
      setLoading(false);
    }
  };

  const seedLabs = async () => {
    setSeeding(true);
    try {
      const seedResponse = await labsAPI.seed();
      console.log('Seeding response:', seedResponse.data);
      await loadLabs();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
    } catch (err) {
      console.error('Failed to seed labs:', err);
      alert('Failed to initialize labs. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const attackLabs = labs.filter(l => l.category === 'attack');
  const defenseLabs = labs.filter(l => l.category === 'defense');

  const getLabIcon = (type) => {
    const icons = {
      'Authentication Bypass': '💉',
      'Cross-Site Scripting': '🔗',
      'OS Command Injection': '⚡',
      'Path Traversal': '📁',
      'SQL Injection Prevention': '🔐',
      'XSS Prevention': '🛡️',
      'Cloud Data Exposure': '☁️',
      'Brute Force Attack': '🔓',
      'Broken Access Control': '🔧',
      'Denial of Service': '💀',
      'Unrestricted File Upload': '📤',
      'Data Exfiltration': '📊',
      'Injection Attack': '💉',
      'Data Deletion': '🗑️',
      'Traffic Interception': '👁️',
      'Container Escape': '🚢'
    };
    return icons[type] || '🎯';
  };

  if (loading) {
    return (
      <div className="learn-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-container">
      <div className="learn-header">
        <h1>⚔️ Cybersecurity Training Labs</h1>
        <p>Hands-on labs with real vulnerabilities. Login required to start.</p>
        {labs.length === 0 && (
          <button className="btn primary" onClick={seedLabs} disabled={seeding}>
            {seeding ? 'Seeding Labs...' : 'Initialize Labs'}
          </button>
        )}
      </div>

      {labs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧪</div>
          <h2>No Labs Available</h2>
          <p>Click "Initialize Labs" to set up the training environment</p>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: '3rem' }}>
            <div className="section-title">
              <h2>⚔️ Attack Labs</h2>
              <span className="badge attack">{attackLabs.length} Available</span>
            </div>
            <div className="labs-grid">
              {attackLabs.map((lab) => (
                <div 
                  key={lab._id}
                  className="lab-card attack-card" 
                  onClick={() => navigate(`/lab/${lab.slug}`)}
                >
                  <div className="lab-icon">{getLabIcon(lab.type)}</div>
                  <div className="lab-content">
                    <div className="lab-header-row">
                      <h3>{lab.title}</h3>
                      <span className={`difficulty ${lab.difficulty}`}>{lab.difficulty}</span>
                    </div>
                    <p>{lab.description}</p>
                    <div className="lab-footer">
                      <span className="points">+{lab.points} pts</span>
                      <span className="type">{lab.type}</span>
                    </div>
                  </div>
                  <button className="btn primary">Start Attack</button>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <div className="section-title">
              <h2>🛡️ Defense Labs</h2>
              <span className="badge defense">{defenseLabs.length} Available</span>
            </div>
            <div className="labs-grid">
              {defenseLabs.map((lab) => (
                <div 
                  key={lab._id}
                  className="lab-card defense-card" 
                  onClick={() => navigate(`/lab/${lab.slug}`)}
                >
                  <div className="lab-icon">{getLabIcon(lab.type)}</div>
                  <div className="lab-content">
                    <div className="lab-header-row">
                      <h3>{lab.title}</h3>
                      <span className={`difficulty ${lab.difficulty}`}>{lab.difficulty}</span>
                    </div>
                    <p>{lab.description}</p>
                    <div className="lab-footer">
                      <span className="points">+{lab.points} pts</span>
                      <span className="type">{lab.type}</span>
                    </div>
                  </div>
                  <button className="btn primary">Start Defense</button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      
      <div className="learn-info">
        <div className="info-card">
          <div className="info-icon">🤖</div>
          <h3>AI-Powered Assistance</h3>
          <p>Get instant hints and guidance from our AI assistant</p>
        </div>
        <div className="info-card">
          <div className="info-icon">📊</div>
          <h3>Track Progress</h3>
          <p>Monitor your completion and earn achievements</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🏆</div>
          <h3>Leaderboard</h3>
          <p>Compete with other security enthusiasts</p>
        </div>
      </div>

      <style>{`
        .section-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .section-title h2 {
          margin: 0;
        }
        
        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .badge.attack {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .badge.defense {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .lab-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .lab-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .lab-footer .points {
          color: #fbbf24;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .lab-footer .type {
          color: var(--muted);
          font-size: 0.8rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h2 {
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

export default Learn;
