import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, labsAPI } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLabs: 0,
    completedLabs: 0,
    inProgressLabs: 0,
    attackCompleted: 0,
    defenseCompleted: 0,
    totalPoints: 0,
    progressPercentage: 0,
    streak: 0,
    rank: { name: 'Newcomer', icon: '🌱' }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, labsRes] = await Promise.all([
        dashboardAPI.getStats(),
        labsAPI.getAll()
      ]);

      setStats(statsRes.data);
      setLabs(labsRes.data);
      setRecentActivity(statsRes.data.recentActivity || []);
      setError('');
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rankName) => {
    const colors = {
      'Newcomer': '#10b981',
      'Junior Analyst': '#10b981',
      'Security Analyst': '#3b82f6',
      'Cyber Warrior': '#8b5cf6',
      'Security Expert': '#f59e0b',
      'Elite Hacker': '#ef4444'
    };
    return colors[rankName] || '#6b7280';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (action) => {
    const icons = {
      'attack': '⚔️',
      'defense': '🛡️',
      'submit': '🚩',
      'hint': '💡',
      'start': '🚀'
    };
    return icons[action] || '📊';
  };

  const getActivityColor = (action) => {
    const colors = {
      'attack': '#ef4444',
      'defense': '#10b981',
      'submit': '#fbbf24',
      'hint': '#f59e0b',
      'start': '#3b82f6'
    };
    return colors[action] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Command Center...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-welcome">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <h1>Command Center - {user?.username || 'Agent'}</h1>
            <p>{user?.email}</p>
            <div className="user-rank" style={{ color: getRankColor(stats.rank.name) }}>
              {stats.rank.icon} {stats.rank.name}
            </div>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/learn" className="btn primary">
            <span className="btn-icon">⚡</span>
            Start Training
          </Link>
        </div>
      </div>

      {error && (
        <div className="auth-message error">{error}</div>
      )}

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completedLabs}</div>
            <div className="stat-label">Labs Completed</div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.progressPercentage}%` }}
                ></div>
              </div>
              <span className="progress-text">{stats.progressPercentage}% Progress</span>
            </div>
          </div>
        </div>

        <div className="stat-card score">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalPoints}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>

        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚔️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.attackCompleted}</div>
            <div className="stat-label">Attack Labs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.defenseCompleted}</div>
            <div className="stat-label">Defense Labs</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📊 Recent Activity</h2>
          </div>
          
          <div className="activity-feed">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item" style={{ borderLeftColor: getActivityColor(activity.action) }}>
                  <div className="activity-icon">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {activity.lab} - {activity.action}
                    </div>
                    <div className="activity-meta">
                      <span className={`activity-status ${activity.success ? 'success' : ''}`}>
                        {activity.success ? '✓ Success' : 'In progress'}
                      </span>
                      <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No activity yet. Start a lab to see your progress!</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>🧪 Available Labs</h2>
            <Link to="/learn" className="section-link">View All →</Link>
          </div>
          
          <div className="labs-grid">
            {labs.slice(0, 4).map((lab) => (
              <div 
                key={lab._id} 
                className={`lab-card ${lab.category}-card`}
                onClick={() => navigate(`/lab/${lab.slug}`)}
              >
                <div className="lab-icon">
                  {lab.category === 'attack' ? '⚔️' : '🛡️'}
                </div>
                <div className="lab-content">
                  <h3>{lab.title}</h3>
                  <p>{lab.description}</p>
                  <div className="lab-meta">
                    <span className={`difficulty ${lab.difficulty}`}>{lab.difficulty}</span>
                    <span className="points">+{lab.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
