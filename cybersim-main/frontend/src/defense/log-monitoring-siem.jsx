import React, { useMemo, useState } from "react";

const LogMonitoringSIEMLab = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([
    "SOC Monitoring and SIEM Triage Lab",
    "==================================",
    "Scenario: Suspicious login spikes and outbound beaconing detected.",
    "Goal: Triage alerts, validate indicators, and deploy containment controls.",
    "",
    "Type 'help' for utility commands."
  ]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [labCompleted, setLabCompleted] = useState(false);
  const [findings, setFindings] = useState([]);

  const steps = useMemo(
    () => [
      {
        title: "Review web auth logs",
        description: "Identify suspicious failed-login patterns in the last hour.",
        validator: (cmd) => /journalctl\s+-u\s+nginx\s+--since\s+"?1\s+hour\s+ago"?/i.test(cmd),
        expectedExample: 'journalctl -u nginx --since "1 hour ago"',
        hint: "Use journalctl on nginx with a one-hour time range.",
        successMessage:
          "Detected repeated failed logins from 198.51.100.27 against /admin/login.",
        points: 20,
        finding: "Brute-force source identified: 198.51.100.27"
      },
      {
        title: "Validate host-based protection",
        description: "Confirm current sshd jail behavior for brute-force bans.",
        validator: (cmd) => /fail2ban-client\s+status\s+sshd/i.test(cmd),
        expectedExample: "fail2ban-client status sshd",
        hint: "Use fail2ban-client status for sshd.",
        successMessage: "Fail2Ban active; current maxretry is permissive and needs tightening.",
        points: 20,
        finding: "Fail2Ban policy gap observed"
      },
      {
        title: "Inspect firewall baseline",
        description: "Review active firewall rules before making changes.",
        validator: (cmd) => /ufw\s+status\s+numbered/i.test(cmd),
        expectedExample: "sudo ufw status numbered",
        hint: "Run ufw status with numbered output.",
        successMessage: "Firewall baseline captured; outbound filtering is currently broad.",
        points: 15,
        finding: "Firewall baseline documented"
      },
      {
        title: "Capture suspicious traffic",
        description: "Verify beaconing behavior from known malicious source.",
        validator: (cmd) => /tcpdump\s+-nn\s+-i\s+\w+\s+host\s+198\.51\.100\.27/i.test(cmd),
        expectedExample: "sudo tcpdump -nn -i eth0 host 198.51.100.27",
        hint: "Use tcpdump with -nn and host filter on the IOC IP.",
        successMessage:
          "Observed periodic HTTPS beacon every 60 seconds to 198.51.100.27:443.",
        points: 25,
        finding: "Confirmed C2 beacon pattern"
      },
      {
        title: "Contain malicious source",
        description: "Drop all inbound traffic from the IOC at host firewall.",
        validator: (cmd) => /iptables\s+-A\s+INPUT\s+-s\s+198\.51\.100\.27\s+-j\s+DROP/i.test(cmd),
        expectedExample: "sudo iptables -A INPUT -s 198.51.100.27 -j DROP",
        hint: "Append an INPUT drop rule by source IP.",
        successMessage: "Containment applied. IOC source blocked at host level.",
        points: 30,
        finding: "IOC blocked via iptables"
      },
      {
        title: "Update IDS signatures",
        description: "Refresh detection content and restart monitoring service.",
        validator: (cmd) => /suricata-update\s*&&\s*sudo\s+systemctl\s+restart\s+suricata/i.test(cmd),
        expectedExample: "suricata-update && sudo systemctl restart suricata",
        hint: "Update signatures, then restart Suricata in one command.",
        successMessage: "SIEM content refreshed and IDS monitoring resumed with updated signatures.",
        points: 40,
        finding: "Detection pipeline hardened"
      }
    ],
    []
  );

  const handleCommand = (command) => {
    const cmd = command.trim();
    if (!cmd) return;

    const output = [...terminalOutput, `$ ${cmd}`];

    if (cmd.toLowerCase() === "help") {
      output.push("Utility commands:");
      output.push("- hint: show a hint for current step");
      output.push("- status: show current progress and score");
      output.push("- findings: list triage findings so far");
      output.push("- clear: clear terminal output");
      setTerminalOutput(output);
      return;
    }

    if (cmd.toLowerCase() === "hint") {
      output.push(`Hint: ${steps[currentStep].hint}`);
      setTerminalOutput(output);
      return;
    }

    if (cmd.toLowerCase() === "status") {
      output.push(`Progress: ${currentStep}/${steps.length} completed`);
      output.push(`Score: ${score}/150`);
      output.push(`Current step: ${steps[currentStep]?.title || "Complete"}`);
      setTerminalOutput(output);
      return;
    }

    if (cmd.toLowerCase() === "findings") {
      output.push("Triage findings:");
      if (findings.length === 0) {
        output.push("- No findings yet");
      } else {
        findings.forEach((item, i) => output.push(`${i + 1}. ${item}`));
      }
      setTerminalOutput(output);
      return;
    }

    if (cmd.toLowerCase() === "clear") {
      setTerminalOutput([]);
      return;
    }

    if (labCompleted) {
      output.push("Lab already completed. Use Exit Lab to return.");
      setTerminalOutput(output);
      return;
    }

    const step = steps[currentStep];
    if (step.validator(cmd)) {
      const newScore = score + step.points;
      const newFindings = [...findings, step.finding];

      output.push(`PASS: ${step.successMessage}`);
      output.push(`Points: +${step.points}`);

      setScore(newScore);
      setFindings(newFindings);

      if (currentStep < steps.length - 1) {
        const next = steps[currentStep + 1];
        output.push("");
        output.push(`Next ${currentStep + 2}/${steps.length}: ${next.title}`);
        output.push(next.description);
        setCurrentStep(currentStep + 1);
      } else {
        output.push("");
        output.push("SOC TRIAGE REPORT");
        output.push("-----------------");
        newFindings.forEach((item, i) => output.push(`${i + 1}. ${item}`));
        output.push("");
        output.push("Recommended follow-up actions:");
        output.push("1. Enforce MFA on admin portals and VPN");
        output.push("2. Reduce fail2ban maxretry and alert on lockout bursts");
        output.push("3. Add SIEM rule for periodic beacon patterns");
        output.push("4. Run endpoint hunt for related IOC set");
        output.push("");
        output.push(`Final Score: ${newScore}/150`);
        setLabCompleted(true);
      }
    } else {
      output.push("Incorrect command for this step.");
      output.push(`Expected pattern example: ${step.expectedExample}`);
      output.push("Use 'hint' if needed.");
    }

    setTerminalOutput(output);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(userInput);
    setUserInput("");
  };

  return (
    <div className="lab-container">
      <div className="lab-header">
        <div className="lab-title">
          <span className="lab-icon">SOC</span>
          <div>
            <h1>Log Monitoring and SIEM Triage</h1>
            <p>Practice realistic SOC analysis and containment workflow.</p>
          </div>
        </div>
        <div className="lab-controls">
          <div className="lab-score">Score: {score}/150</div>
          <button onClick={onClose} className="btn ghost">Exit Lab</button>
        </div>
      </div>

      <div className="lab-content">
        <div className="terminal-container">
          <div className="terminal-header">
            <div className="terminal-title">SOC Terminal</div>
            <div className="terminal-status">
              Step {Math.min(currentStep + 1, steps.length)}/{steps.length}
              {labCompleted ? " | Completed" : " | In Progress"}
            </div>
          </div>

          <div className="terminal-body">
            <div className="terminal-output">
              {terminalOutput.map((line, index) => (
                <div key={index} className="terminal-line">{line}</div>
              ))}
            </div>

            {!labCompleted && (
              <form onSubmit={handleSubmit} className="terminal-input-form">
                <div className="terminal-input-line">
                  <span className="terminal-prompt">soc@blue-team:~$ </span>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="terminal-input"
                    placeholder="Enter your command..."
                    autoFocus
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="lab-sidebar">
          <div className="lab-progress">
            <h3>Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentStep + (labCompleted ? 1 : 0)) / steps.length) * 100}%` }}></div>
            </div>
            <p>{currentStep + (labCompleted ? 1 : 0)}/{steps.length} steps complete</p>
          </div>

          <div className="lab-objectives">
            <h3>Session Plan</h3>
            <ul>
              {steps.map((step, index) => (
                <li key={step.title} className={index < currentStep ? "completed" : index === currentStep ? "current" : ""}>
                  {step.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="lab-tips">
            <h3>What You Learn</h3>
            <ul>
              <li>How to triage noisy auth alerts quickly</li>
              <li>How to confirm network IOC activity</li>
              <li>How to apply safe host-level containment</li>
              <li>How to improve detection content after response</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogMonitoringSIEMLab;
