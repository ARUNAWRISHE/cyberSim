import React, { useMemo, useState } from "react";

const ThreatHuntingEDRLab = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([
    "Threat Hunting with EDR Lab",
    "===========================",
    "Scenario: Suspicious PowerShell activity was detected across multiple endpoints.",
    "Goal: Hunt indicators, validate attacker behavior, and deploy containment actions.",
    "",
    "Type 'help' for utility commands."
  ]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [labCompleted, setLabCompleted] = useState(false);
  const [evidence, setEvidence] = useState([]);

  const steps = useMemo(
    () => [
      {
        title: "List suspicious PowerShell processes",
        description: "Identify potentially malicious encoded or hidden PowerShell executions.",
        validator: (cmd) => /Get-Process\s+powershell/i.test(cmd),
        expectedExample: "Get-Process powershell",
        hint: "Start by enumerating active PowerShell processes.",
        successMessage: "Found unusual powershell.exe spawned by winword.exe.",
        points: 20,
        evidence: "PowerShell parent-child anomaly detected"
      },
      {
        title: "Query EDR process events",
        description: "Pull process creation telemetry with encoded command indicators.",
        validator: (cmd) => /edrctl\s+query\s+process\s+--contains\s+"?-enc"?/i.test(cmd),
        expectedExample: "edrctl query process --contains \"-enc\"",
        hint: "Use an EDR process query and search for -enc usage.",
        successMessage: "EDR matched 4 encoded PowerShell launches on 2 endpoints.",
        points: 25,
        evidence: "Encoded PowerShell executions confirmed"
      },
      {
        title: "Pivot to network connections",
        description: "Check if suspicious process opened outbound C2 channels.",
        validator: (cmd) => /edrctl\s+query\s+netconn\s+--pid\s+\d+/i.test(cmd),
        expectedExample: "edrctl query netconn --pid 4820",
        hint: "Use net connection query filtered by suspicious PID.",
        successMessage: "Observed beacon traffic to 203.0.113.71:443 every 45s.",
        points: 25,
        evidence: "C2 beaconing behavior identified"
      },
      {
        title: "Isolate infected endpoint",
        description: "Contain host from network while keeping telemetry collection active.",
        validator: (cmd) => /edrctl\s+host\s+isolate\s+--hostname\s+\S+/i.test(cmd),
        expectedExample: "edrctl host isolate --hostname ws-fin-07",
        hint: "Use host isolation command against affected workstation.",
        successMessage: "Endpoint isolation enabled. Lateral movement path reduced.",
        points: 30,
        evidence: "Compromised endpoint isolated"
      },
      {
        title: "Terminate malicious process",
        description: "Kill active malicious process and validate no relaunch occurred.",
        validator: (cmd) => /edrctl\s+process\s+kill\s+--pid\s+\d+/i.test(cmd),
        expectedExample: "edrctl process kill --pid 4820",
        hint: "Terminate the active suspicious PID discovered earlier.",
        successMessage: "Malicious process terminated and auto-restart blocked.",
        points: 20,
        evidence: "Malicious process neutralized"
      },
      {
        title: "Deploy IOC block rule",
        description: "Push an EDR rule to block known hash and domain indicators.",
        validator: (cmd) => /edrctl\s+rule\s+apply\s+--name\s+"?block_ioc_powershell"?/i.test(cmd),
        expectedExample: "edrctl rule apply --name block_ioc_powershell",
        hint: "Apply a named IOC-blocking rule through EDR policy control.",
        successMessage: "Rule deployed across fleet. Future executions now blocked.",
        points: 30,
        evidence: "Fleet-wide prevention control deployed"
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
      output.push("- evidence: show collected hunting evidence");
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

    if (cmd.toLowerCase() === "evidence") {
      output.push("Threat hunting evidence:");
      if (evidence.length === 0) {
        output.push("- No evidence collected yet");
      } else {
        evidence.forEach((item, i) => output.push(`${i + 1}. ${item}`));
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
      const newEvidence = [...evidence, step.evidence];

      output.push(`PASS: ${step.successMessage}`);
      output.push(`Points: +${step.points}`);

      setScore(newScore);
      setEvidence(newEvidence);

      if (currentStep < steps.length - 1) {
        const next = steps[currentStep + 1];
        output.push("");
        output.push(`Next ${currentStep + 2}/${steps.length}: ${next.title}`);
        output.push(next.description);
        setCurrentStep(currentStep + 1);
      } else {
        output.push("");
        output.push("THREAT HUNT SUMMARY");
        output.push("-------------------");
        newEvidence.forEach((item, i) => output.push(`${i + 1}. ${item}`));
        output.push("");
        output.push("Follow-up actions:");
        output.push("1. Hunt same TTPs across servers and VDI");
        output.push("2. Add SIEM detections for encoded PowerShell ancestry");
        output.push("3. Review Office macro policy and endpoint restrictions");
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
          <span className="lab-icon">EDR</span>
          <div>
            <h1>Threat Hunting with EDR</h1>
            <p>Investigate suspicious endpoint behavior and contain active threats.</p>
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
            <div className="terminal-title">Threat Hunting Terminal</div>
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
                  <span className="terminal-prompt">hunter@soc:~$ </span>
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
            <h3>Hunting Workflow</h3>
            <ul>
              {steps.map((step, index) => (
                <li key={step.title} className={index < currentStep ? "completed" : index === currentStep ? "current" : ""}>
                  {step.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatHuntingEDRLab;
