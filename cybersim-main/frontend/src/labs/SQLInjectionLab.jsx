import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Terminal from '../components/Terminal';
import { labsAPI } from '../services/api';

export default function SQLInjectionLab({ onClose }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [flag, setFlag] = useState('');
  const [showFlag, setShowFlag] = useState(false);
  const [history, setHistory] = useState([
    { type: 'system', text: '🔓 SQL INJECTION LAB' },
    { type: 'system', text: '═══════════════════════════════════════' },
    { type: 'system', text: 'Mission: Bypass the login form using SQL injection' },
    { type: 'system', text: '' },
    { type: 'system', text: '📋 Instructions:' },
    { type: 'system', text: '1. Enter SQL injection payloads in username field' },
    { type: 'system', text: '2. Try to bypass authentication' },
    { type: 'system', text: '3. Find the flag upon successful injection' },
    { type: 'system', text: '' },
    { type: 'system', text: '═══════════════════════════════════════' },
    { type: 'system', text: '' }
  ]);
  const [currentHint, setCurrentHint] = useState(0);

  useEffect(() => {
    loadLab();
  }, [slug, loadLab]);

  const loadLab = async () => {
    try {
      setLoading(true);
      const labData = await labsAPI.getBySlug(slug || 'sql-injection');
      setLab(labData.data);
      
      await labsAPI.start(labData.data._id);
      const progressData = await labsAPI.getLogs(labData.data._id);
      
      if (progressData.data.length > 0) {
        const initialHistory = [...history];
        progressData.data.slice(0, 5).forEach(log => {
          initialHistory.push({
            type: log.success ? 'success' : 'input',
            text: `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.input}`
          });
        });
        setHistory(initialHistory);
      }
    } catch (err) {
      console.error('Failed to load lab:', err);
      setError('Failed to load lab');
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (type, text) => {
    setHistory(prev => [...prev, { type, text }]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    addToHistory('input', `> Username: ${username}`);
    addToHistory('input', `> Password: ${password}`);

    try {
      const result = await labsAPI.execute({
        labId: lab._id,
        input: { username, password },
        action: 'attack'
      });

      if (result.data.success) {
        addToHistory('success', '');
        addToHistory('success', '✅ ACCESS GRANTED!');
        addToHistory('success', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (result.data.sqlInjected) {
          addToHistory('success', '🔓 SQL Injection Successful!');
          addToHistory('warning', '⚠️ Vulnerability: Authentication Bypass Detected');
          addToHistory('success', '');
          addToHistory('success', `👤 Logged in as: ${result.data.user.username}`);
          addToHistory('success', `🔐 Role: ${result.data.user.role}`);
          addToHistory('success', `📄 Data accessed: ${result.data.user.data}`);
          addToHistory('success', '');
          addToHistory('success', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        addToHistory('flag', '');
        addToHistory('flag', '🎯 FLAG FOUND!');
        addToHistory('flag', `Flag: ${lab.flag}`);
        addToHistory('success', '');
        addToHistory('success', 'Use the flag to complete the lab!');
        
        setShowFlag(true);
      } else {
        addToHistory('error', '❌ Access Denied - Invalid credentials');
        if (result.data.message) {
          addToHistory('error', result.data.message);
        }
      }
    } catch {
      addToHistory('error', '❌ Error executing command');
    }

    setUsername('');
    setPassword('');
  };

  const handleCommand = (cmd, addFn) => {
    const command = cmd.toLowerCase().trim();
    
    if (command === 'help') {
      addFn('system', 'Available commands: help, clear, hint, login');
      return;
    }
    
    if (command === 'clear') {
      setHistory([{ type: 'system', text: '🔓 Terminal cleared' }]);
      return;
    }
    
    if (command === 'hint') {
      if (currentHint < lab.hints.length) {
        addFn('hint', `💡 Hint: ${lab.hints[currentHint]}`);
        setCurrentHint(prev => prev + 1);
      } else {
        addFn('warning', 'No more hints available!');
      }
      return;
    }

    if (command === 'clear') {
      setHistory([]);
      return;
    }

    addFn('system', `Unknown command: ${cmd}. Type 'help' for available commands.`);
  };

  const handleFlagSubmit = async (flagStr, addFn) => {
    try {
      const result = await labsAPI.submitFlag({
        labId: lab._id,
        flag: flagStr
      });

      if (result.data.success) {
        addFn('success', '');
        addFn('success', '🏆 LAB COMPLETED!');
        addFn('success', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addFn('success', `Points earned: +${result.data.score}`);
        addFn('success', `Total points: ${result.data.totalPoints}`);
        
        if (result.data.newAchievements?.length > 0) {
          addFn('success', '');
          addFn('success', '🎉 NEW ACHIEVEMENT!');
          result.data.newAchievements.forEach(ach => {
            addFn('success', `${ach.icon} ${ach.name}: ${ach.description}`);
          });
        }
        
        setTimeout(() => {
          if (onClose) onClose();
          else navigate('/learn');
        }, 3000);
      } else {
        addFn('error', '❌ Incorrect flag! Try again.');
      }
    } catch {
      addToHistory('error', '❌ Error submitting flag');
    }
  };

  const hints = lab?.hints || [];

  return (
    <div className="lab-container">
      <div className="lab-header">
        <div className="lab-info">
          <h1>⚔️ {lab?.title || 'SQL Injection Lab'}</h1>
          <div className="lab-meta">
            <span className={`difficulty ${lab?.difficulty}`}>
              {lab?.difficulty}
            </span>
            <span className="points">+{lab?.points} pts</span>
          </div>
        </div>
        <button className="btn ghost" onClick={onClose || (() => navigate('/learn'))}>
          ← Back to Labs
        </button>
      </div>

      <div className="lab-content">
        <div className="lab-description">
          <h3>📋 Mission Briefing</h3>
          <p>{lab?.description}</p>
          
          <h4>🎯 Objective</h4>
          <ul>
            {lab?.instructions?.map((inst, i) => (
              <li key={i}>{inst.text}</li>
            ))}
          </ul>
        </div>

        <div className="terminal-section">
          <Terminal
            title={`${lab?.title || 'SQL Injection'} - Attack Mode`}
            isAttack={true}
            hints={hints}
            onCommand={(cmd, addFn) => handleCommand(cmd, addFn)}
            onFlagSubmit={handleFlagSubmit}
            onClose={onClose}
          />

          <div className="login-simulator">
            <div className="login-box">
              <h3>🔐 Target Login Form</h3>
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="btn primary">
                  Login
                </button>
              </form>
              <p className="login-hint">
                💡 Try SQL injection in the username field
              </p>
            </div>
          </div>
        </div>
      </div>

      {showFlag && (
        <div className="flag-capture">
          <h3>🚩 Capture the Flag</h3>
          <p>Enter the flag you found to complete the lab</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFlagSubmit(flag, addToHistory);
          }}>
            <input
              type="text"
              placeholder="flag{...}"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
            />
            <button type="submit" className="btn primary">Submit</button>
          </form>
        </div>
      )}

      <style>{`
        .lab-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .lab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .lab-header h1 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .lab-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .difficulty {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .difficulty.beginner { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .difficulty.intermediate { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .difficulty.advanced { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .points {
          color: #fbbf24;
          font-weight: 600;
        }

        .lab-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .lab-description {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .lab-description h3, .lab-description h4 {
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .lab-description p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .lab-description ul {
          list-style: none;
          padding: 0;
        }

        .lab-description li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
          color: var(--text-secondary);
        }

        .lab-description li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--primary);
        }

        .terminal-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-simulator {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .login-box h3 {
          margin-bottom: 1rem;
          color: var(--danger);
        }

        .login-box form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .login-box input {
          padding: 0.75rem 1rem;
          background: rgba(10, 14, 26, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text);
        }

        .login-box input:focus {
          outline: none;
          border-color: var(--danger);
        }

        .login-hint {
          margin-top: 1rem;
          font-size: 0.85rem;
          color: var(--muted);
          text-align: center;
        }

        .flag-capture {
          background: rgba(251, 191, 36, 0.1);
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .flag-capture h3 {
          color: #fbbf24;
          margin-bottom: 0.5rem;
        }

        .flag-capture form {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .flag-capture input {
          flex: 1;
          max-width: 400px;
          padding: 0.75rem 1rem;
          background: rgba(10, 14, 26, 0.8);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 8px;
          color: #fbbf24;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .lab-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
