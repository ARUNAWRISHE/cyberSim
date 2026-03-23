import React, { useMemo, useState } from "react";

const IAMHardeningLab = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([
    "Identity and Access Hardening Lab",
    "===============================",
    "Scenario: Privileged account misuse and risky IAM policies were detected.",
    "Goal: Audit access, enforce least privilege, and harden identity controls.",
    "",
    "Type 'help' for utility commands."
  ]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [labCompleted, setLabCompleted] = useState(false);
  const [controls, setControls] = useState([]);

  const steps = useMemo(
    () => [
      {
        title: "List privileged accounts",
        description: "Identify all users with admin-level role assignments.",
        validator: (cmd) => /iamctl\s+users\s+list\s+--role\s+admin/i.test(cmd),
        expectedExample: "iamctl users list --role admin",
        hint: "Start by enumerating admin role holders.",
        successMessage: "Discovered 6 admin accounts, including 2 stale service users.",
        points: 20,
        control: "Admin account inventory completed"
      },
      {
        title: "Review risky policies",
        description: "Find policies containing wildcard actions and resources.",
        validator: (cmd) => /iamctl\s+policy\s+find\s+--query\s+"?\*:\*"?/i.test(cmd),
        expectedExample: "iamctl policy find --query \"*:*\"",
        hint: "Search for full wildcard permissions.",
        successMessage: "Found overly permissive policy: FullAccess-TempOps.",
        points: 25,
        control: "Over-permissive policy identified"
      },
      {
        title: "Disable stale admin credentials",
        description: "Disable inactive high-privilege accounts immediately.",
        validator: (cmd) => /iamctl\s+user\s+disable\s+--id\s+\S+/i.test(cmd),
        expectedExample: "iamctl user disable --id svc-admin-old",
        hint: "Disable one stale privileged account by id.",
        successMessage: "Stale admin credential disabled successfully.",
        points: 20,
        control: "Stale privileged account disabled"
      },
      {
        title: "Enforce MFA for admins",
        description: "Require multi-factor authentication for all privileged users.",
        validator: (cmd) => /iamctl\s+mfa\s+enforce\s+--group\s+admins/i.test(cmd),
        expectedExample: "iamctl mfa enforce --group admins",
        hint: "Apply mandatory MFA policy to admins group.",
        successMessage: "MFA enforced for all admin accounts.",
        points: 25,
        control: "MFA policy enforced for admins"
      },
      {
        title: "Apply least privilege policy",
        description: "Replace broad policy with scoped role permissions.",
        validator: (cmd) => /iamctl\s+policy\s+attach\s+--role\s+ops\s+--policy\s+OpsLeastPrivilege/i.test(cmd),
        expectedExample: "iamctl policy attach --role ops --policy OpsLeastPrivilege",
        hint: "Attach scoped least-privilege policy to ops role.",
        successMessage: "Least-privilege policy attached to operations role.",
        points: 30,
        control: "Least-privilege controls applied"
      },
      {
        title: "Rotate privileged API keys",
        description: "Rotate keys for sensitive service principals after hardening.",
        validator: (cmd) => /iamctl\s+keys\s+rotate\s+--scope\s+privileged/i.test(cmd),
        expectedExample: "iamctl keys rotate --scope privileged",
        hint: "Run key rotation for privileged scope.",
        successMessage: "Privileged API keys rotated and old keys revoked.",
        points: 30,
        control: "Privileged secrets rotated"
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
      output.push("- controls: show applied IAM controls");
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

    if (cmd.toLowerCase() === "controls") {
      output.push("Applied IAM controls:");
      if (controls.length === 0) {
        output.push("- No controls applied yet");
      } else {
        controls.forEach((item, i) => output.push(`${i + 1}. ${item}`));
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
      const newControls = [...controls, step.control];

      output.push(`PASS: ${step.successMessage}`);
      output.push(`Points: +${step.points}`);

      setScore(newScore);
      setControls(newControls);

      if (currentStep < steps.length - 1) {
        const next = steps[currentStep + 1];
        output.push("");
        output.push(`Next ${currentStep + 2}/${steps.length}: ${next.title}`);
        output.push(next.description);
        setCurrentStep(currentStep + 1);
      } else {
        output.push("");
        output.push("IAM HARDENING SUMMARY");
        output.push("---------------------");
        newControls.forEach((item, i) => output.push(`${i + 1}. ${item}`));
        output.push("");
        output.push("Follow-up actions:");
        output.push("1. Add quarterly access recertification");
        output.push("2. Alert on privilege escalation changes");
        output.push("3. Enforce short-lived credentials for automation");
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
          <span className="lab-icon">IAM</span>
          <div>
            <h1>Identity and Access Hardening</h1>
            <p>Audit roles, reduce privilege exposure, and harden account security.</p>
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
            <div className="terminal-title">IAM Hardening Terminal</div>
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
                  <span className="terminal-prompt">identity@defense:~$ </span>
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
            <h3>Hardening Workflow</h3>
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

export default IAMHardeningLab;
