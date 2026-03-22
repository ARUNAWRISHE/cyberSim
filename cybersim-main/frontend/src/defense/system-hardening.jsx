import React, { useState, useEffect } from 'react';

const SystemHardeningLab = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [labCompleted, setLabCompleted] = useState(false);
  const [_hints] = useState([]);

  const steps = [
    {
      title: "System Information Gathering",
      description: "First, let's gather information about our system to understand what needs to be hardened.",
      expectedCommand: "uname -a",
      hint: "Use 'uname -a' to display system information",
      successMessage: "Great! You've gathered system information. This helps identify the OS version and architecture.",
      points: 20
    },
    {
      title: "Check Running Services",
      description: "Identify all running services to see what might be unnecessary or vulnerable.",
      expectedCommand: "systemctl list-units --type=service --state=running",
      hint: "Use 'systemctl list-units --type=service --state=running' to see active services",
      successMessage: "Excellent! You can see all running services. Unnecessary services should be disabled.",
      points: 25
    },
    {
      title: "Update System Packages",
      description: "Keep the system updated with the latest security patches.",
      expectedCommand: "sudo apt update && sudo apt upgrade -y",
      hint: "Use 'sudo apt update && sudo apt upgrade -y' to update all packages",
      successMessage: "Perfect! System packages are now updated with latest security patches.",
      points: 30
    },
    {
      title: "Configure Firewall",
      description: "Enable and configure the firewall to control network traffic.",
      expectedCommand: "sudo ufw enable",
      hint: "Use 'sudo ufw enable' to activate the firewall",
      successMessage: "Great! Firewall is now active and protecting your system.",
      points: 25
    },
    {
      title: "Disable Unnecessary Services",
      description: "Disable services that are not needed to reduce attack surface.",
      expectedCommand: "sudo systemctl disable telnet",
      hint: "Use 'sudo systemctl disable telnet' to disable the insecure telnet service",
      successMessage: "Excellent! You've disabled an insecure service, reducing the attack surface.",
      points: 30
    },
    {
      title: "Set Strong Password Policy",
      description: "Configure password complexity requirements for better security.",
      expectedCommand: "sudo nano /etc/pam.d/common-password",
      hint: "Use 'sudo nano /etc/pam.d/common-password' to edit password policy",
      successMessage: "Perfect! Strong password policies help prevent brute force attacks.",
      points: 20
    }
  ];

  useEffect(() => {
    setTerminalOutput([
      "🔒 System Hardening Lab - Secure Your Linux System",
      "=================================================",
      "",
      "Welcome to the System Hardening Lab!",
      "In this lab, you'll learn essential techniques to secure a Linux system.",
      "",
      "Objective: Harden a Linux system by:",
      "• Gathering system information",
      "• Updating packages and patches", 
      "• Configuring firewall rules",
      "• Disabling unnecessary services",
      "• Setting strong password policies",
      "",
      `Step ${currentStep + 1}/${steps.length}: ${steps[currentStep].title}`,
      steps[currentStep].description,
      "",
      "Type your command below:"
    ]);
  }, [currentStep, steps]);

  const handleCommand = (command) => {
    const currentStepData = steps[currentStep];
    const newOutput = [...terminalOutput, `$ ${command}`];

    if (command.toLowerCase().trim() === currentStepData.expectedCommand.toLowerCase()) {
      newOutput.push("✅ " + currentStepData.successMessage);
      newOutput.push(`🎯 Points earned: ${currentStepData.points}`);
      
      const newScore = score + currentStepData.points;
      setScore(newScore);

      if (currentStep < steps.length - 1) {
        newOutput.push("");
        newOutput.push(`Step ${currentStep + 2}/${steps.length}: ${steps[currentStep + 1].title}`);
        newOutput.push(steps[currentStep + 1].description);
        newOutput.push("");
        setCurrentStep(currentStep + 1);
      } else {
        newOutput.push("");
        newOutput.push("🎉 Congratulations! System Hardening Lab Completed!");
        newOutput.push(`🏆 Final Score: ${newScore}/150 points`);
        newOutput.push("");
        newOutput.push("You have successfully hardened the Linux system by:");
        newOutput.push("✓ Gathering system information");
        newOutput.push("✓ Updating system packages");
        newOutput.push("✓ Configuring firewall protection");
        newOutput.push("✓ Disabling unnecessary services");
        newOutput.push("✓ Setting strong password policies");
        newOutput.push("");
        newOutput.push("🛡️ Your system is now more secure against common threats!");
        setLabCompleted(true);
      }
    } else if (command.toLowerCase().trim() === 'hint') {
      newOutput.push("💡 Hint: " + currentStepData.hint);
    } else if (command.toLowerCase().trim() === 'help') {
      newOutput.push("Available commands:");
      newOutput.push("• hint - Get a hint for the current step");
      newOutput.push("• help - Show this help message");
      newOutput.push("• clear - Clear the terminal");
    } else if (command.toLowerCase().trim() === 'clear') {
      setTerminalOutput([]);
      return;
    } else {
      newOutput.push("❌ Incorrect command. Type 'hint' for help or 'help' for available commands.");
    }

    setTerminalOutput(newOutput);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleCommand(userInput.trim());
      setUserInput('');
    }
  };

  return (
    <div className="lab-container">
      <div className="lab-header">
        <div className="lab-title">
          <span className="lab-icon">🔒</span>
          <div>
            <h1>System Hardening Lab</h1>
            <p>Learn essential Linux system hardening techniques</p>
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
            <div className="terminal-title">🔒 System Hardening Terminal</div>
            <div className="terminal-status">
              Step {currentStep + 1}/{steps.length} | 
              {labCompleted ? ' ✅ Completed' : ' 🔄 In Progress'}
            </div>
          </div>
          
          <div className="terminal-body">
            <div className="terminal-output">
              {terminalOutput.map((line, index) => (
                <div key={index} className="terminal-line">
                  {line}
                </div>
              ))}
            </div>
            
            {!labCompleted && (
              <form onSubmit={handleSubmit} className="terminal-input-form">
                <div className="terminal-input-line">
                  <span className="terminal-prompt">defender@hardening:~$ </span>
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
            <h3>🎯 Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep + (labCompleted ? 1 : 0)) / steps.length) * 100}%` }}
              ></div>
            </div>
            <p>{currentStep + (labCompleted ? 1 : 0)}/{steps.length} steps completed</p>
          </div>

          <div className="lab-objectives">
            <h3>🛡️ Hardening Checklist</h3>
            <ul>
              {steps.map((step, index) => (
                <li key={index} className={index < currentStep ? 'completed' : index === currentStep ? 'current' : ''}>
                  {step.title}
                  {index < currentStep && <span className="checkmark">✅</span>}
                  {index === currentStep && <span className="current-marker">👈</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="lab-tips">
            <h3>💡 Security Tips</h3>
            <ul>
              <li>Always keep systems updated with latest patches</li>
              <li>Disable unnecessary services to reduce attack surface</li>
              <li>Use strong firewall rules to control network access</li>
              <li>Implement strong password policies</li>
              <li>Regular security audits are essential</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHardeningLab;