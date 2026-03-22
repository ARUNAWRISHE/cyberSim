import React, { useState, useEffect, useRef } from 'react'
import '../App.css'

// XSS Lab - Safe, client-side simulation only
const DEMO_FLAG = 'flag{xss_lab_complete}'

export default function XSSLab({ onClose }) {
  const [started, setStarted] = useState(false)
  const [log, setLog] = useState([])
  const [checkpoints, setCheckpoints] = useState({
    openedLab: false,
    foundReflection: false,
    executedScript: false,
    extractedCookies: false,
    submitted: false,
  })

  const [userInput, setUserInput] = useState('')
  const [searchResults, setSearchResults] = useState('')
  const [message, setMessage] = useState(null)
  const [flagInput, setFlagInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [log])

  function startLab() {
    setStarted(true)
    setLog([`XSS Lab started — ${new Date().toLocaleTimeString()}`])
    setCheckpoints(c => ({ ...c, openedLab: true }))
    setMessage(null)
    setFlagInput('')
    setUserInput('')
    setSearchResults('')
  }

  function resetLab() {
    setStarted(false)
    setLog([])
    setCheckpoints({ openedLab: false, foundReflection: false, executedScript: false, extractedCookies: false, submitted: false })
    setMessage(null)
    setFlagInput('')
    setUserInput('')
    setSearchResults('')
  }

  function appendLog(line) {
    setLog(l => [...l, line])
  }

  // Simulated vulnerable search handler
  function handleSearch(e) {
    e?.preventDefault()
    appendLog(`Search query: ${userInput}`)

    // Check for XSS payloads
    const input = userInput.toLowerCase()
    
    if (input.includes('<script>') || input.includes('javascript:') || input.includes('onerror=')) {
      appendLog('XSS payload detected in search!')
      setCheckpoints(c => ({ ...c, foundReflection: true }))
      
      // Simulate script execution (safely)
      if (input.includes('alert') || input.includes('document.cookie')) {
        appendLog('Script executed successfully!')
        appendLog('Cookies extracted: session=abc123; user=admin')
        appendLog(`FLAG: ${DEMO_FLAG}`)
        setCheckpoints(c => ({ ...c, executedScript: true, extractedCookies: true }))
        setMessage({ type: 'success', text: 'XSS exploit successful! Flag revealed in logs.' })
      }
      
      // Simulate reflected output (safely display the input)
      setSearchResults(`Search results for: ${userInput}`)
    } else {
      setSearchResults(`Search results for: ${userInput}\n\nNo results found for "${userInput}". Try searching for something else.`)
      if (userInput.trim()) {
        setMessage({ type: 'info', text: 'Try injecting JavaScript code in the search field.' })
      }
    }
  }

  function copyPayload(payload) {
    navigator.clipboard?.writeText(payload).then(() => {
      appendLog(`Copied XSS payload: ${payload}`)
      setMessage({ type: 'info', text: 'Payload copied! Paste it into the search field.' })
    }).catch(() => {
      setMessage({ type: 'error', text: 'Could not copy to clipboard — copy manually.' })
    })
  }

  function submitFlag(e) {
    e?.preventDefault()
    if (flagInput.trim() === DEMO_FLAG) {
      setCheckpoints(c => ({ ...c, submitted: true }))
      appendLog('Flag submitted: ' + flagInput)
      setMessage({ type: 'success', text: 'Correct! XSS lab completed successfully!' })
    } else {
      appendLog('Flag submission attempt: ' + flagInput)
      setMessage({ type: 'error', text: 'Incorrect flag. Extract it from the logs after successful XSS.' })
    }
  }

  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<script>alert(document.cookie)</script>"
  ]

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0' }}>Cross-Site Scripting (XSS) Lab</h2>
          <div style={{ color: '#cbd5e1' }}>Learn to identify and exploit XSS vulnerabilities in web applications.</div>
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
          <p style={{ color: '#e6eef8' }}>This lab demonstrates Cross-Site Scripting (XSS) vulnerabilities. XSS occurs when user input is reflected in web pages without proper sanitization, allowing attackers to inject malicious scripts.</p>

          <h4>Learning Objectives</h4>
          <ul>
            <li>Understand how XSS vulnerabilities work</li>
            <li>Learn different types of XSS payloads</li>
            <li>Practice exploiting reflected XSS</li>
            <li>Extract sensitive information using JavaScript</li>
          </ul>

          <h4>Steps</h4>
          <ol>
            <li>Start the lab session</li>
            <li>Try injecting XSS payloads in the search field</li>
            <li>Observe how the input is reflected</li>
            <li>Execute JavaScript to extract cookies</li>
            <li>Submit the extracted flag</li>
          </ol>

          <div style={{ marginTop: 12 }}>
            <h4>Vulnerable Search Application</h4>
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }}>
              <form onSubmit={handleSearch}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13 }}>Search Query</label>
                  <input 
                    value={userInput} 
                    onChange={(e)=>setUserInput(e.target.value)} 
                    placeholder="Enter search term..." 
                    className="atk-input"
                    disabled={!started}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" disabled={!started} type="submit">Search</button>
                  <button type="button" className="btn ghost" onClick={()=>{ setUserInput(''); setSearchResults(''); }}>Clear</button>
                </div>
              </form>

              {searchResults && (
                <div style={{ marginTop: 12, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6, whiteSpace: 'pre-line' }}>
                  <strong>Search Results:</strong><br/>
                  {searchResults}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>XSS Payloads</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {xssPayloads.map((payload, i) => (
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
              <li><input type="checkbox" checked={checkpoints.foundReflection} readOnly /> Find XSS reflection</li>
              <li><input type="checkbox" checked={checkpoints.executedScript} readOnly /> Execute JavaScript</li>
              <li><input type="checkbox" checked={checkpoints.extractedCookies} readOnly /> Extract cookies</li>
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
              {showHint ? <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: '0.9rem' }}>Try payloads that execute JavaScript, like <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> or <code>&lt;img src=x onerror=alert(document.cookie)&gt;</code>.</div> : null}
            </div>

            <div style={{ marginTop: 12 }}>
              <h4>XSS Types</h4>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>Reflected XSS:</strong> Input reflected immediately<br/>
                <strong>Stored XSS:</strong> Input stored and displayed later<br/>
                <strong>DOM XSS:</strong> Client-side script modification
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}