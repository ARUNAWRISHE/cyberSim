import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attackAPI, labsAPI } from '../services/api';
import '../styles/Terminal.css';

export default function AttackLab({ onClose }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [_hint, setHint] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flag, setFlag] = useState('');
  const [labComplete, setLabComplete] = useState(false);
  const [earnedFlag, setEarnedFlag] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    loadLab();
    const timer = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(timer);
  }, [slug, loadLab]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const loadLab = async () => {
    try {
      setLoading(true);
      const labRes = await labsAPI.getBySlug(slug);
      setLab(labRes.data);

      await labsAPI.start(labRes.data._id);

      setHistory([
        { type: 'system', text: '╔═══════════════════════════════════════════════════════════╗' },
        { type: 'system', text: '║  ⚔️  CYBERSIM ATTACK SIMULATION LAB                     ║' },
        { type: 'system', text: '╚═══════════════════════════════════════════════════════════╝' },
        { type: 'system', text: '' },
        { type: 'system', text: `Lab: ${labRes.data.title}` },
        { type: 'system', text: `Type: ${labRes.data.type}` },
        { type: 'system', text: `Difficulty: ${labRes.data.difficulty}` },
        { type: 'system', text: `Points: ${labRes.data.points}` },
        { type: 'system', text: '' },
        { type: 'system', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { type: 'info', text: labRes.data.description },
        { type: 'system', text: '' },
        { type: 'system', text: '🎯 OBJECTIVE:' },
        ...labRes.data.instructions.map((inst) => (
          { type: 'info', text: `  ${inst.step}. ${inst.text}` }
        )),
        { type: 'system', text: '' },
        { type: 'system', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { type: 'input', text: 'Type "help" for available commands or enter your attack payload below.' },
        { type: 'system', text: '' }
      ]);
    } catch (err) {
      console.error('Failed to load lab:', err);
      addToHistory('error', 'Failed to load lab. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (type, text) => {
    setHistory(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const getInputPrompt = () => {
    switch (slug) {
      case 'data-breach': return 'endpoint>';
      case 'account-hijacking': return 'credentials>';
      case 'misconfiguration': return 'route>';
      case 'ddos': return 'requests>';
      case 'malware-injection': return 'filename>';
      case 'insider-threat': return 'query>';
      case 'api-attack': return 'payload>';
      case 'data-loss': return 'command>';
      case 'mitm': return 'protocol>';
      case 'shared-vulnerability': return 'service>';
      default: return '>';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addToHistory('input', `> ${input}`);

    const cmd = input.trim().toLowerCase();

    if (cmd === 'help') {
      addToHistory('info', 'Available commands:');
      addToHistory('info', '  help     - Show this help message');
      addToHistory('info', '  hint     - Get a hint');
      addToHistory('info', '  clear    - Clear terminal');
      addToHistory('info', '  submit   - Submit a flag');
      addToHistory('info', '  exit     - Exit lab');
      addToHistory('system', '');
      setInput('');
      return;
    }

    if (cmd === 'hint') {
      setShowHint(true);
      try {
        const res = await attackAPI.getHint(slug);
        setHint(res.data.hint);
        addToHistory('warning', `💡 Hint: ${res.data.hint}`);
      } catch {
        addToHistory('warning', '💡 Hint: Try exploring the vulnerability more carefully.');
      }
      setInput('');
      return;
    }

    if (cmd === 'clear') {
      setHistory([{ type: 'system', text: 'Terminal cleared' }]);
      setInput('');
      return;
    }

    if (cmd === 'submit') {
      setShowFlagInput(true);
      setInput('');
      return;
    }

    if (cmd === 'exit') {
      if (onClose) onClose();
      else navigate('/learn');
      return;
    }

    addToHistory('system', '[*] Executing attack...');

    try {
      const payload = parsePayload(slug, input);
      const res = await attackAPI.execute({
        labSlug: slug,
        payload,
        action: 'attack'
      });

      const result = res.data;

      if (result.output) {
        result.output.split('\n').forEach(line => {
          if (line.includes('[+]') || line.includes('[!]')) {
            addToHistory('success', line);
          } else if (line.includes('[-]')) {
            addToHistory('error', line);
          } else {
            addToHistory('info', line);
          }
        });
      }

      if (result.flag) {
        setEarnedFlag(result.flag);
        setPointsEarned(lab?.points || 100);
        setLabComplete(true);
        addToHistory('flag', '');
        addToHistory('flag', '🎉 ATTACK SUCCESSFUL!');
        addToHistory('flag', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addToHistory('flag', `🚩 FLAG: ${result.flag}`);
        addToHistory('success', `🏆 Points Earned: +${lab?.points || 100}`);
        addToHistory('flag', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addToHistory('info', '');
        addToHistory('info', 'Type "submit" and enter this flag to complete the lab.');
      }
    } catch (err) {
      addToHistory('error', '[-] Attack failed: ' + (err.response?.data?.message || err.message));
    }

    setInput('');
  };

  const parsePayload = (slug, input) => {
    switch (slug) {
      case 'data-breach':
        return { endpoint: input };
      case 'account-hijacking': {
        const parts = input.split(':');
        return { username: parts[0] || input, password: parts[1] || '', attempt: 1 };
      }
      case 'misconfiguration':
        return { route: input };
      case 'ddos':
        return { requests: parseInt(input) || 100 };
      case 'malware-injection':
        return { filename: input, content: input };
      case 'insider-threat':
        return { query: input };
      case 'api-attack':
        return { data: input };
      case 'data-loss':
        if (input.toUpperCase() === 'DELETE ALL') {
          return { confirm: 'DELETE', records: 'ALL' };
        }
        return { command: input };
      case 'mitm':
        return { protocol: input.startsWith('http') ? input : `http://${input}` };
      case 'shared-vulnerability':
        return { service: input };
      default:
        return { raw: input };
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!flag.trim()) return;

    addToHistory('input', `> Submitting flag: ${flag}`);

    try {
      const res = await labsAPI.submitFlag({
        labId: lab._id,
        flag: flag.trim()
      });

      if (res.data.success) {
        addToHistory('success', '');
        addToHistory('success', '✅ FLAG ACCEPTED!');
        addToHistory('success', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addToHistory('success', `🏆 Total Points: ${res.data.totalPoints}`);
        
        if (res.data.newAchievements?.length > 0) {
          addToHistory('success', '');
          addToHistory('success', '🎉 NEW ACHIEVEMENT EARNED!');
          res.data.newAchievements.forEach(ach => {
            addToHistory('success', `  ${ach.icon} ${ach.name}`);
          });
        }

        addToHistory('success', '');
        addToHistory('info', 'Lab completed! Redirecting to Dashboard...');

        setTimeout(() => {
          if (onClose) onClose();
          else navigate('/dashboard');
        }, 3000);
      } else {
        addToHistory('error', '❌ Incorrect flag. Try again.');
      }
    } catch {
      addToHistory('error', '❌ Error submitting flag');
    }

    setFlag('');
    setShowFlagInput(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'input': return 'var(--primary)';
      case 'success': return 'var(--success)';
      case 'error': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      case 'flag': return '#FFD700';
      default: return 'var(--muted)';
    }
  };

  if (loading) {
    return (
      <div className="lab-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing Attack Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <div className="lab-header">
        <div className="lab-info">
          <h1>⚔️ {lab?.title || 'Attack Lab'}</h1>
          <div className="lab-meta">
            <span className={`difficulty ${lab?.difficulty}`}>{lab?.difficulty}</span>
            <span className="points">+{lab?.points} pts</span>
          </div>
        </div>
        <button className="btn ghost" onClick={onClose || (() => navigate('/learn'))}>
          ← Exit Lab
        </button>
      </div>

      <div className="lab-content">
        <div className="terminal-section">
          <div className="terminal-container">
            <div className="terminal-header">
              <div className="terminal-title">
                <span className="terminal-icon">⚔️</span>
                {lab?.title || 'Attack Simulation'}
              </div>
              <div className="terminal-actions">
                <button className="terminal-btn hint-btn" onClick={() => setShowHint(!showHint)}>
                  💡 Hint
                </button>
                <button className="terminal-btn flag-btn" onClick={() => setShowFlagInput(true)}>
                  🚩 Submit Flag
                </button>
              </div>
            </div>

            {showHint && (
              <div className="hints-panel">
                <div className="hints-header">
                  <span>💡 Available Hints</span>
                  <button onClick={() => setShowHint(false)}>✕</button>
                </div>
                <div className="hint-content">
                  {lab?.hints?.map((h, i) => (
                    <p key={i}>• {h}</p>
                  ))}
                </div>
              </div>
            )}

            {showFlagInput && (
              <div className="flag-submit-panel">
                <form onSubmit={handleFlagSubmit}>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="Enter flag (e.g., flag{...})"
                    autoFocus
                  />
                  <div className="flag-actions">
                    <button type="submit" className="btn primary">Submit</button>
                    <button type="button" className="btn ghost" onClick={() => setShowFlagInput(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="terminal-body" ref={terminalRef}>
              {history.map((entry, i) => (
                <div key={i} className={`terminal-line ${entry.type}`}>
                  <span style={{ color: getTypeColor(entry.type) }}>{entry.text}</span>
                </div>
              ))}

              <form onSubmit={handleSubmit} className="terminal-input-line">
                <span className="prompt" style={{ color: 'var(--primary)' }}>{getInputPrompt()}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter attack payload..."
                  autoFocus
                  className="terminal-input"
                />
                <span className={`cursor ${cursorVisible ? 'visible' : ''}`} style={{ color: 'var(--primary)' }}>█</span>
              </form>
            </div>

            <div className="terminal-footer">
              <span>Type "help" for commands</span>
              <span>{lab?.type}</span>
            </div>
          </div>
        </div>

        <div className="lab-sidebar">
          <div className="sidebar-card">
            <h3>📋 Mission Brief</h3>
            <p>{lab?.description}</p>
          </div>

          <div className="sidebar-card">
            <h3>🎯 Objectives</h3>
            <ul className="objectives-list">
              {lab?.instructions?.map((inst, i) => (
                <li key={i}>{inst.text}</li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>💡 Attack Vectors</h3>
            <div className="attack-type">
              {lab?.type}
            </div>
          </div>

          {labComplete && (
            <div className="sidebar-card success">
              <h3>🎉 Attack Successful!</h3>
              <p>Flag: {earnedFlag}</p>
              <p>Points: +{pointsEarned}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .lab-container {
          max-width: 1400px;
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

        .points { color: #fbbf24; font-weight: 600; }

        .lab-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }

        .terminal-section {
          display: flex;
          flex-direction: column;
        }

        .lab-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sidebar-card {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .sidebar-card h3 {
          margin-bottom: 0.75rem;
          color: var(--primary);
          font-size: 0.95rem;
        }

        .sidebar-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .objectives-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .objectives-list li {
          padding: 0.4rem 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .objectives-list li:last-child { border-bottom: none; }

        .attack-type {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .sidebar-card.success {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .sidebar-card.success h3 { color: var(--success); }

        .hint-content {
          padding: 0.75rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 6px;
          margin-bottom: 0.75rem;
        }

        .hint-content p {
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        @media (max-width: 1024px) {
          .lab-content { grid-template-columns: 1fr; }
          .lab-sidebar { order: -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        }
      `}</style>
    </div>
  );
}
