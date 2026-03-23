import React, { useMemo, useState } from "react";

const RansomwareContainmentLab = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([
    "Ransomware Containment and Recovery Lab",
    "=======================================",
    "Scenario: Multiple file servers show ransom notes and rapid file encryption.",
    "Goal: Contain spread, preserve evidence, and recover critical services safely.",
    "",
    "Type 'help' for utility commands."
  ]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [labCompleted, setLabCompleted] = useState(false);
  const [actionsTaken, setActionsTaken] = useState([]);

  const steps = useMemo(
    () => [
      {
        title: "Isolate infected endpoint",
        description: "Immediately cut network connectivity to stop lateral movement.",
        validator: (cmd) => /nmcli\s+networking\s+off/i.test(cmd),
        expectedExample: "sudo nmcli networking off",
        hint: "Use nmcli to disable networking on the compromised host.",
        successMessage: "Host isolated from network. Lateral spread path reduced.",
        points: 20,
        action: "Endpoint isolated"
      },
      {
        title: "Identify active encryption process",
        description: "Find suspicious process names associated with encryption behavior.",
        validator: (cmd) => /ps\s+aux\s*\|\s*grep\s+-E[i]?\s+['\"]?(encrypt|locker|ransom)/i.test(cmd),
        expectedExample: "ps aux | grep -Ei 'encrypt|locker|ransom'",
        hint: "Use ps + grep with a regex for ransomware-like process names.",
        successMessage: "Suspicious process detected: lockerd (pid 4242).",
        points: 20,
        action: "Malicious process identified"
      },
      {
        title: "Terminate malicious process",
        description: "Kill the active ransomware process before further encryption.",
        validator: (cmd) => /kill\s+-9\s+\d+/i.test(cmd),
        expectedExample: "sudo kill -9 4242",
        hint: "Use kill -9 with the suspicious process ID.",
        successMessage: "Ransomware process terminated. Encryption rate dropped to zero.",
        points: 25,
        action: "Malicious process terminated"
      },
      {
        title: "Disable exposed file-sharing service",
        description: "Stop SMB service to prevent propagation via shared paths.",
        validator: (cmd) => /systemctl\s+stop\s+smbd/i.test(cmd),
        expectedExample: "sudo systemctl stop smbd",
        hint: "Stop smbd service to cut SMB-based spread.",
        successMessage: "SMB service stopped. File share propagation channel removed.",
        points: 20,
        action: "SMB propagation path closed"
      },
      {
        title: "Restore from known-good backup",
        description: "Recover business-critical files from immutable backup snapshot.",
        validator: (cmd) => /restic\s+restore\s+latest\s+--target\s+\S+/i.test(cmd),
        expectedExample: "restic restore latest --target /srv/recovery",
        hint: "Use restic restore latest to a safe recovery target path.",
        successMessage: "Core files restored to /srv/recovery for integrity validation.",
        points: 30,
        action: "Backup restoration completed"
      },
      {
        title: "Hunt IOCs in logs",
        description: "Search logs for known IOC hash linked to this ransomware family.",
        validator: (cmd) => /grep\s+-R\s+--line-number\s+['\"]?7f4a9c\w*['\"]?\s+\/var\/log/i.test(cmd),
        expectedExample: 'grep -R --line-number "7f4a9c" /var/log',
        hint: "Run recursive grep in /var/log for the IOC prefix 7f4a9c.",
        successMessage: "IOC found in auth and cron logs. Persistence path identified.",
        points: 20,
        action: "IOC evidence collected"
      },
      {
        title: "Enable post-incident auditing",
        description: "Turn on auditd for stronger detection during recovery period.",
        validator: (cmd) => /systemctl\s+enable\s+auditd/i.test(cmd),
        expectedExample: "sudo systemctl enable auditd",
        hint: "Enable auditd as part of post-incident hardening.",
        successMessage: "Auditd enabled. Post-incident monitoring baseline improved.",
        points: 25,
        action: "Post-incident hardening applied"
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
      output.push("- hint: show hint for current step");
      output.push("- status: show progress and score");
      output.push("- actions: show completed containment actions");
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
      output.push(`Score: ${score}/160`);
      output.push(`Current step: ${steps[currentStep]?.title || "Complete"}`);
      setTerminalOutput(output);
      return;
    }

    if (cmd.toLowerCase() === "actions") {
      output.push("Containment actions:");
      if (actionsTaken.length === 0) {
        output.push("- No actions completed yet");
      } else {
        actionsTaken.forEach((item, i) => output.push(`${i + 1}. ${item}`));
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
      const newActions = [...actionsTaken, step.action];

      output.push(`PASS: ${step.successMessage}`);
      output.push(`Points: +${step.points}`);

      setScore(newScore);
      setActionsTaken(newActions);

      if (currentStep < steps.length - 1) {
        const next = steps[currentStep + 1];
        output.push("");
        output.push(`Next ${currentStep + 2}/${steps.length}: ${next.title}`);
        output.push(next.description);
        setCurrentStep(currentStep + 1);
      } else {
        output.push("");
        output.push("RANSOMWARE INCIDENT SUMMARY");
        output.push("---------------------------");
        newActions.forEach((item, i) => output.push(`${i + 1}. ${item}`));
        output.push("");
        output.push("Recovery checklist:");
        output.push("1. Reimage compromised host from gold image");
        output.push("2. Rotate all privileged credentials and service secrets");
        output.push("3. Validate backup integrity before production restore");
        output.push("4. Publish incident timeline and lessons learned");
        output.push("");
        output.push(`Final Score: ${newScore}/160`);
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
          <span className="lab-icon">IR</span>
          <div>
            <h1>Ransomware Containment and Recovery</h1>
            <p>Respond with realistic commands and structured incident handling.</p>
          </div>
        </div>
        <div className="lab-controls">
          <div className="lab-score">Score: {score}/160</div>
          <button onClick={onClose} className="btn ghost">Exit Lab</button>
        </div>
      </div>

      <div className="lab-content">
        <div className="terminal-container">
          <div className="terminal-header">
            <div className="terminal-title">Incident Response Terminal</div>
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
                  <span className="terminal-prompt">responder@ir-team:~$ </span>
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
            <h3>Incident Workflow</h3>
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
              <li>Fast containment before deep analysis</li>
              <li>Evidence preservation while remediating</li>
              <li>Backup-based recovery decision points</li>
              <li>Post-incident hardening actions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RansomwareContainmentLab;
