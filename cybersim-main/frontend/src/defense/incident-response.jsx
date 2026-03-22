import React, { useState, useRef, useEffect } from "react";
import "../App.css";

export default function IncidentResponseLab({ onClose }) {
  const [input, setInput] = useState("");
  const [outputs, setOutputs] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [_isProcessing, setIsProcessing] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [booted, setBooted] = useState(false);
  const [incidentData, setIncidentData] = useState({
    severity: "High",
    type: "Data Breach",
    affectedSystems: 0,
    containmentStatus: "Not Started",
    evidenceCollected: 0,
    timeline: []
  });

  const terminalRef = useRef(null);

  // Incident Response Phases
  const phases = [
    { name: "Preparation", key: "preparation", description: "Establish IR team and procedures" },
    { name: "Identification", key: "identification", description: "Detect and analyze the incident" },
    { name: "Containment", key: "containment", description: "Limit the scope and impact" },
    { name: "Eradication", key: "eradication", description: "Remove the threat from systems" },
    { name: "Recovery", key: "recovery", description: "Restore systems to normal operation" },
    { name: "Lessons Learned", key: "lessons", description: "Document and improve processes" }
  ];

  const [phaseStatus, setPhaseStatus] = useState({
    preparation: false,
    identification: false,
    containment: false,
    eradication: false,
    recovery: false,
    lessons: false
  });

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const scrollBottom = () => {
    requestAnimationFrame(() => {
      if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    });
  };

  const pushOut = async (text, type = "out") => {
    setOutputs((o) => [...o, { type, text }]);
    await delay(10);
    scrollBottom();
  };

  const addToTimeline = (event) => {
    const timestamp = new Date().toLocaleTimeString();
    setIncidentData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { time: timestamp, event }]
    }));
  };

  const markPhaseComplete = (phase) => {
    setPhaseStatus(prev => ({ ...prev, [phase]: true }));
    if (phases.findIndex(p => p.key === phase) === currentPhase) {
      setCurrentPhase(prev => Math.min(prev + 1, phases.length - 1));
    }
  };

  // Incident Response Commands
  const COMMANDS = [
    {
      match: (cmd) => /^(ir-team|team|prepare)/.test(cmd),
      run: async () => {
        await pushOut("Activating Incident Response Team...");
        await delay(600);
        await pushOut("IR Team Members:");
        await pushOut("- Incident Commander: John Smith");
        await pushOut("- Security Analyst: Sarah Johnson");
        await pushOut("- IT Administrator: Mike Davis");
        await pushOut("- Legal Counsel: Lisa Brown");
        await pushOut("- Communications Lead: Tom Wilson");
        await pushOut("IR Team activated and ready");
        markPhaseComplete("preparation");
        addToTimeline("IR Team activated");
      },
    },
    {
      match: (cmd) => /^(analyze|investigate|identify)/.test(cmd),
      run: async () => {
        await pushOut("Analyzing security incident...");
        await delay(800);
        await pushOut("INCIDENT ANALYSIS REPORT:");
        await pushOut("Incident Type: Data Breach");
        await pushOut("Severity Level: HIGH");
        await pushOut("Attack Vector: Phishing email with malicious attachment");
        await pushOut("Affected Systems: Web server, Database server");
        await pushOut("Potential Data Compromised: Customer PII (10,000 records)");
        await pushOut("First Detection: 2024-01-26 14:30:00");
        setIncidentData(prev => ({ ...prev, affectedSystems: 2 }));
        markPhaseComplete("identification");
        addToTimeline("Incident analyzed and classified");
      },
    },
    {
      match: (cmd) => /^(contain|isolate|quarantine)/.test(cmd),
      run: async () => {
        await pushOut("Initiating containment procedures...");
        await delay(700);
        await pushOut("1. Isolating affected web server from network");
        await pushOut("2. Disabling compromised user accounts");
        await pushOut("3. Blocking malicious IP addresses at firewall");
        await pushOut("4. Taking forensic images of affected systems");
        await pushOut("5. Preserving log files and evidence");
        await pushOut("Containment procedures completed successfully");
        setIncidentData(prev => ({ 
          ...prev, 
          containmentStatus: "Complete",
          evidenceCollected: 5
        }));
        markPhaseComplete("containment");
        addToTimeline("Containment procedures completed");
      },
    },
    {
      match: (cmd) => /^(eradicate|remove|clean)/.test(cmd),
      run: async () => {
        await pushOut("Starting eradication procedures...");
        await delay(800);
        await pushOut("1. Removing malware from infected systems");
        await pushOut("2. Patching identified vulnerabilities");
        await pushOut("3. Updating security configurations");
        await pushOut("4. Strengthening access controls");
        await pushOut("5. Installing additional monitoring tools");
        await pushOut("Eradication completed successfully");
        markPhaseComplete("eradication");
        addToTimeline("Threat eradicated from systems");
      },
    },
    {
      match: (cmd) => /^(recover|restore|rebuild)/.test(cmd),
      run: async () => {
        await pushOut("Initiating recovery procedures...");
        await delay(900);
        await pushOut("1. Restoring systems from clean backups");
        await pushOut("2. Validating system integrity");
        await pushOut("3. Implementing additional monitoring");
        await pushOut("4. Conducting security testing");
        await pushOut("5. Returning systems to production");
        await pushOut("Recovery procedures completed");
        markPhaseComplete("recovery");
        addToTimeline("Systems restored to normal operation");
      },
    },
    {
      match: (cmd) => /^(report|document|lessons)/.test(cmd),
      run: async () => {
        await pushOut("Generating incident report and lessons learned...");
        await delay(700);
        await pushOut("INCIDENT RESPONSE REPORT");
        await pushOut("==========================");
        await pushOut("Incident ID: IR-2024-001");
        await pushOut("Severity: HIGH");
        await pushOut("Duration: 4 hours");
        await pushOut("Systems Affected: 2");
        await pushOut("Data Compromised: Customer PII");
        await pushOut("Root Cause: Phishing attack");
        await pushOut("Lessons Learned:");
        await pushOut("- Improve email security training");
        await pushOut("- Implement additional email filtering");
        await pushOut("- Enhance monitoring capabilities");
        await pushOut("Report completed and distributed");
        markPhaseComplete("lessons");
        addToTimeline("Final report completed");
      },
    },
    {
      match: (cmd) => /^(status|info)$/.test(cmd),
      run: async () => {
        await pushOut("INCIDENT STATUS:");
        await pushOut("Type: " + incidentData.type);
        await pushOut("Severity: " + incidentData.severity);
        await pushOut("Affected Systems: " + incidentData.affectedSystems);
        await pushOut("Containment: " + incidentData.containmentStatus);
        await pushOut("Evidence Collected: " + incidentData.evidenceCollected + " items");
        await pushOut("Timeline Events: " + incidentData.timeline.length);
      },
    },
    {
      match: (cmd) => /^(timeline)$/.test(cmd),
      run: async () => {
        await pushOut("INCIDENT TIMELINE:");
        if (incidentData.timeline.length === 0) {
          await pushOut("No timeline events recorded yet");
        } else {
          incidentData.timeline.forEach(async (event) => {
            await pushOut(`${event.time} - ${event.event}`);
          });
        }
      },
    },
    {
      match: (cmd) => /^(help|\?)$/.test(cmd),
      run: async () => {
        await pushOut(
          "Incident Response Commands:\n" +
            "PREPARATION:\n" +
            "- ir-team (activate incident response team)\n" +
            "\nIDENTIFICATION:\n" +
            "- analyze (analyze the security incident)\n" +
            "\nCONTAINMENT:\n" +
            "- contain (isolate affected systems)\n" +
            "\nERADICATION:\n" +
            "- eradicate (remove threats from systems)\n" +
            "\nRECOVERY:\n" +
            "- recover (restore systems to normal operation)\n" +
            "\nLESSONS LEARNED:\n" +
            "- report (generate final incident report)\n" +
            "\nOTHER:\n" +
            "- status (show incident status)\n" +
            "- timeline (show incident timeline)"
        );
      },
    },
  ];

  const handleCommand = async (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setInput("");
    setOutputs((o) => [...o, { type: "cmd", text: `$ ${cmd}` }]);
    setIsProcessing(true);

    const match = COMMANDS.find((c) => c.match(cmd));
    if (match) await match.run(cmd);
    else await pushOut(`bash: ${cmd.split(" ")[0]}: command not found`, "err");

    setIsProcessing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(input);
    }
  };

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 600);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (booted) return;
    const boot = async () => {
      await pushOut("Welcome to Incident Response Lab", "sys");
      await delay(400);
      await pushOut("Scenario: Data breach detected in corporate network", "sys");
      await delay(400);
      await pushOut("Objective: Follow IR lifecycle to contain and resolve incident", "sys");
      await delay(400);
      await pushOut("Type 'help' for available commands", "sys");
      await delay(400);
      await pushOut("Start with: ir-team", "sys");
      setBooted(true);
    };
    boot();
  }, [booted, pushOut]);

  const computeProgress = () => {
    const completed = Object.values(phaseStatus).filter(Boolean).length;
    return Math.round((completed / phases.length) * 100);
  };

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0' }}>Incident Response Lab</h2>
          <div style={{ color: '#cbd5e1' }}>Practice the 6-phase incident response lifecycle with a realistic data breach scenario.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={() => { if (onClose) onClose() }}>Exit</button>
          <button className="btn" onClick={() => { 
            setOutputs([]); 
            setPhaseStatus({ preparation: false, identification: false, containment: false, eradication: false, recovery: false, lessons: false });
            setIncidentData({ severity: "High", type: "Data Breach", affectedSystems: 0, containmentStatus: "Not Started", evidenceCollected: 0, timeline: [] });
            setCurrentPhase(0);
          }}>Reset</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
        {/* Terminal Section */}
        <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
          <div style={{ padding: 12, background: 'rgba(0, 102, 255, 0.1)', borderBottom: '1px solid rgba(0, 102, 255, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Incident Response Terminal</h3>
          </div>
          <div ref={terminalRef} style={{ height: 400, overflow: 'auto', padding: 16, fontFamily: 'monospace', fontSize: 14, background: '#0a0e1a' }}>
            {outputs.map((o, i) => (
              <TerminalLine key={i} {...o} />
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f59e0b' }}>ir-commander@cybersim:~$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                style={{ 
                  flex: 1, 
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  color: '#fff', 
                  fontFamily: 'monospace',
                  fontSize: 14
                }}
                spellCheck={false}
                autoFocus
              />
              <span style={{ color: cursorVisible ? '#fff' : 'transparent' }}>█</span>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Progress</h3>
            <div style={{ 
              width: '100%', 
              height: 8, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 4, 
              overflow: 'hidden',
              marginBottom: 8
            }}>
              <div style={{ 
                width: `${computeProgress()}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>{computeProgress()}% complete</p>
          </div>

          {/* IR Phases */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>IR Phases</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {phases.map((phase, i) => (
                <li key={phase.key} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ 
                      color: phaseStatus[phase.key] ? '#10b981' : (i === currentPhase ? '#f59e0b' : '#6b7280'),
                      fontSize: '1.2rem'
                    }}>
                      {phaseStatus[phase.key] ? "✓" : (i === currentPhase ? "→" : "○")}
                    </span>
                    <span style={{ 
                      color: phaseStatus[phase.key] ? '#10b981' : (i === currentPhase ? '#f59e0b' : '#e5e7eb'),
                      fontSize: '0.9rem',
                      fontWeight: i === currentPhase ? 'bold' : 'normal'
                    }}>
                      {phase.name}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#94a3b8', 
                    marginLeft: 28
                  }}>
                    {phase.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Incident Status */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Incident Status</h3>
            <div style={{ display: 'grid', gap: 8, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type:</span>
                <span style={{ color: '#ef4444' }}>{incidentData.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Severity:</span>
                <span style={{ color: '#ef4444' }}>{incidentData.severity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Affected Systems:</span>
                <span style={{ color: '#f59e0b' }}>{incidentData.affectedSystems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Containment:</span>
                <span style={{ color: incidentData.containmentStatus === 'Complete' ? '#10b981' : '#6b7280' }}>
                  {incidentData.containmentStatus}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Evidence:</span>
                <span style={{ color: '#0066FF' }}>{incidentData.evidenceCollected} items</span>
              </div>
            </div>
          </div>

          {/* Quick Commands */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Quick Commands</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                className="btn primary" 
                onClick={() => setInput("ir-team")}
                style={{ fontSize: '0.8rem' }}
              >
                Activate IR Team
              </button>
              <button 
                className="btn primary" 
                onClick={() => setInput("analyze")}
                style={{ fontSize: '0.8rem' }}
              >
                Analyze Incident
              </button>
              <button 
                className="btn primary" 
                onClick={() => setInput("status")}
                style={{ fontSize: '0.8rem' }}
              >
                Show Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalLine({ type, text }) {
  const color =
    type === "cmd"
      ? "#f59e0b"
      : type === "err"
      ? "#ef4444"
      : type === "sys"
      ? "#10b981"
      : "#e5e7eb";
  return <pre style={{ margin: 0, color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</pre>;
}