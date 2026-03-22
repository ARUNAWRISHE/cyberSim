import React, { useState, useEffect, useRef } from 'react'
import '../App.css'

// Directory Traversal Lab - Safe, client-side simulation only
const DEMO_FLAG = 'flag{directory_traversal_success}'

export default function DirectoryTraversalLab({ onClose }) {
  const [started, setStarted] = useState(false)
  const [log, setLog] = useState([])
  const [checkpoints, setCheckpoints] = useState({
    openedLab: false,
    foundTraversal: false,
    accessedParent: false,
    extractedFlag: false,
    submitted: false,
  })

  const [fileInput, setFileInput] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [message, setMessage] = useState(null)
  const [flagInput, setFlagInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const terminalRef = useRef(null)

  // Simulated file system
  const fileSystem = {
    'readme.txt': 'Welcome to the file viewer application!',
    'info.txt': 'This application allows you to view files in the current directory.',
    'help.txt': 'Usage: Enter a filename to view its contents.',
    '../config.txt': 'Database connection: localhost:3306',
    '../secret.txt': `Secret configuration file\nAPI Key: sk-1234567890\n${DEMO_FLAG}`,
    '../../etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
    '../../../flag.txt': DEMO_FLAG,
    '....//....//flag.txt': DEMO_FLAG,
    '%2e%2e%2fflag.txt': DEMO_FLAG
  }

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [log])

  function startLab() {
    setStarted(true)
    setLog([`Directory Traversal Lab started — ${new Date().toLocaleTimeString()}`])
    setCheckpoints(c => ({ ...c, openedLab: true }))
    setMessage(null)
    setFlagInput('')
    setFileInput('')
    setFileContent('')
  }

  function resetLab() {
    setStarted(false)
    setLog([])
    setCheckpoints({ openedLab: false, foundTraversal: false, accessedParent: false, extractedFlag: false, submitted: false })
    setMessage(null)
    setFlagInput('')
    setFileInput('')
    setFileContent('')
  }

  function appendLog(line) {
    setLog(l => [...l, line])
  }

  // Simulated vulnerable file viewer
  function handleFileView(e) {
    e?.preventDefault()
    appendLog(`File request: ${fileInput}`)

    // Check for directory traversal payloads
    const input = fileInput.toLowerCase()
    
    if (input.includes('../') || input.includes('..\\') || input.includes('%2e%2e') || input.includes('....//')) {
      appendLog('Directory traversal attempt detected!')
      setCheckpoints(c => ({ ...c, foundTraversal: true }))
      
      // Check if accessing parent directories
      if (input.includes('../') || input.includes('..\\')) {
        setCheckpoints(c => ({ ...c, accessedParent: true }))
      }
    }

    // Simulate file access
    const content = fileSystem[fileInput] || fileSystem[fileInput.toLowerCase()]
    
    if (content) {
      setFileContent(content)
      appendLog(`File accessed successfully: ${fileInput}`)
      
      if (content.includes(DEMO_FLAG)) {
        appendLog('Flag found in file!')
        setCheckpoints(c => ({ ...c, extractedFlag: true }))
        setMessage({ type: 'success', text: 'Directory traversal successful! Flag found in file.' })
      } else {
        setMessage({ type: 'info', text: 'File accessed. Try traversing to parent directories.' })
      }
    } else {
      setFileContent('Error: File not found or access denied.')
      appendLog(`File not found: ${fileInput}`)
      
      if (fileInput.trim() && !input.includes('../')) {
        setMessage({ type: 'info', text: 'File not found. Try using ../ to access parent directories.' })
      } else if (input.includes('../')) {
        setMessage({ type: 'info', text: 'Access denied. Try different traversal techniques.' })
      }
    }
  }

  function copyPayload(payload) {
    navigator.clipboard?.writeText(payload).then(() => {
      appendLog(`Copied traversal payload: ${payload}`)
      setMessage({ type: 'info', text: 'Payload copied! Paste it into the filename field.' })
    }).catch(() => {
      setMessage({ type: 'error', text: 'Could not copy to clipboard — copy manually.' })
    })
  }

  function submitFlag(e) {
    e?.preventDefault()
    if (flagInput.trim() === DEMO_FLAG) {
      setCheckpoints(c => ({ ...c, submitted: true }))
      appendLog('Flag submitted: ' + flagInput)
      setMessage({ type: 'success', text: 'Correct! Directory traversal lab completed!' })
    } else {
      appendLog('Flag submission attempt: ' + flagInput)
      setMessage({ type: 'error', text: 'Incorrect flag. Extract it using directory traversal.' })
    }
  }

  const traversalPayloads = [
    "../secret.txt",
    "../../etc/passwd",
    "../../../flag.txt",
    "....//....//flag.txt",
    "%2e%2e%2fflag.txt"
  ]

  const availableFiles = [
    "readme.txt",
    "info.txt", 
    "help.txt"
  ]

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0' }}>Directory Traversal Lab</h2>
          <div style={{ color: '#cbd5e1' }}>Learn to exploit path traversal vulnerabilities to access unauthorized files.</div>
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
          <p style={{ color: '#e6eef8' }}>Directory traversal (path traversal) allows attackers to access files outside the intended directory by manipulating file paths with sequences like "../".</p>

          <h4>Learning Objectives</h4>
          <ul>
            <li>Understand how directory traversal vulnerabilities work</li>
            <li>Learn different path traversal techniques</li>
            <li>Practice bypassing path restrictions</li>
            <li>Access sensitive files outside the web root</li>
          </ul>

          <h4>Steps</h4>
          <ol>
            <li>Start the lab session</li>
            <li>Try accessing normal files first</li>
            <li>Use ../ sequences to traverse directories</li>
            <li>Try different encoding and bypass techniques</li>
            <li>Extract the flag from sensitive files</li>
          </ol>

          <div style={{ marginTop: 12 }}>
            <h4>Vulnerable File Viewer</h4>
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }}>
              <form onSubmit={handleFileView}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13 }}>Filename</label>
                  <input 
                    value={fileInput} 
                    onChange={(e)=>setFileInput(e.target.value)} 
                    placeholder="Enter filename to view..." 
                    className="atk-input"
                    disabled={!started}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" disabled={!started} type="submit">View File</button>
                  <button type="button" className="btn ghost" onClick={()=>{ setFileInput(''); setFileContent(''); }}>Clear</button>
                </div>
              </form>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>Available Files</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {availableFiles.map((file, i) => (
                    <button key={i} className="btn ghost" onClick={()=>setFileInput(file)} disabled={!started} style={{ fontSize: '0.8rem' }}>
                      {file}
                    </button>
                  ))}
                </div>
              </div>

              {fileContent && (
                <div style={{ marginTop: 12, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6, whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <strong>File Contents:</strong><br/>
                  {fileContent}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>Traversal Payloads</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {traversalPayloads.map((payload, i) => (
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
              <li><input type="checkbox" checked={checkpoints.foundTraversal} readOnly /> Find traversal vulnerability</li>
              <li><input type="checkbox" checked={checkpoints.accessedParent} readOnly /> Access parent directory</li>
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
              {showHint ? <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: '0.9rem' }}>Use <code>../</code> to go up directories. Try <code>../secret.txt</code> or <code>../../etc/passwd</code>. Some systems may require encoding like <code>%2e%2e%2f</code>.</div> : null}
            </div>

            <div style={{ marginTop: 12 }}>
              <h4>Traversal Techniques</h4>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>../</strong> - Standard traversal<br/>
                <strong>..\\</strong> - Windows traversal<br/>
                <strong>%2e%2e%2f</strong> - URL encoded<br/>
                <strong>....//</strong> - Double encoding bypass
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4>Common Targets</h4>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>/etc/passwd</strong> - Unix user accounts<br/>
                <strong>/etc/shadow</strong> - Password hashes<br/>
                <strong>../config.txt</strong> - Configuration files<br/>
                <strong>../../../flag.txt</strong> - Challenge flags
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}