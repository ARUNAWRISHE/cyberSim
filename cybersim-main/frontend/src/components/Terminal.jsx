import React, { useState, useEffect, useRef } from 'react';

export default function Terminal({ 
  title = "Terminal", 
  commands = [], 
  onCommand,
  onFlagSubmit,
  hints = [],
  isAttack = true,
  onClose 
}) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputHistory, setInputHistory] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [flagInput, setFlagInput] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (commands.length > 0 && history.length === 0) {
      setHistory(commands.map(cmd => ({
        type: 'system',
        text: cmd
      })));
    }
  }, [commands]);

  const addToHistory = (type, text) => {
    setHistory(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addToHistory('input', `> ${input}`);
    setInputHistory(prev => [...prev, input]);
    setHistoryIndex(-1);

    if (onCommand) {
      onCommand(input, addToHistory);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? inputHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= inputHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(inputHistory[newIndex]);
        }
      }
    }
  };

  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    addToHistory('flag', `Submitting flag: ${flagInput}`);
    if (onFlagSubmit) {
      onFlagSubmit(flagInput, addToHistory);
    }
    setFlagInput('');
    setShowFlagInput(false);
  };

  const getNextHint = () => {
    if (hintIndex < hints.length) {
      const hint = hints[hintIndex];
      addToHistory('hint', `💡 Hint ${hintIndex + 1}: ${hint}`);
      setHintIndex(prev => prev + 1);
    } else {
      addToHistory('system', 'No more hints available.');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'input': return 'var(--primary)';
      case 'success': return 'var(--success)';
      case 'error': return 'var(--danger)';
      case 'flag': return '#FFD700';
      case 'hint': return 'var(--warning)';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">{isAttack ? '⚔️' : '🛡️'}</span>
          {title}
        </div>
        <div className="terminal-actions">
          <button className="terminal-btn hint-btn" onClick={() => setShowHints(!showHints)}>
            💡 Hints
          </button>
          <button className="terminal-btn flag-btn" onClick={() => setShowFlagInput(true)}>
            🚩 Submit Flag
          </button>
          {onClose && (
            <button className="terminal-btn close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {showHints && (
        <div className="hints-panel">
          <div className="hints-header">
            <span>💡 Available Hints ({hints.length})</span>
            <button onClick={() => setShowHints(false)}>✕</button>
          </div>
          <div className="hints-list">
            {hints.map((hint, i) => (
              <div key={i} className="hint-item">
                <span className="hint-number">[{i + 1}]</span> {hint}
              </div>
            ))}
          </div>
          <button className="btn primary" onClick={getNextHint}>
            Get Next Hint
          </button>
        </div>
      )}

      {showFlagInput && (
        <div className="flag-submit-panel">
          <form onSubmit={handleFlagSubmit}>
            <input
              type="text"
              value={flagInput}
              onChange={(e) => setFlagInput(e.target.value)}
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
            {entry.type === 'input' ? (
              <span className="input-text">{entry.text}</span>
            ) : (
              <div className="output-text" style={{ color: getTypeColor(entry.type) }}>
                {entry.text}
              </div>
            )}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="terminal-input-line">
          <span className="prompt">{isAttack ? '>' : '◉'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command or payload..."
            autoFocus
            className="terminal-input"
          />
          <span className={`cursor ${cursorVisible ? 'visible' : ''}`}>█</span>
        </form>
      </div>

      <div className="terminal-footer">
        <span>Type commands and press Enter to execute</span>
        <span>Use ↑↓ for command history</span>
      </div>
    </div>
  );
}
