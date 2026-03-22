import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attackAPI, defenseAPI, labsAPI } from '../services/api';
import '../styles/Terminal.css';

export default function DefenseLab({ onClose }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flag, setFlag] = useState('');
  const [_labComplete, _setLabComplete] = useState(false);
  const [attackCompleted, setAttackCompleted] = useState(false);
  const [earnedFlag, setEarnedFlag] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [mode, setMode] = useState('attack');
  const [defensesDeployed, setDefensesDeployed] = useState([]);
  const [_showDefenseSubmit, _setShowDefenseSubmit] = useState(false);
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

      const statusRes = await defenseAPI.getStatus(slug);
      
      if (statusRes.data.completed) {
        setAttackCompleted(true);
      }

      await labsAPI.start(labRes.data._id);

      setHistory([
        { type: 'system', text: '╔═══════════════════════════════════════════════════════════╗' },
        { type: 'system', text: '║  🛡️  CYBERSIM DEFENSE LAB                              ║' },
        { type: 'system', text: '╚═══════════════════════════════════════════════════════════╝' },
        { type: 'system', text: '' },
        { type: 'system', text: `Lab: ${labRes.data.title}` },
        { type: 'system', text: `Type: ${labRes.data.type}` },
        { type: 'system', text: `Difficulty: ${labRes.data.difficulty}` },
        { type: 'system', text: `Points: ${labRes.data.points} (Attack) + Bonus (Defense)` },
        { type: 'system', text: '' },
        { type: 'system', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { type: 'info', text: labRes.data.description },
        { type: 'system', text: '' },
        { type: 'system', text: '🎯 OBJECTIVE:' },
        { type: 'info', text: '  1. Complete the ATTACK phase to exploit the vulnerability' },
        { type: 'info', text: '  2. Complete the DEFENSE phase to deploy security fixes' },
        { type: 'system', text: '' },
        { type: 'system', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { type: 'system', text: '' },
        { type: 'input', text: 'Select mode: Type "attack" or "defense" to switch phases.' },
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
    if (mode === 'attack') {
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
    } else {
      return 'defense>';
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
      addToHistory('info', '  attack   - Switch to attack mode');
      addToHistory('info', '  defense  - Switch to defense mode');
      addToHistory('info', '  exit     - Exit lab');
      addToHistory('system', '');
      setInput('');
      return;
    }

    if (cmd === 'attack') {
      setMode('attack');
      addToHistory('system', '[*] Switching to ATTACK mode...');
      addToHistory('info', 'Use attack commands to exploit the vulnerability.');
      addToHistory('system', '');
      setInput('');
      return;
    }

    if (cmd === 'defense') {
      if (!attackCompleted) {
        addToHistory('warning', '[!] You must complete the attack phase first!');
        addToHistory('warning', '[!] Exploit the vulnerability to unlock defense mode.');
        setInput('');
        return;
      }
      setMode('defense');
      addToHistory('system', '[*] Switching to DEFENSE mode...');
      addToHistory('info', 'Deploy security measures to block the attack.');
      addToHistory('info', `Available actions: encrypt, restrict, audit (data-breach)`);
      addToHistory('info', `                 mfa, ratelimit, lockout (account-hijacking)`);
      addToHistory('system', '');
      setInput('');
      return;
    }

    if (cmd === 'hint') {
      setShowHint(true);
      try {
        const api = mode === 'attack' ? attackAPI : defenseAPI;
        const res = await api.getHint(slug);
        setHint(res.data.hint);
        addToHistory('warning', `💡 Hint: ${res.data.hint}`);
        if (res.data.availableActions) {
          addToHistory('info', `Available actions: ${res.data.availableActions.join(', ')}`);
        }
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

    if (mode === 'attack') {
      await handleAttackSubmit(cmd);
    } else {
      await handleDefenseSubmit(cmd);
    }

    setInput('');
  };

  const handleAttackSubmit = async (cmd) => {
    addToHistory('system', '[*] Executing attack...');

    try {
      const payload = parsePayload(slug, cmd);
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
        setAttackCompleted(true);
        addToHistory('flag', '');
        addToHistory('flag', '🎉 ATTACK SUCCESSFUL!');
        addToHistory('flag', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addToHistory('flag', `🚩 ATTACK FLAG: ${result.flag}`);
        addToHistory('success', `🏆 Points Earned: +${lab?.points || 100}`);
        addToHistory('flag', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addToHistory('info', '');
        addToHistory('info', '✓ Attack phase complete! Type "defense" to start defending.');
      }
    } catch (err) {
      addToHistory('error', '[-] Attack failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDefenseSubmit = async (cmd) => {
    if (!attackCompleted) {
      addToHistory('warning', '[!] You must complete the attack phase first!');
      return;
    }

    addToHistory('system', '[*] Deploying defense...');

    try {
      const res = await defenseAPI.execute({
        labSlug: slug,
        action: cmd,
        parameters: {}
      });

      const result = res.data;

      if (result.output) {
        result.output.split('\n').forEach(line => {
          if (line.includes('[+]') || line.includes('[!]') || line.includes('✓')) {
            addToHistory('success', line);
          } else if (line.includes('[-]')) {
            addToHistory('error', line);
          } else {
            addToHistory('info', line);
          }
        });
      }

      if (result.defenseDeployed && !defensesDeployed.includes(result.defenseDeployed)) {
        setDefensesDeployed(prev => [...prev, result.defenseDeployed]);
        addToHistory('flag', '');
        addToHistory('flag', `🛡️ Defense Deployed: ${result.defenseDeployed}`);
        addToHistory('info', `Defenses deployed: ${defensesDeployed.length + 1}/2 minimum required`);
        addToHistory('info', '');
        
        if (defensesDeployed.length + 1 >= 2) {
          addToHistory('success', '✓ Minimum defenses reached! Type "submit" to complete defense.');
        }
      }

      if (result.blockedAttack) {
        addToHistory('info', '');
        addToHistory('warning', `Blocked attack: ${result.blockedAttack}`);
      }
    } catch (err) {
      addToHistory('error', '[-] Defense deployment failed: ' + (err.response?.data?.message || err.message));
    }
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

    if (mode === 'defense' && defensesDeployed.length >= 2) {
      try {
        const res = await defenseAPI.complete({
          labSlug: slug,
          defensesDeployed: defensesDeployed
        });

        if (res.data.success) {
          addToHistory('success', '');
          res.data.output.split('\n').forEach(line => {
            if (line.includes('╔') || line.includes('║') || line.includes('╚')) {
              addToHistory('flag', line);
            } else if (line.includes('[+]') || line.includes('✓')) {
              addToHistory('success', line);
            } else if (line.includes('[-]')) {
              addToHistory('error', line);
            } else {
              addToHistory('info', line);
            }
          });
          addToHistory('success', '');
          addToHistory('info', 'Lab completed! Redirecting to Dashboard...');

          setTimeout(() => {
            if (onClose) onClose();
            else navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        addToHistory('error', '❌ Error completing defense: ' + err.message);
      }
    } else if (mode === 'defense') {
      addToHistory('warning', `[!] Deploy at least 2 defenses before completing!`);
      addToHistory('info', `Current defenses: ${defensesDeployed.length}/2`);
    } else {
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
          addToHistory('success', '');
          addToHistory('info', 'Type "defense" to start the defense phase.');
        } else {
          addToHistory('error', '❌ Incorrect flag. Try again.');
        }
      } catch {
        addToHistory('error', '❌ Error submitting flag');
      }
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
          <p>Initializing Defense Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <div className="lab-header">
        <div className="lab-info">
          <h1>🛡️ {lab?.title || 'Defense Lab'}</h1>
          <div className="lab-meta">
            <span className={`difficulty ${lab?.difficulty}`}>{lab?.difficulty}</span>
            <span className="points">+{lab?.points} pts</span>
            <span className={`mode-badge ${mode}`}>
              {mode === 'attack' ? '⚔️ Attack' : '🛡️ Defense'}
            </span>
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
                <span className="terminal-icon">{mode === 'attack' ? '⚔️' : '🛡️'}</span>
                {lab?.title || 'Defense Lab'} - {mode === 'attack' ? 'Attack Phase' : 'Defense Phase'}
              </div>
              <div className="terminal-actions">
                <button className="terminal-btn mode-btn" onClick={() => setMode(mode === 'attack' ? 'defense' : 'attack')}>
                  {mode === 'attack' ? '🛡️ Defense' : '⚔️ Attack'}
                </button>
                <button className="terminal-btn hint-btn" onClick={() => setShowHint(!showHint)}>
                  💡 Hint
                </button>
                <button className="terminal-btn flag-btn" onClick={() => setShowFlagInput(true)}>
                  🚩 Submit
                </button>
              </div>
            </div>

            {showHint && (
              <div className="hints-panel">
                <div className="hints-header">
                  <span>💡 Hint</span>
                  <button onClick={() => setShowHint(false)}>✕</button>
                </div>
                <div className="hint-content">
                  <p>{hint || 'Get a hint by typing "hint" in the terminal.'}</p>
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
                    placeholder={mode === 'defense' ? "Enter defense flag..." : "Enter attack flag (e.g., flag{...})"}
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
                <span className="prompt" style={{ color: mode === 'attack' ? 'var(--danger)' : 'var(--success)' }}>
                  {getInputPrompt()}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'attack' ? "Enter attack payload..." : "Enter defense action..."}
                  autoFocus
                  className="terminal-input"
                />
                <span className={`cursor ${cursorVisible ? 'visible' : ''}`} style={{ color: mode === 'attack' ? 'var(--danger)' : 'var(--success)' }}>█</span>
              </form>
            </div>

            <div className="terminal-footer">
              <span>Type "help" for commands | "attack" or "defense" to switch modes</span>
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
            <h3>🎯 Phase Progress</h3>
            <div className="phase-progress">
              <div className={`phase ${attackCompleted ? 'completed' : ''}`}>
                <span className="phase-icon">{attackCompleted ? '✓' : '○'}</span>
                <span>Attack Phase</span>
              </div>
              <div className="phase-line"></div>
              <div className={`phase ${mode === 'defense' ? 'active' : ''}`}>
                <span className="phase-icon">○</span>
                <span>Defense Phase</span>
              </div>
            </div>
          </div>

          {mode === 'defense' && (
            <div className="sidebar-card defense">
              <h3>🛡️ Defenses Deployed</h3>
              {defensesDeployed.length === 0 ? (
                <p className="no-defenses">No defenses deployed yet.</p>
              ) : (
                <ul className="defense-list">
                  {defensesDeployed.map((d, i) => (
                    <li key={i}>✓ {d}</li>
                  ))}
                </ul>
              )}
              <div className="defense-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, (defensesDeployed.length / 2) * 100)}%` }}
                  ></div>
                </div>
                <span>{defensesDeployed.length}/2 minimum</span>
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <h3>💡 {mode === 'attack' ? 'Attack' : 'Defense'} Tips</h3>
            <ul className="tips-list">
              {mode === 'attack' ? (
                <>
                  <li>Explore the vulnerability</li>
                  <li>Type "hint" for help</li>
                  <li>Submit the flag when found</li>
                </>
              ) : (
                <>
                  <li>Deploy at least 2 defenses</li>
                  <li>Try different security measures</li>
                  <li>Submit when ready</li>
                </>
              )}
            </ul>
          </div>

          {earnedFlag && (
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

        .points { color: #fbbf24; font-weight: 600; }

        .mode-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .mode-badge.attack {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .mode-badge.defense {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

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

        .sidebar-card.defense {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .sidebar-card.defense h3 { color: var(--success); }

        .phase-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .phase {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .phase.completed {
          color: var(--success);
        }

        .phase.active {
          color: var(--warning);
          font-weight: 600;
        }

        .phase-icon {
          font-size: 1rem;
        }

        .phase-line {
          flex: 1;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .defense-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }

        .defense-list li {
          padding: 0.4rem 0;
          color: var(--success);
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .defense-list li:last-child { border-bottom: none; }

        .no-defenses {
          color: var(--text-secondary);
          font-style: italic;
          font-size: 0.85rem;
        }

        .defense-progress {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--success);
          transition: width 0.3s ease;
        }

        .defense-progress span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-list li {
          padding: 0.4rem 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tips-list li:last-child { border-bottom: none; }

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

        .mode-btn {
          background: rgba(16, 185, 129, 0.2);
          color: var(--success);
        }

        @media (max-width: 1024px) {
          .lab-content { grid-template-columns: 1fr; }
          .lab-sidebar { order: -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        }
      `}</style>
    </div>
  );
}
