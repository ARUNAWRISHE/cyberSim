import Lab from "../models/Lab.js";
import Log from "../models/Log.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import Achievement from "../models/Achievement.js";

export const getLabs = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const labs = await Lab.find(query).select("-flag -hints");
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLabBySlug = async (req, res) => {
  try {
    const lab = await Lab.findOne({ slug: req.params.slug }).select("-flag");
    if (!lab) return res.status(404).json({ message: "Lab not found" });
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLabProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).populate("labId");
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startLab = async (req, res) => {
  try {
    const { labId } = req.body;
    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    let progress = await Progress.findOne({ userId: req.user._id, labId });
    
    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        labId,
        status: "in-progress",
        startedAt: new Date()
      });
    } else if (progress.status === "completed") {
      // Allow reopening a completed lab without resetting earned score.
      return res.json(progress);
    } else {
      progress.status = "in-progress";
      progress.startedAt = new Date();
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const simulateSQLInjection = (username, password) => {
  const users = [
    { id: 1, username: "admin", password: "admin123", role: "admin", data: "CONFIDENTIAL_ADMIN_DATA" },
    { id: 2, username: "john_doe", password: "password123", role: "user", data: "User Profile Data" },
    { id: 3, username: "jane_smith", password: "securePass456", role: "user", data: "Private Messages" }
  ];

  const lowerInput = username.toLowerCase();
  const lowerPass = password.toLowerCase();

  const vulnerableQuery = users.filter(u => {
    const unameMatch = u.username.toLowerCase() === lowerInput;
    const passMatch = u.password.toLowerCase() === lowerPass;
    return unameMatch && passMatch;
  });

  if (vulnerableQuery.length > 0) {
    return { success: true, user: vulnerableQuery[0] };
  }

  const sqlInjectionPayloads = [
    { payload: "' or '1'='1", bypass: true },
    { payload: "admin' OR '1'='1", bypass: true },
    { payload: "' OR 1=1--", bypass: true },
    { payload: "admin'--", bypass: true },
    { payload: "' OR 'a'='a", bypass: true },
    { payload: "' OR 1=1#", bypass: true }
  ];

  for (const p of sqlInjectionPayloads) {
    if (lowerInput.includes(p.payload.toLowerCase()) || 
        lowerInput.replace(/\s+/g, '').includes(p.payload.replace(/\s+/g, '').toLowerCase())) {
      return { 
        success: true, 
        user: users[0],
        sqlInjected: true,
        payload: p.payload,
        warning: "Authentication bypassed - vulnerable query detected!"
      };
    }
  }

  return { success: false, message: "Invalid credentials" };
};

export const executeLab = async (req, res) => {
  try {
    const { labId, input, action } = req.body;
    const lab = await Lab.findById(labId);
    
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    let result = { success: false, output: "" };

    switch (lab.slug) {
      case "sql-injection":
        result = simulateSQLInjection(input.username, input.password);
        break;
      case "xss-reflection":
        result = {
          success: input.includes("<script>") || input.includes("javascript:"),
          output: `<div>${input}</div>`,
          reflected: input
        };
        if (result.success) {
          result.warning = "XSS payload executed - script tag detected!";
        }
        break;
      case "command-injection":
        const cmdPayloads = [";ls", "|cat", "&whoami&", "`id`", "$(whoami)"];
        const isInjection = cmdPayloads.some(p => input.includes(p));
        result = {
          success: isInjection,
          output: isInjection ? `root\nuser\netc\npasswd\nshadow` : `Output: ${input}`,
          executed: isInjection ? input : null
        };
        break;
      case "directory-traversal":
        const traversalPayloads = ["../", "..\\", "%2e%2e%2f", "....//....//"];
        const isTraversal = traversalPayloads.some(p => input.toLowerCase().includes(p.toLowerCase()));
        result = {
          success: isTraversal,
          output: isTraversal ? `/etc/passwd content:\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin` : `File: ${input}`,
          accessed: isTraversal ? "/etc/passwd" : null
        };
        break;
      default:
        result = { success: false, output: "Lab type not implemented" };
    }

    await Log.create({
      userId: req.user._id,
      labId,
      action,
      input: JSON.stringify(input),
      output: JSON.stringify(result),
      success: result.success
    });

    const progress = await Progress.findOne({ userId: req.user._id, labId });
    if (progress) {
      progress.attempts += 1;
      progress.lastAttempt = new Date();
      await progress.save();
    }

    if (result.success) {
      const flagMatch = input.includes("' OR") || input.includes("1=1") || 
                        input.includes("script") || input.includes("../") ||
                        cmdPayloads.some(p => input.includes(p));
      
      if (flagMatch) {
        return res.json({
          ...result,
          flag: lab.flag,
          labCompleted: true,
          points: lab.points
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitFlag = async (req, res) => {
  try {
    const { labId, flag } = req.body;
    const lab = await Lab.findById(labId);
    
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    const progress = await Progress.findOne({ userId: req.user._id, labId });
    
    if (!progress) {
      return res.status(400).json({ message: "Lab not started" });
    }

    if (progress.status === "completed") {
      return res.status(400).json({ message: "Lab already completed" });
    }

    const isCorrect = flag.trim() === lab.flag.trim();

    await Log.create({
      userId: req.user._id,
      labId,
      action: "submit",
      input: flag,
      output: isCorrect ? "Flag accepted!" : "Incorrect flag",
      success: isCorrect
    });

    if (isCorrect) {
      const hintPenalty = progress.hintsUsed * 10;
      const finalScore = Math.max(0, lab.points - hintPenalty);

      progress.status = "completed";
      progress.score = finalScore;
      progress.completedAt = new Date();
      await progress.save();

      const user = await User.findById(req.user._id);
      user.points += finalScore;
      await user.save();

      const achievements = await checkAchievements(req.user._id, lab, progress);
      if (achievements.length > 0) {
        for (const ach of achievements) {
          user.points += ach.points;
        }
        await user.save();
      }

      return res.json({
        success: true,
        score: finalScore,
        totalPoints: user.points,
        newAchievements: achievements,
        message: "Lab completed successfully!"
      });
    }

    res.json({ success: false, message: "Incorrect flag" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkAchievements = async (userId, lab, progress) => {
  const newAchievements = [];
  const user = await User.findById(userId);
  const existingBadges = user.achievements.map(a => a.toString());

  if (lab.category === "attack" && !existingBadges.includes("first-hack")) {
    newAchievements.push(await Achievement.create({
      userId,
      badge: "first-hack",
      name: "First Hack",
      description: "Completed your first attack lab",
      icon: "💀",
      points: 50
    }));
  }

  if (lab.category === "defense" && !existingBadges.includes("defender")) {
    newAchievements.push(await Achievement.create({
      userId,
      badge: "defender",
      name: "Defender",
      description: "Completed your first defense lab",
      icon: "🛡️",
      points: 50
    }));
  }

  if (lab.slug === "sql-injection" && !existingBadges.includes("sql-master")) {
    newAchievements.push(await Achievement.create({
      userId,
      badge: "sql-master",
      name: "SQL Master",
      description: "Bypassed SQL authentication",
      icon: "🏆",
      points: 100
    }));
  }

  if (progress.streak >= 7 && !existingBadges.includes("week-warrior")) {
    newAchievements.push(await Achievement.create({
      userId,
      badge: "week-warrior",
      name: "Week Warrior",
      description: "7 day training streak",
      icon: "🔥",
      points: 150
    }));
  }

  if (newAchievements.length > 0) {
    user.achievements.push(...newAchievements.map(a => a._id));
  }

  return newAchievements;
};

export const getHint = async (req, res) => {
  try {
    const { labId } = req.body;
    const lab = await Lab.findById(labId);
    
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    const progress = await Progress.findOne({ userId: req.user._id, labId });
    if (!progress) {
      return res.status(400).json({ message: "Lab not started" });
    }

    const hintIndex = Math.min(progress.hintsUsed, lab.hints.length - 1);
    const hint = lab.hints[hintIndex];

    progress.hintsUsed += 1;
    await progress.save();

    await Log.create({
      userId: req.user._id,
      labId,
      action: "hint",
      input: `Hint ${hintIndex + 1}`,
      output: hint,
      success: false
    });

    res.json({ hint, hintsRemaining: lab.hints.length - progress.hintsUsed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLabLogs = async (req, res) => {
  try {
    const { labId } = req.params;
    const logs = await Log.find({ userId: req.user._id, labId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedLabs = async (req, res) => {
  try {
    const labs = [
      {
        title: "SQL Injection",
        slug: "sql-injection",
        category: "attack",
        type: "Authentication Bypass",
        difficulty: "beginner",
        description: "Exploit a vulnerable login form using SQL injection techniques to bypass authentication.",
        instructions: [
          { step: 1, text: "Analyze the login form for SQL injection vulnerabilities" },
          { step: 2, text: "Enter a SQL injection payload in the username field" },
          { step: 3, text: "Submit the form to bypass authentication" },
          { step: 4, text: "Capture the flag upon successful injection" }
        ],
        flag: "flag{sql_injection_master_2024}",
        points: 100,
        hints: [
          "Try using OR 1=1 to make the query return all rows",
          "The admin username might be 'admin'",
          "Try: admin' OR '1'='1"
        ]
      },
      {
        title: "XSS Reflection",
        slug: "xss-reflection",
        category: "attack",
        type: "Cross-Site Scripting",
        difficulty: "beginner",
        description: "Inject malicious JavaScript through an unvalidated input field.",
        instructions: [
          { step: 1, text: "Find an input field that reflects user input" },
          { step: 2, text: "Craft an XSS payload" },
          { step: 3, text: "Submit the payload to execute JavaScript" },
          { step: 4, text: "Capture the flag" }
        ],
        flag: "flag{xss_stored_p0wn}",
        points: 100,
        hints: [
          "Script tags can execute JavaScript",
          "Try: <script>alert('XSS')</script>"
        ]
      },
      {
        title: "Command Injection",
        slug: "command-injection",
        category: "attack",
        type: "OS Command Injection",
        difficulty: "intermediate",
        description: "Exploit a system that passes user input to shell commands.",
        instructions: [
          { step: 1, text: "Find an input that might be passed to system commands" },
          { step: 2, text: "Use command separators like ; or |" },
          { step: 3, text: "Inject additional commands" },
          { step: 4, text: "Capture the flag" }
        ],
        flag: "flag{command_inject0r}",
        points: 150,
        hints: [
          "Command separators: ; | & &&",
          "Try: ; ls or | cat /etc/passwd"
        ]
      },
      {
        title: "Directory Traversal",
        slug: "directory-traversal",
        category: "attack",
        type: "Path Traversal",
        difficulty: "intermediate",
        description: "Access sensitive files outside the web root using path traversal.",
        instructions: [
          { step: 1, text: "Identify the file parameter" },
          { step: 2, text: "Use ../ to navigate directories" },
          { step: 3, text: "Access /etc/passwd or other sensitive files" },
          { step: 4, text: "Capture the flag" }
        ],
        flag: "flag{path_traversal_awareness}",
        points: 150,
        hints: [
          "Try: ../../../etc/passwd",
          "URL encode ../ as %2e%2e%2f"
        ]
      },
      {
        title: "Secure SQL",
        slug: "secure-sql",
        category: "defense",
        type: "SQL Injection Prevention",
        difficulty: "beginner",
        description: "Fix the vulnerable code to prevent SQL injection attacks using prepared statements.",
        instructions: [
          { step: 1, text: "Review the vulnerable query" },
          { step: 2, text: "Implement parameterized queries" },
          { step: 3, text: "Test with SQL injection payloads" },
          { step: 4, text: "Verify the fix blocks injection" }
        ],
        flag: "flag{secure_coder}",
        points: 100,
        hints: [
          "Use prepared statements with ? placeholders",
          "Pass user input as parameters, not string concatenation"
        ]
      },
        {
          title: "XSS Defense",
          slug: "xss-defense",
          category: "defense",
          type: "XSS Prevention",
          difficulty: "beginner",
          description: "Implement proper input sanitization to prevent XSS attacks.",
          instructions: [
            { step: 1, text: "Identify unsafe output rendering" },
            { step: 2, text: "Implement HTML encoding" },
            { step: 3, text: "Add Content Security Policy headers" },
            { step: 4, text: "Test with XSS payloads" }
          ],
          flag: "flag{sanitization_expert}",
          points: 100,
          hints: [
            "Encode < > & \" ' characters",
            "Use libraries like DOMPurify"
          ]
        },
        {
          title: "Data Breach",
          slug: "data-breach",
          category: "attack",
          type: "Cloud Data Exposure",
          difficulty: "beginner",
          description: "Exploit exposed cloud storage endpoints to access sensitive customer data.",
          instructions: [
            { step: 1, text: "Identify publicly accessible storage endpoints" },
            { step: 2, text: "Enumerate accessible buckets" },
            { step: 3, text: "Access sensitive data without authentication" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{data_breach_曝光_s3_bucket}",
          points: 100,
          hints: [
            "Look for publicly accessible storage endpoints",
            "Try /api/storage/public-data or similar",
            "S3 buckets often have misconfigured permissions"
          ]
        },
        {
          title: "Account Hijacking",
          slug: "account-hijacking",
          category: "attack",
          type: "Brute Force Attack",
          difficulty: "beginner",
          description: "Exploit the lack of rate limiting to perform brute force attacks on user accounts.",
          instructions: [
            { step: 1, text: "Identify the login endpoint" },
            { step: 2, text: "Send multiple login attempts" },
            { step: 3, text: "Use common credentials" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{no_rate_limit_bruteforce_success}",
          points: 100,
          hints: [
            "The auth endpoint has no rate limiting",
            "Try username: admin with multiple password attempts",
            "Common default credentials: admin/admin123"
          ]
        },
        {
          title: "Misconfiguration",
          slug: "misconfiguration",
          category: "attack",
          type: "Broken Access Control",
          difficulty: "intermediate",
          description: "Exploit missing role-based access control to access admin routes.",
          instructions: [
            { step: 1, text: "Find admin-only endpoints" },
            { step: 2, text: "Test access without proper authorization" },
            { step: 3, text: "Perform privileged actions" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{broken_rbac_admin_route_exposed}",
          points: 150,
          hints: [
            "Admin routes are not protected",
            "Try accessing /api/admin/deleteAllUsers",
            "No role validation is performed"
          ]
        },
        {
          title: "DDoS Attack",
          slug: "ddos",
          category: "attack",
          type: "Denial of Service",
          difficulty: "intermediate",
          description: "Simulate a distributed denial of service attack to overwhelm the API.",
          instructions: [
            { step: 1, text: "Send rapid repeated requests" },
            { step: 2, text: "Target API endpoints" },
            { step: 3, text: "Overwhelm the system" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{no_ddos_protection_api_down}",
          points: 150,
          hints: [
            "Send 100+ requests to overwhelm the API",
            "No rate limiting or DDoS protection exists",
            "The API cannot handle high traffic volumes"
          ]
        },
        {
          title: "Malware Injection",
          slug: "malware-injection",
          category: "attack",
          type: "Unrestricted File Upload",
          difficulty: "intermediate",
          description: "Exploit unrestricted file upload to inject malicious files.",
          instructions: [
            { step: 1, text: "Find file upload endpoints" },
            { step: 2, text: "Upload a malicious file" },
            { step: 3, text: "Execute the uploaded file" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{unrestricted_file_upload_rce}",
          points: 150,
          hints: [
            "Try uploading executable files (.exe, .php, .sh)",
            "No file type validation is performed",
            "Look for upload endpoints without sanitization"
          ]
        },
        {
          title: "Insider Threat",
          slug: "insider-threat",
          category: "attack",
          type: "Data Exfiltration",
          difficulty: "intermediate",
          description: "As a normal user, access restricted employee and salary data.",
          instructions: [
            { step: 1, text: "Query for employee data" },
            { step: 2, text: "Access salary information" },
            { step: 3, text: "Retrieve internal secrets" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{no_data_classification_employee_leak}",
          points: 150,
          hints: [
            "Try querying for employees, salaries, or secrets",
            "No data classification is enforced",
            "Regular users can access restricted data"
          ]
        },
        {
          title: "API Attack",
          slug: "api-attack",
          category: "attack",
          type: "Injection Attack",
          difficulty: "intermediate",
          description: "Exploit unvalidated API inputs with XSS and SQL injection payloads.",
          instructions: [
            { step: 1, text: "Identify API endpoints" },
            { step: 2, text: "Inject XSS or SQL payloads" },
            { step: 3, text: "Bypass input validation" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{xss_no_input_sanitization}",
          points: 150,
          hints: [
            "Try XSS payloads like <script>alert(1)</script>",
            "Try SQL injection like ' OR '1'='1",
            "No input sanitization is performed"
          ]
        },
        {
          title: "Cloud Data Protection",
          slug: "cloud-data-protection",
          category: "defense",
          type: "Cloud Security",
          difficulty: "beginner",
          description: "Implement proper access controls and encryption to protect cloud storage from data breaches.",
          instructions: [
            { step: 1, text: "Review current storage permissions" },
            { step: 2, text: "Implement bucket policies" },
            { step: 3, text: "Enable encryption at rest" },
            { step: 4, text: "Test the protections" }
          ],
          flag: "flag{cloud_defender_secure_storage}",
          points: 100,
          hints: [
            "Enable public access block",
            "Use IAM policies for access control",
            "Enable server-side encryption"
          ]
        },
        {
          title: "Rate Limiting Defense",
          slug: "rate-limiting-defense",
          category: "defense",
          type: "Brute Force Prevention",
          difficulty: "beginner",
          description: "Implement rate limiting to prevent brute force attacks on authentication endpoints.",
          instructions: [
            { step: 1, text: "Analyze the login endpoint" },
            { step: 2, text: "Implement rate limiting middleware" },
            { step: 3, text: "Add account lockout policy" },
            { step: 4, text: "Test with repeated attempts" }
          ],
          flag: "flag{rate_limit_success}",
          points: 100,
          hints: [
            "Use express-rate-limit package",
            "Limit to 5 attempts per IP",
            "Add exponential backoff"
          ]
        },
        {
          title: "Access Control Fix",
          slug: "access-control-fix",
          category: "defense",
          type: "Broken Access Control Prevention",
          difficulty: "intermediate",
          description: "Implement proper role-based access control (RBAC) to prevent unauthorized admin access.",
          instructions: [
            { step: 1, text: "Review current access control" },
            { step: 2, text: "Implement role verification middleware" },
            { step: 3, text: "Add permission checks" },
            { step: 4, text: "Test with different user roles" }
          ],
          flag: "flag{rbac_implemented}",
          points: 150,
          hints: [
            "Create role middleware",
            "Verify user role before each request",
            "Use least privilege principle"
          ]
        },
        {
          title: "DDoS Protection",
          slug: "ddos-protection",
          category: "defense",
          type: "DoS Prevention",
          difficulty: "intermediate",
          description: "Implement DDoS protection measures including rate limiting and traffic analysis.",
          instructions: [
            { step: 1, text: "Implement request throttling" },
            { step: 2, text: "Add traffic analysis" },
            { step: 3, text: "Configure auto-scaling" },
            { step: 4, text: "Test under load" }
          ],
          flag: "flag{ddos_protected}",
          points: 150,
          hints: [
            "Use rate limiting per endpoint",
            "Implement request queuing",
            "Add circuit breaker pattern"
          ]
        },
        {
          title: "Secure File Upload",
          slug: "secure-file-upload",
          category: "defense",
          type: "File Upload Security",
          difficulty: "intermediate",
          description: "Implement secure file upload validation to prevent malicious file execution.",
          instructions: [
            { step: 1, text: "Implement file type validation" },
            { step: 2, text: "Add file content scanning" },
            { step: 3, text: "Store files outside web root" },
            { step: 4, text: "Test with various file types" }
          ],
          flag: "flag{secure_upload_implemented}",
          points: 150,
          hints: [
            "Check MIME types, not just extensions",
            "Scan files for malicious content",
            "Rename files on upload"
          ]
        },
        {
          title: "Data Classification",
          slug: "data-classification",
          category: "defense",
          type: "Data Loss Prevention",
          difficulty: "intermediate",
          description: "Implement data classification and access controls to prevent insider threats.",
          instructions: [
            { step: 1, text: "Identify sensitive data categories" },
            { step: 2, text: "Implement classification labels" },
            { step: 3, text: "Add access control rules" },
            { step: 4, text: "Test data access policies" }
          ],
          flag: "flag{data_classified}",
          points: 150,
          hints: [
            "Classify as Public, Internal, Confidential",
            "Implement need-to-know access",
            "Add audit logging for data access"
          ]
        },
        {
          title: "API Security Hardening",
          slug: "api-security-hardening",
          category: "defense",
          type: "API Security",
          difficulty: "intermediate",
          description: "Implement comprehensive API security including input validation and output encoding.",
          instructions: [
            { step: 1, text: "Implement input sanitization" },
            { step: 2, text: "Add output encoding" },
            { step: 3, text: "Implement CORS policies" },
            { step: 4, text: "Test with attack payloads" }
          ],
          flag: "flag{api_hardened}",
          points: 150,
          hints: [
            "Validate all input parameters",
            "Encode all output",
            "Use strict CORS configuration"
          ]
        },
        {
          title: "Backup Strategy",
          slug: "backup-strategy",
          category: "defense",
          type: "Data Recovery",
          difficulty: "advanced",
          description: "Implement automated backup and recovery procedures to prevent data loss.",
          instructions: [
            { step: 1, text: "Set up automated backups" },
            { step: 2, text: "Implement backup verification" },
            { step: 3, text: "Add recovery testing" },
            { step: 4, text: "Document recovery procedures" }
          ],
          flag: "flag{backup_implemented}",
          points: 200,
          hints: [
            "Use 3-2-1 backup rule",
            "Test backup restoration regularly",
            "Automate backup scheduling"
          ]
        },
        {
          title: "TLS/SSL Configuration",
          slug: "tls-configuration",
          category: "defense",
          type: "Encryption Configuration",
          difficulty: "advanced",
          description: "Configure proper TLS settings to prevent MITM attacks and ensure secure communication.",
          instructions: [
            { step: 1, text: "Enable HTTPS everywhere" },
            { step: 2, text: "Configure HSTS headers" },
            { step: 3, text: "Implement certificate pinning" },
            { step: 4, text: "Test with SSL Labs" }
          ],
          flag: "flag{tls_secure}",
          points: 200,
          hints: [
            "Use TLS 1.3 only",
            "Enable HSTS with max-age",
            "Implement certificate pinning"
          ]
        },
        {
          title: "Container Isolation",
          slug: "container-isolation",
          category: "defense",
          type: "Container Security",
          difficulty: "advanced",
          description: "Implement proper container isolation to prevent container escape vulnerabilities.",
          instructions: [
            { step: 1, text: "Review container configurations" },
            { step: 2, text: "Implement network segmentation" },
            { step: 3, text: "Add resource limits" },
            { step: 4, text: "Test isolation boundaries" }
          ],
          flag: "flag{containers_isolated}",
          points: 200,
          hints: [
            "Use Kubernetes network policies",
            "Limit container capabilities",
            "Implement AppArmor or SELinux"
          ]
        },
        {
          title: "Data Loss",
          slug: "data-loss",
          category: "attack",
          type: "Data Deletion",
          difficulty: "advanced",
          description: "Exploit missing backups to cause permanent data loss.",
          instructions: [
            { step: 1, text: "Find delete endpoints" },
            { step: 2, text: "Send deletion commands" },
            { step: 3, text: "Confirm without backup" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{no_backup_strategy_data_loss}",
          points: 200,
          hints: [
            "Send DELETE request with confirmation",
            "No backup will be created",
            "Try: {\"confirm\": \"DELETE\", \"records\": \"ALL\"}"
          ]
        },
        {
          title: "MITM Attack",
          slug: "mitm",
          category: "attack",
          type: "Traffic Interception",
          difficulty: "advanced",
          description: "Exploit insecure HTTP to intercept plaintext traffic.",
          instructions: [
            { step: 1, text: "Use HTTP instead of HTTPS" },
            { step: 2, text: "Intercept traffic" },
            { step: 3, text: "Extract sensitive data" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{http_no_encryption_mitm}",
          points: 200,
          hints: [
            "Try accessing via HTTP protocol",
            "No encryption is enforced",
            "The API accepts insecure connections"
          ]
        },
        {
          title: "Shared Vulnerability",
          slug: "shared-vulnerability",
          category: "attack",
          type: "Container Escape",
          difficulty: "advanced",
          description: "Exploit shared kernel vulnerabilities to access other containers.",
          instructions: [
            { step: 1, text: "Enumerate shared services" },
            { step: 2, text: "Access other containers" },
            { step: 3, text: "Escape container isolation" },
            { step: 4, text: "Capture the flag" }
          ],
          flag: "flag{container_no_isolation_shared_kernel}",
          points: 200,
          hints: [
            "Containers share the same kernel",
            "Try accessing container-1, container-2, or database",
            "No network segmentation is configured"
          ]
        }
      ];

      await Lab.deleteMany({});
      await Lab.insertMany(labs);

      res.json({ message: "Labs seeded successfully", count: labs.length });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
