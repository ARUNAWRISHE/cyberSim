import React, { useState, useEffect, useRef } from 'react'
import '../App.css'

// Command Injection Lab - Safe, client-side simulation only
const DEMO_FLAG = 'flag{command_injection_complete}'

export default function CommandInjectionLab({ onClose }) {
  const [started, setStarted] = useState(false)
  const [log, setLog] = useState([])
  const [checkpoints, setCheckpoints] = useState({
    openedLab: false,
    foundInjection: false,
    executedCommand: false,
    extractedFlag: false,
    submitted: false,
  })

  const [pingInput, setPingInput] = useState('')
  const [pingResults, setPingResults] = useState('')
  const [message, setMessage] = useState(null)
  const [flagInput, setFlagInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [log])

  function startLab() {
    setStarted(true)
    setLog([`Command Injection Lab started — ${new Date().toLocaleTimeString()}`])
    setCheckpoints(c => ({ ...c, openedLab: true }))
    setMessage(null)
    setFlagInput('')
    setPingInput('')
    setPingResults('')
  }

  function resetLab() {
    setStarted(false)
    setLog([])
    setCheckpoints({ openedLab: false, foundInjection: false, executedCommand: false, extractedFlag: false, submitted: false })
    setMessage(null)
    setFlagInput('')
    setPingInput('')
    setPingResults('')
  }

  function appendLog(line) {
    setLog(l => [...l, line])
  }

  // Simulated vulnerable ping handler
  function handlePing(e) {
    e?.preventDefault()
    appendLog(`Ping command: ping ${pingInput}`)

    // Check for command injection payloads
    const input = pingInput.toLowerCase()
    
    if (input.includes(';') || input.includes('&&') || input.includes('||') || input.includes('|')) {
      appendLog('Command injection detected!')
      setCheckpoints(c => ({ ...c, foundInjection: true }))
      
      // Simulate command execution
      if (input.includes('cat') || input.includes('ls') || input.includes('whoami')) {
        appendLog('Additional command executed successfully!')
        
        if (input.includes('cat') && (input.includes('flag') || input.includes('secret'))) {
          appendLog(`Reading secret file: ${DEMO_FLAG}`)
          setCheckpoints(c => ({ ...c, executedCommand: true, extractedFlag: true }))
          setMessage({ type: 'success', text: 'Command injection successful! Flag revealed.' })
        } else if (input.includes('ls')) {
          appendLog('Directory listing: index.html flag.txt secret.txt')
          setCheckpoints(c => ({ ...c, executedCommand: true }))
          setMessage({ type: 'info', text: 'Directory listing executed. Try reading flag.txt' })
        } else if (input.includes('whoami')) {
          appendLog('Current user: www-data')
          setCheckpoints(c => ({ ...c, executedCommand: true }))
          setMessage({ type: 'info', text: 'User information retrieved. Try listing files.' })
        }
      }
      
      // Simulate ping output with injection
      setPingResults(`PING ${pingInput.split(/[;&|]/)[0]} (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.123 ms
--- ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss

Additional command output above.`)
    } else {
      // Normal ping simulation
      setPingResults(`PING ${pingInput} (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.456 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.234 ms
--- ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss`)
      
      if (pingInput.trim()) {
        setMessage({ type: 'info', text: 'Try injecting additional commands using ; && || or |' })
      }
    }
  }

  function copyPayload(payload) {
    navigator.clipboard?.writeText(payload).then(() => {
      appendLog(`Copied injection payload: ${payload}`)
      setMessage({ type: 'info', text: 'Payload copied! Paste it into the ping field.' })
    }).catch(() => {
      setMessage({ type: 'error', text: 'Could not copy to clipboard — copy manually.' })
    })
  }

  function submitFlag(e) {
    e?.preventDefault()
    if (flagInput.trim() === DEMO_FLAG) {
      setCheckpoints(c => ({ ...c, submitted: true }))
      appendLog('Flag submitted: ' + flagInput)
      setMessage({ type: 'success', text: 'Correct! Command injection lab completed!' })
    } else {
      appendLog('Flag submission attempt: ' + flagInput)
      setMessage({ type: 'error', text: 'Incorrect flag. Extract it using command injection.' })
    }
  }

  const injectionPayloads = [
    "127.0.0.1; ls",
    "127.0.0.1 && whoami",
    "127.0.0.1; cat flag.txt",
    "127.0.0.1 | ls -la"
  ]

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0' }}>Command Injection Lab</h2>
          <div style={{ color: '#cbd5e1' }}>Learn to exploit command injection vulnerabilities in web applications.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={() => { if (onClose) onClose() }}>Exit</button>
          <button className="btn" onClick={resetLab}>Reset</button>
          {!started ? <button className="btn primary" onClick={startLab}>Start Lab</button> : null}
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, marginTop: 12 }}>
        <section style={{ textAlign: 'left' }}>
          <h3>Overview</h3>
          <p style={{ color: '#e6eef8' }}>Command injection occurs when user input is passed to system commands without proper sanitization. This allows attackers to execute arbitrary commands on the server.</p>

          <h4>Learning Objectives</h4>
          <ul>
            <li>Understand how command injection vulnerabilities work</li>
            <li>Learn different command injection techniques</li>
            <li>Practice exploiting unsafe command execution</li>
            <li>Extract sensitive information using injected commands</li>
          </ul>

          <h4>Steps</h4>
          <ol>
            <li>Start the lab session</li>
            <li>Try injecting additional commands in the ping field</li>
            <li>Use command separators like ; && || |</li>
            <li>Execute commands to list files and read secrets</li>
            <li>Submit the extracted flag</li>
          </ol>

          <div style={{ marginTop: 12 }}>
            <h4>Vulnerable Ping Application</h4>
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }}>
              <form onSubmit={handlePing}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13 }}>Host to Ping</label>
                  <input 
                    value={pingInput} 
                    onChange={(e)=>setPingInput(e.target.value)} 
                    placeholder="Enter IP address or hostname..." 
                    className="atk-input"
                    disabled={!started}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" disabled={!started} type="submit">Ping</button>
                  <button type="button" className="btn ghost" onClick={()=>{ setPingInput(''); setPingResults(''); }}>Clear</button>
                </div>
              </form>

              {pingResults && (
                <div style={{ marginTop: 12, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6, whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <strong>Ping Results:</strong><br/>
                  {pingResults}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>Injection Payloads</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {injectionPayloads.map((payload, i) => (
                    <button key={i} className="btn" onClick={()=>copyPayload(payload)} disabled={!started} style={{ fontSize: '0.8rem' }}>
                      {payload}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4>Lab Console</h4>
            <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8, background: '#000', color: '#d1d5db' }}>
              <div ref={terminalRef} style={{ maxHeight: 160, overflow: 'auto', padding: 8, fontFamily: 'monospace', fontSize: 13, background: '#071018', borderRadius: 6 }}>
                {log.length === 0 ? <div style={{ color: '#94a3b8' }}>Lab output will appear here.</div> : log.map((l,i)=>(<div key={i}><span style={{ color: '#6ee7b7' }}>→</span> {l}</div>))}
              </div>
            </div>
          </div>
        </section>

        <aside style={{ textAlign: 'left' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }}>
            <h4>Progress</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><input type="checkbox" checked={checkpoints.openedLab} readOnly /> Start lab</li>
              <li><input type="checkbox" checked={checkpoints.foundInjection} readOnly /> Find injection point</li>
              <li><input type="checkbox" checked={checkpoints.executedCommand} readOnly /> Execute injected command</li>
              <li><input type="checkbox" checked={checkpoints.extractedFlag} readOnly /> Extract flag</li>
              <li><input type="checkbox" checked={checkpoints.submitted} readOnly /> Submit flag</li>
            </ul>

            <div style={{ marginTop: 12 }}>
              <h4>Submit Flag</h4>
              <form onSubmit={submitFlag}>
                <input value={flagInput} onChange={(e)=>setFlagInput(e.target.value)} placeholder="flag{...}" className="atk-input" style={{ marginBottom: 8 }} />
                <button className="btn primary" type="submit" disabled={!started}>Submit</button>
              </form>
              {message ? <div style={{ marginTop: 8, color: message.type==='success' ? '#86efac' : (message.type==='error' ? '#ff6b6b' : '#cbd5e1') }}>{message.text}</div> : null}
            </div>

            <div style={{ marginTop: 12 }}>
              <h4>Hints</h4>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={showHint} onChange={()=>setShowHint(s=>!s)} /> Show hint</label>
              {showHint ? <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: '0.9rem' }}>Try command separators like <code>;</code>, <code>&&</code>, <code>||</code>, or <code>|</code> to inject additional commands. Example: <code>127.0.0.1; cat flag.txt</code></div> : null}
            </div>

            <div style={{ marginTop: 12 }}>
              <h4>Command Separators</h4>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>;</strong> - Execute commands sequentially<br/>
                <strong>&&</strong> - Execute if previous succeeds<br/>
                <strong>||</strong> - Execute if previous fails<br/>
                <strong>|</strong> - Pipe output to next command
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}