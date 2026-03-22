import React, { useState, useRef, useEffect } from "react";
import "../App.css";

export default function NetworkSecurityLab({ onClose }) {
  const [input, setInput] = useState("");
  const [outputs, setOutputs] = useState([]);
  const [_history, setHistory] = useState([]);
  const [_isProcessing, setIsProcessing] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [booted, setBooted] = useState(false);

  const terminalRef = useRef(null);

  // Network Security Checklist
  const initialChecklist = [
    { id: "firewall", title: "Configure iptables firewall rules", done: false, hint: "iptables -A INPUT -p tcp --dport 22 -j ACCEPT" },
    { id: "ids", title: "Install and configure Snort IDS", done: false, hint: "sudo apt install snort && sudo snort -c /etc/snort/snort.conf" },
    { id: "monitoring", title: "Set up network monitoring", done: false, hint: "sudo netstat -tuln && ss -tuln" },
    { id: "vpn", title: "Configure VPN server", done: false, hint: "sudo apt install openvpn && sudo systemctl enable openvpn" },
    { id: "dns", title: "Secure DNS configuration", done: false, hint: "sudo systemctl restart systemd-resolved" },
    { id: "nmap", title: "Run network vulnerability scan", done: false, hint: "nmap -sV -sC localhost" },
  ];
  const [checklist, setChecklist] = useState(initialChecklist);
  const [networkStatus, setNetworkStatus] = useState({
    openPorts: [],
    activeConnections: 0,
    suspiciousActivity: 0,
    firewallRules: 0
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

  const markDone = (id) =>
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: true } : c))
    );

  const computeProgress = () => {
    const done = checklist.filter((c) => c.done).length;
    return Math.round((done / checklist.length) * 100);
  };

  // Network Security Commands
  const COMMANDS = [
    {
      match: (cmd) => /^(sudo\s+)?iptables/.test(cmd),
      run: async (cmd) => {
        await pushOut("Configuring iptables firewall rules...");
        await delay(700);
        if (cmd.includes('-A INPUT')) {
          await pushOut("Added INPUT rule to iptables");
          setNetworkStatus(prev => ({ ...prev, firewallRules: prev.firewallRules + 1 }));
        } else if (cmd.includes('-L')) {
          await pushOut("Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh\nDROP       all  --  anywhere             anywhere");
        } else {
          await pushOut("Firewall rule applied successfully");
        }
        markDone("firewall");
      },
    },
    {
      match: (cmd) => /^(sudo\s+)?(apt\s+install\s+snort|snort)/.test(cmd),
      run: async (cmd) => {
        if (cmd.includes('install')) {
          await pushOut("Installing Snort IDS...");
          await delay(1200);
          await pushOut("Snort IDS installed successfully");
        } else {
          await pushOut("Starting Snort IDS in daemon mode...");
          await delay(800);
          await pushOut("Snort IDS is now monitoring network traffic");
          await pushOut("Alert: Detected 0 suspicious packets in last 5 minutes");
        }
        markDone("ids");
      },
    },
    {
      match: (cmd) => /^(netstat|ss)/.test(cmd),
      run: async () => {
        await pushOut("Scanning network connections...");
        await delay(600);
        const ports = ["22/tcp (ssh)", "80/tcp (http)", "443/tcp (https)", "3306/tcp (mysql)"];
        await pushOut("Active Internet connections:");
        await pushOut("Proto Recv-Q Send-Q Local Address           Foreign Address         State");
        await pushOut("tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN");
        await pushOut("tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN");
        setNetworkStatus(prev => ({ ...prev, openPorts: ports, activeConnections: 12 }));
        markDone("monitoring");
      },
    },
    {
      match: (cmd) => /^(sudo\s+)?(apt\s+install\s+openvpn|openvpn|systemctl.*openvpn)/.test(cmd),
      run: async (cmd) => {
        if (cmd.includes('install')) {
          await pushOut("Installing OpenVPN server...");
          await delay(1000);
          await pushOut("OpenVPN installed successfully");
        } else {
          await pushOut("Configuring OpenVPN server...");
          await delay(800);
          await pushOut("OpenVPN server started and enabled");
          await pushOut("VPN server listening on UDP port 1194");
        }
        markDone("vpn");
      },
    },
    {
      match: (cmd) => /^(sudo\s+)?systemctl.*resolved/.test(cmd),
      run: async () => {
        await pushOut("Configuring secure DNS settings...");
        await delay(600);
        await pushOut("DNS over HTTPS (DoH) enabled");
        await pushOut("DNS over TLS (DoT) configured");
        await pushOut("systemd-resolved restarted successfully");
        markDone("dns");
      },
    },
    {
      match: (cmd) => /^nmap/.test(cmd),
      run: async () => {
        await pushOut("Starting Nmap vulnerability scan...");
        await delay(1200);
        await pushOut("Nmap scan report for localhost (127.0.0.1)");
        await pushOut("Host is up (0.000050s latency)");
        await pushOut("PORT     STATE SERVICE VERSION");
        await pushOut("22/tcp   open  ssh     OpenSSH 8.2p1");
        await pushOut("80/tcp   open  http    Apache httpd 2.4.41");
        await pushOut("443/tcp  open  https   Apache httpd 2.4.41");
        await pushOut("Scan completed - 3 open ports found");
        markDone("nmap");
      },
    },
    {
      match: (cmd) => /^(tcpdump|wireshark)/.test(cmd),
      run: async () => {
        await pushOut("Starting packet capture...");
        await delay(800);
        await pushOut("tcpdump: listening on eth0, link-type EN10MB");
        await pushOut("12:34:56.789 IP 192.168.1.100.22 > 192.168.1.1.54321: Flags [P.], seq 1:29");
        await pushOut("12:34:57.123 IP 192.168.1.1.54321 > 192.168.1.100.22: Flags [.], ack 29");
        await pushOut("Captured 24 packets in 10 seconds");
      },
    },
    {
      match: (cmd) => /^(status|network-status)$/.test(cmd),
      run: async () => {
        const pct = computeProgress();
        await pushOut(`Network Security Status: ${pct}% configured`);
        await pushOut(`Open Ports: ${networkStatus.openPorts.length}`);
        await pushOut(`Active Connections: ${networkStatus.activeConnections}`);
        await pushOut(`Firewall Rules: ${networkStatus.firewallRules}`);
        await pushOut(`Suspicious Activity: ${networkStatus.suspiciousActivity} alerts`);
      },
    },
    {
      match: (cmd) => /^(checklist)$/.test(cmd),
      run: async () => {
        const lines = checklist
          .map((c) => `${c.done ? "[x]" : "[ ]"} ${c.title}`)
          .join("\n");
        await pushOut(lines);
      },
    },
    {
      match: (cmd) => /^(help|\?)$/.test(cmd),
      run: async () => {
        await pushOut(
          "Network Security Commands:\n" +
            "- iptables -A INPUT -p tcp --dport 22 -j ACCEPT\n" +
            "- sudo apt install snort\n" +
            "- netstat -tuln\n" +
            "- sudo apt install openvpn\n" +
            "- sudo systemctl restart systemd-resolved\n" +
            "- nmap -sV localhost\n" +
            "- tcpdump -i eth0\n" +
            "- status (show network status)\n" +
            "- checklist"
        );
      },
    },
  ];

  const handleCommand = async (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setHistory((h) => [cmd, ...h].slice(0, 50));
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
      await pushOut("Welcome to Network Security Lab (simulated)", "sys");
      await delay(400);
      await pushOut("Objective: Configure comprehensive network security", "sys");
      await delay(400);
      await pushOut("Type 'help' for available commands", "sys");
      await delay(400);
      await pushOut("Start by configuring firewall rules with iptables", "sys");
      setBooted(true);
    };
    boot();
  }, [booted, pushOut]);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0' }}>Network Security Configuration Lab</h2>
          <div style={{ color: '#cbd5e1' }}>Configure firewalls, IDS, monitoring, and VPN for robust network security.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={() => { if (onClose) onClose() }}>Exit</button>
          <button className="btn" onClick={() => { setOutputs([]); setChecklist(initialChecklist); setNetworkStatus({ openPorts: [], activeConnections: 0, suspiciousActivity: 0, firewallRules: 0 }); }}>Reset</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
        {/* Terminal Section */}
        <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
          <div style={{ padding: 12, background: 'rgba(0, 102, 255, 0.1)', borderBottom: '1px solid rgba(0, 102, 255, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Network Security Terminal</h3>
          </div>
          <div ref={terminalRef} style={{ height: 400, overflow: 'auto', padding: 16, fontFamily: 'monospace', fontSize: 14, background: '#0a0e1a' }}>
            {outputs.map((o, i) => (
              <TerminalLine key={i} {...o} />
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>admin@netlab:~$</span>
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
          <div style={{ padding: 12, background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Use Tab for autocomplete • ↑↓ for history • Enter to run</span>
            <button className="btn ghost" onClick={() => setOutputs([])}>Clear</button>
          </div>
        </div>

        {/* Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Security Status</h3>
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
                background: 'linear-gradient(90deg, #0066FF, #00D4FF)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>{computeProgress()}% configured</p>
          </div>

          {/* Network Status */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Network Status</h3>
            <div style={{ display: 'grid', gap: 8, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Open Ports:</span>
                <span style={{ color: networkStatus.openPorts.length > 0 ? '#f59e0b' : '#10b981' }}>
                  {networkStatus.openPorts.length}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Connections:</span>
                <span style={{ color: '#0066FF' }}>{networkStatus.activeConnections}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Firewall Rules:</span>
                <span style={{ color: '#10b981' }}>{networkStatus.firewallRules}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Suspicious Activity:</span>
                <span style={{ color: networkStatus.suspiciousActivity > 0 ? '#ef4444' : '#10b981' }}>
                  {networkStatus.suspiciousActivity}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Security Checklist</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {checklist.map((c) => (
                <li key={c.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ 
                      color: c.done ? '#10b981' : '#6b7280',
                      fontSize: '1.2rem'
                    }}>
                      {c.done ? "✓" : "○"}
                    </span>
                    <span style={{ 
                      color: c.done ? '#10b981' : '#e5e7eb',
                      fontSize: '0.9rem',
                      textDecoration: c.done ? 'line-through' : 'none'
                    }}>
                      {c.title}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#94a3b8', 
                    marginLeft: 28,
                    fontFamily: 'monospace'
                  }}>
                    {c.hint}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div style={{ border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: 12, padding: 16, background: 'linear-gradient(145deg, rgba(26, 31, 46, 0.8), rgba(15, 20, 32, 0.8))' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                className="btn primary" 
                onClick={() => setInput("iptables -L")}
                style={{ fontSize: '0.8rem' }}
              >
                Check Firewall Rules
              </button>
              <button 
                className="btn primary" 
                onClick={() => setInput("netstat -tuln")}
                style={{ fontSize: '0.8rem' }}
              >
                Scan Network Ports
              </button>
              <button 
                className="btn primary" 
                onClick={() => setInput("status")}
                style={{ fontSize: '0.8rem' }}
              >
                Show Network Status
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
      ? "#0066FF"
      : type === "err"
      ? "#ef4444"
      : type === "sys"
      ? "#10b981"
      : "#e5e7eb";
  return <pre style={{ margin: 0, color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</pre>;
}