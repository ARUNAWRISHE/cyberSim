import mongoose from "mongoose";
import dotenv from "dotenv";
import Article from "./models/Article.js";

dotenv.config();

const articles = [
  {
    title: "Introduction to SQL Injection",
    slug: "intro-sql-injection",
    category: "attack",
    difficulty: "beginner",
    description: "Learn the basics of SQL injection attacks and how they work",
    content: `# Introduction to SQL Injection

SQL injection is one of the most common web application vulnerabilities. It occurs when user input is not properly sanitized before being used in SQL queries.

## How SQL Injection Works

When a web application takes user input and directly concatenates it into a SQL query without proper validation, attackers can inject malicious SQL code.

## Example Vulnerable Code

\`\`\`sql
SELECT * FROM users WHERE username = '\${userInput}' AND password = '\${password}'
\`\`\`

## Common Payloads

- \`' OR '1'='1\` - Always true condition
- \`'; DROP TABLE users; --\` - Destructive payload
- \`' UNION SELECT * FROM sensitive_table --\` - Data extraction

## Prevention

1. Use parameterized queries
2. Input validation and sanitization
3. Principle of least privilege
4. Regular security testing

## Practice Lab

Ready to try SQL injection yourself? [Start the SQL Injection Lab](/attack/sql-injection) to practice in a safe environment.`,
    tags: ["sql", "injection", "web-security", "owasp"],
    readTime: 8,
    author: "CyberSim Team",
    practiceLink: "/attack/sql-injection"
  },
  {
    title: "Cross-Site Scripting (XSS) Fundamentals",
    slug: "xss-fundamentals",
    category: "attack",
    difficulty: "beginner",
    description: "Understanding XSS vulnerabilities and exploitation techniques",
    content: `# Cross-Site Scripting (XSS) Fundamentals

Cross-Site Scripting (XSS) is a client-side code injection attack where malicious scripts are injected into trusted websites.

## Types of XSS

### Reflected XSS
User input is immediately reflected back in the response without proper sanitization.

### Stored XSS
Malicious scripts are permanently stored on the target server and served to users.

### DOM-based XSS
The vulnerability exists in client-side code rather than server-side code.

## Common XSS Payloads

\`\`\`javascript
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
\`\`\`

## Impact

- Session hijacking
- Credential theft
- Defacement
- Malware distribution

## Prevention

1. Input validation and output encoding
2. Content Security Policy (CSP)
3. HTTPOnly cookies
4. Regular security testing

## Practice Lab

Test your XSS skills in our [XSS Practice Lab](/attack/xss) with realistic scenarios.`,
    tags: ["xss", "javascript", "web-security", "client-side"],
    readTime: 10,
    author: "CyberSim Team",
    practiceLink: "/attack/xss"
  },
  {
    title: "Command Injection Attacks",
    slug: "command-injection-attacks",
    category: "attack",
    difficulty: "intermediate",
    description: "Learn how to exploit command injection vulnerabilities",
    content: `# Command Injection Attacks

Command injection occurs when user input is passed to system commands without proper sanitization, allowing attackers to execute arbitrary commands.

## How Command Injection Works

Applications that execute system commands based on user input are vulnerable if input isn't properly validated.

## Common Injection Points

- File upload functionality
- System administration interfaces
- Network diagnostic tools
- Image processing applications

## Command Separators

\`\`\`bash
; - Execute commands sequentially
&& - Execute if previous command succeeds
|| - Execute if previous command fails
| - Pipe output to next command
\`\`\`

## Example Payloads

\`\`\`bash
127.0.0.1; cat /etc/passwd
127.0.0.1 && whoami
127.0.0.1 | ls -la
\`\`\`

## Prevention

1. Input validation and sanitization
2. Use safe APIs instead of system commands
3. Principle of least privilege
4. Sandboxing and containerization

## Practice Lab

Practice command injection techniques in our [Command Injection Lab](/attack/command-injection).`,
    tags: ["command-injection", "system-commands", "linux", "exploitation"],
    readTime: 12,
    author: "CyberSim Team",
    practiceLink: "/attack/command-injection"
  },
  {
    title: "Directory Traversal Vulnerabilities",
    slug: "directory-traversal-vulnerabilities",
    category: "attack",
    difficulty: "intermediate",
    description: "Exploiting path traversal to access unauthorized files",
    content: `# Directory Traversal Vulnerabilities

Directory traversal (path traversal) allows attackers to access files outside the intended directory by manipulating file paths.

## How Directory Traversal Works

Applications that use user input to construct file paths without proper validation are vulnerable to path manipulation.

## Common Traversal Sequences

\`\`\`
../ - Standard Unix traversal
..\\ - Windows traversal
%2e%2e%2f - URL encoded traversal
....// - Double encoding bypass
\`\`\`

## Target Files

Common files attackers target:
- \`/etc/passwd\` - Unix user accounts
- \`/etc/shadow\` - Password hashes
- \`../config.php\` - Configuration files
- \`../../../flag.txt\` - Challenge flags

## Example Payloads

\`\`\`
../../../etc/passwd
..\\..\\..\\windows\\system32\\drivers\\etc\\hosts
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
\`\`\`

## Prevention

1. Input validation and sanitization
2. Use whitelists for allowed files
3. Implement proper access controls
4. Use secure file APIs

## Practice Lab

Learn directory traversal techniques in our [Directory Traversal Lab](/attack/directory-traversal).`,
    tags: ["directory-traversal", "path-traversal", "file-access", "web-security"],
    readTime: 9,
    author: "CyberSim Team",
    practiceLink: "/attack/directory-traversal"
  },
  {
    title: "Penetration Testing Methodology",
    slug: "penetration-testing-methodology",
    category: "attack",
    difficulty: "advanced",
    description: "Systematic approach to ethical hacking and penetration testing",
    content: `# Penetration Testing Methodology

A structured approach to identifying and exploiting security vulnerabilities through ethical hacking.

## Phases of Penetration Testing

### 1. Planning and Reconnaissance
- Define scope and objectives
- Gather intelligence about target
- Identify potential attack vectors

### 2. Scanning and Enumeration
- Network discovery
- Port scanning
- Service enumeration
- Vulnerability identification

### 3. Gaining Access
- Exploit vulnerabilities
- Escalate privileges
- Maintain persistence

### 4. Post-Exploitation
- Data collection
- Lateral movement
- Evidence gathering

### 5. Reporting
- Document findings
- Provide remediation steps
- Risk assessment

## Common Tools

- **Nmap** - Network scanning
- **Metasploit** - Exploitation framework
- **Burp Suite** - Web application testing
- **Wireshark** - Network analysis
- **John the Ripper** - Password cracking

## Best Practices

1. Always get proper authorization
2. Follow a systematic methodology
3. Document everything
4. Minimize impact on systems
5. Provide clear remediation guidance

## Practice Lab

Experience the full penetration testing process in our [Penetration Testing Lab](/attack/pentest).`,
    tags: ["pentest", "methodology", "ethical-hacking", "tools"],
    readTime: 15,
    author: "CyberSim Team",
    practiceLink: "/attack/pentest"
  },
  {
    title: "System Hardening Fundamentals",
    slug: "system-hardening-fundamentals",
    category: "defense",
    difficulty: "beginner",
    description: "Essential steps to secure and harden your systems",
    content: `# System Hardening Fundamentals

System hardening is the process of securing a system by reducing its attack surface and eliminating potential vulnerabilities.

## Key Hardening Steps

### 1. Update Management
- Keep operating system updated
- Apply security patches promptly
- Use automated update tools

### 2. Access Control
- Disable unnecessary user accounts
- Implement strong password policies
- Use multi-factor authentication

### 3. Network Security
- Configure firewalls properly
- Disable unused network services
- Use network segmentation

### 4. File System Security
- Set proper file permissions
- Remove unnecessary software
- Encrypt sensitive data

## Hardening Checklist

- [ ] Enable firewall
- [ ] Update system packages
- [ ] Disable root SSH login
- [ ] Configure proper file permissions
- [ ] Remove default accounts
- [ ] Install security monitoring tools

## Tools and Techniques

- **CIS Benchmarks** - Security configuration guidelines
- **STIG** - Security Technical Implementation Guides
- **Lynis** - Security auditing tool
- **OpenSCAP** - Security compliance scanning

## Practice Lab

Apply system hardening techniques in our [Network Security Lab](/defense/network-security).`,
    tags: ["hardening", "security", "linux", "defense"],
    readTime: 10,
    author: "CyberSim Team",
    practiceLink: "/defense/network-security"
  },
  {
    title: "Incident Response Planning",
    slug: "incident-response-planning",
    category: "defense",
    difficulty: "intermediate",
    description: "How to prepare for and respond to security incidents",
    content: `# Incident Response Planning

Effective incident response minimizes damage and reduces recovery time and costs when security incidents occur.

## Incident Response Lifecycle

### 1. Preparation
- Develop incident response plan
- Train response team
- Establish communication procedures
- Prepare tools and resources

### 2. Identification
- Monitor for security events
- Analyze alerts and logs
- Determine if incident occurred
- Document initial findings

### 3. Containment
- Short-term containment
- System backup and imaging
- Long-term containment
- Evidence preservation

### 4. Eradication
- Remove malware
- Patch vulnerabilities
- Update security controls
- Strengthen defenses

### 5. Recovery
- Restore systems
- Monitor for anomalies
- Validate system integrity
- Return to normal operations

### 6. Lessons Learned
- Document incident details
- Analyze response effectiveness
- Update procedures
- Provide training updates

## Key Success Factors

- Clear roles and responsibilities
- Regular training and exercises
- Effective communication
- Proper documentation

## Tools and Resources

- **SIEM** - Security Information and Event Management
- **Forensic tools** - Evidence collection and analysis
- **Communication platforms** - Team coordination
- **Playbooks** - Standardized response procedures

## Practice Lab

Experience incident response procedures in our [Incident Response Lab](/defense/incident-response).`,
    tags: ["incident-response", "security", "planning", "forensics"],
    readTime: 11,
    author: "CyberSim Team",
    practiceLink: "/defense/incident-response"
  },
  {
    title: "Network Security Monitoring",
    slug: "network-security-monitoring",
    category: "defense",
    difficulty: "intermediate",
    description: "Implementing comprehensive network security monitoring",
    content: `# Network Security Monitoring

Network security monitoring involves continuous observation of network traffic and systems to detect and respond to security threats.

## Core Components

### 1. Network Visibility
- Traffic analysis and monitoring
- Asset discovery and inventory
- Network mapping and topology

### 2. Threat Detection
- Intrusion Detection Systems (IDS)
- Intrusion Prevention Systems (IPS)
- Behavioral analysis and anomaly detection

### 3. Log Management
- Centralized log collection
- Log analysis and correlation
- Long-term log retention

### 4. Incident Response
- Alert triage and investigation
- Threat hunting and analysis
- Response coordination and communication

## Monitoring Tools

- **Snort** - Open source IDS/IPS
- **Suricata** - High performance network IDS
- **Wireshark** - Network protocol analyzer
- **Nagios** - Network monitoring system
- **ELK Stack** - Log analysis platform

## Best Practices

1. Implement defense in depth
2. Monitor both north-south and east-west traffic
3. Use threat intelligence feeds
4. Regularly update detection rules
5. Conduct regular security assessments

## Key Metrics

- Mean Time to Detection (MTTD)
- Mean Time to Response (MTTR)
- False positive rate
- Coverage percentage

## Practice Lab

Configure network security monitoring in our [Network Security Lab](/defense/network-security).`,
    tags: ["network-security", "monitoring", "ids", "siem"],
    readTime: 13,
    author: "CyberSim Team",
    practiceLink: "/defense/network-security"
  },
  {
    title: "Cloud Security Best Practices",
    slug: "cloud-security-best-practices",
    category: "defense",
    difficulty: "intermediate",
    description: "Essential security practices for cloud environments",
    content: `# Cloud Security Best Practices

Cloud security requires a shared responsibility model between cloud providers and customers, with specific practices for different service models.

## Identity and Access Management (IAM)

### Principle of Least Privilege
- Grant minimum necessary permissions
- Use role-based access control
- Regular access reviews and audits

### Multi-Factor Authentication
- Enable MFA for all accounts
- Use hardware tokens when possible
- Monitor authentication logs

## Data Protection

### Encryption
- Encrypt data at rest using strong algorithms
- Encrypt data in transit with TLS
- Manage encryption keys properly

### Backup and Recovery
- Regular automated backups
- Test recovery procedures regularly
- Geographic distribution of backups

## Network Security

### Virtual Private Clouds (VPC)
- Use private subnets for sensitive resources
- Configure security groups properly
- Implement network ACLs

### Monitoring and Logging
- Enable CloudTrail/audit logs
- Set up security alerts and notifications
- Use SIEM solutions for log analysis

## Compliance and Governance

- Understand shared responsibility model
- Implement security frameworks (CIS, NIST)
- Regular security assessments and audits
- Maintain compliance documentation

## Common Cloud Threats

- Misconfigured storage buckets
- Weak identity and access management
- Insecure APIs and interfaces
- Data breaches and loss

## Security Tools

- **AWS Security Hub** - Centralized security findings
- **Azure Security Center** - Cloud security posture management
- **Google Cloud Security Command Center** - Security insights
- **CloudFormation/Terraform** - Infrastructure as code`,
    tags: ["cloud", "aws", "azure", "security", "iam"],
    readTime: 12,
    author: "CyberSim Team",
    practiceLink: "/defense/network-security"
  },
  {
    title: "SOC Log Monitoring and SIEM Triage",
    slug: "soc-log-monitoring-siem-triage",
    category: "defense",
    difficulty: "intermediate",
    description: "Practical SOC workflow for triaging suspicious login and beaconing alerts",
    content: `# SOC Log Monitoring and SIEM Triage

SOC monitoring is effective when analysts can move quickly from alert validation to safe containment.

## Core Triage Workflow

### 1. Alert Validation
- Verify source reliability and timestamp alignment
- Confirm whether detections map to known attack patterns
- Correlate with recent user activity and service changes

### 2. Scope Determination
- Identify affected users, hosts, and services
- Distinguish isolated noise from coordinated behavior
- Track whether indicators appear in multiple data sources

### 3. Network Verification
- Confirm suspicious traffic patterns using packet capture
- Validate destination reputation and protocol usage
- Record IOC evidence for follow-up hunting

### 4. Containment
- Block known malicious sources at host or edge firewall
- Preserve logs and timeline evidence before broad remediation
- Update IDS/SIEM signatures to prevent repeat blind spots

## Detection Use Cases

- Brute-force authentication campaigns
- Command and control beaconing
- Suspicious outbound data flows
- Privileged account misuse

## Best Practices

1. Use repeatable triage playbooks
2. Capture evidence before major system changes
3. Prioritize containment actions with lowest business impact
4. Feed findings back into detection engineering

## Practice Lab

Apply this workflow in the [SOC Monitoring Lab](/defense/log-monitoring-siem).`,
    tags: ["soc", "siem", "log-analysis", "detection", "incident-response"],
    readTime: 13,
    author: "CyberSim Team",
    practiceLink: "/defense/log-monitoring-siem"
  },
  {
    title: "Ransomware Containment and Recovery",
    slug: "ransomware-containment-recovery",
    category: "defense",
    difficulty: "advanced",
    description: "Structured response strategy to contain ransomware and recover safely",
    content: `# Ransomware Containment and Recovery

Ransomware response must prioritize immediate containment, evidence preservation, and business recovery.

## Incident Priorities

### 1. Immediate Containment
- Isolate infected hosts from network segments
- Stop active encryption processes
- Disable high-risk lateral movement channels (SMB/RDP)

### 2. Evidence Preservation
- Capture process and network telemetry
- Preserve ransom note artifacts and IOC hashes
- Maintain chain-of-custody for forensic integrity

### 3. Recovery Planning
- Validate immutable backup health
- Restore critical services in staged order
- Verify restored data integrity before production cutover

### 4. Post-Incident Hardening
- Rotate privileged credentials and secrets
- Patch initial access vector and persistence path
- Increase monitoring for reinfection signals

## Common Response Mistakes

- Restoring from backups before root-cause containment
- Wiping hosts too early and losing forensic evidence
- Re-enabling file shares without strengthened controls

## Readiness Controls

1. Offline and immutable backups
2. Segmented privileged access
3. Endpoint detection and response coverage
4. Tested ransomware response playbooks

## Practice Lab

Practice this workflow in the [Ransomware Recovery Lab](/defense/ransomware-containment).`,
    tags: ["ransomware", "containment", "recovery", "forensics", "backup"],
    readTime: 15,
    author: "CyberSim Team",
    practiceLink: "/defense/ransomware-containment"
  },
  {
    title: "Web Application Security Testing",
    slug: "web-application-security-testing",
    category: "attack",
    difficulty: "intermediate",
    description: "Comprehensive guide to testing web application security",
    content: `# Web Application Security Testing

Web application security testing involves identifying vulnerabilities in web applications through various testing methodologies and tools.

## Testing Methodology

### 1. Information Gathering
- Application fingerprinting
- Technology stack identification
- Entry point enumeration
- Error handling analysis

### 2. Authentication Testing
- Username enumeration
- Weak password policies
- Session management flaws
- Multi-factor authentication bypass

### 3. Authorization Testing
- Privilege escalation
- Directory traversal
- File inclusion vulnerabilities
- Access control bypass

### 4. Input Validation Testing
- SQL injection
- Cross-site scripting (XSS)
- Command injection
- LDAP injection

### 5. Business Logic Testing
- Workflow bypass
- Race conditions
- Time-based attacks
- Logic flaws

## OWASP Top 10

1. **Injection** - SQL, NoSQL, OS command injection
2. **Broken Authentication** - Session management flaws
3. **Sensitive Data Exposure** - Inadequate protection
4. **XML External Entities (XXE)** - XML processing vulnerabilities
5. **Broken Access Control** - Authorization failures
6. **Security Misconfiguration** - Default configurations
7. **Cross-Site Scripting (XSS)** - Client-side injection
8. **Insecure Deserialization** - Object injection
9. **Using Components with Known Vulnerabilities** - Outdated libraries
10. **Insufficient Logging & Monitoring** - Detection failures

## Testing Tools

- **Burp Suite** - Web application security testing
- **OWASP ZAP** - Open source security scanner
- **SQLMap** - SQL injection testing
- **Nikto** - Web server scanner
- **Nessus** - Vulnerability scanner

## Best Practices

1. Test throughout development lifecycle
2. Use both automated and manual testing
3. Follow a systematic methodology
4. Document all findings thoroughly
5. Provide clear remediation guidance`,
    tags: ["web-security", "testing", "owasp", "vulnerabilities"],
    readTime: 14,
    author: "CyberSim Team",
    practiceLink: "/attack/pentest"
  }
];

const seedArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing articles
    await Article.deleteMany({});
    console.log("Cleared existing articles");

    // Insert new articles
    await Article.insertMany(articles);
    console.log(`Seeded ${articles.length} articles`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding articles:", error);
    process.exit(1);
  }
};

seedArticles();