import Log from "../models/Log.js";
import Progress from "../models/Progress.js";
import Lab from "../models/Lab.js";
import User from "../models/User.js";

const sensitiveData = {
  customers: [
    { id: 1, name: "John Smith", email: "john@secret.com", ssn: "123-45-6789", cc: "****-****-****-4242" },
    { id: 2, name: "Jane Doe", email: "jane@secret.com", ssn: "987-65-4321", cc: "****-****-****-1234" }
  ],
  employees: [
    { id: 1, name: "Admin User", role: "super_admin", salary: "$150,000", access_level: 5 },
    { id: 2, name: "Bob Wilson", role: "developer", salary: "$95,000", access_level: 3 }
  ],
  secrets: [
    { key: "AWS_SECRET_KEY", value: "sk_live_abc123xyz789SECRET" },
    { key: "DATABASE_URL", value: "postgresql://admin:password123@db.production:5432/main" },
    { key: "JWT_SECRET", value: "super_secret_jwt_key_do_not_share_2024" }
  ]
};

const adminCredentials = [
  { username: "admin", password: "admin123", role: "super_admin" },
  { username: "sysadmin", password: "sys2024", role: "admin" }
];

const users = [
  { id: 1, username: "alice", password: "alice123", email: "alice@company.com" },
  { id: 2, username: "bob", password: "bob456", email: "bob@company.com" },
  { id: 3, username: "charlie", password: "charlie789", email: "charlie@company.com" }
];

export const executeAttack = async (req, res) => {
  try {
    const { labSlug, payload, action } = req.body;
    const userId = req.user._id;
    const lab = await Lab.findOne({ slug: labSlug }).select("_id");

    if (!lab) {
      return res.status(404).json({ success: false, output: "Lab not found" });
    }

    let result = { success: false, output: "", flag: null };

    switch (labSlug) {
      case "data-breach":
        result = await handleDataBreach(userId, payload, action);
        break;
      case "account-hijacking":
        result = await handleAccountHijacking(userId, payload, action);
        break;
      case "misconfiguration":
        result = await handleMisconfiguration(userId, payload, action);
        break;
      case "ddos":
        result = await handleDDoS(userId, payload, action);
        break;
      case "malware-injection":
        result = await handleMalwareInjection(userId, payload, action);
        break;
      case "insider-threat":
        result = await handleInsiderThreat(userId, payload, action);
        break;
      case "api-attack":
        result = await handleAPIAttack(userId, payload, action);
        break;
      case "data-loss":
        result = await handleDataLoss(userId, payload, action);
        break;
      case "mitm":
        result = await handleMITM(userId, payload, action);
        break;
      case "shared-vulnerability":
        result = await handleSharedVulnerability(userId, payload, action);
        break;
      default:
        result = { success: false, output: "Unknown attack type", flag: null };
    }

    await Log.create({
      userId,
      labId: lab._id,
      action: action || "attack",
      input: JSON.stringify(payload),
      output: JSON.stringify(result),
      success: result.success
    });

    res.json(result);
  } catch (error) {
    console.error("Attack error:", error);
    res.status(500).json({ success: false, output: "Server error", error: error.message });
  }
};

async function handleDataBreach(userId, payload, action) {
  const publicDataEndpoint = payload?.endpoint;
  
  if (publicDataEndpoint?.includes("public") || publicDataEndpoint?.includes("storage")) {
    return {
      success: true,
      output: `[+] Accessing storage endpoint...\n[+] Found sensitive data exposure!\n\n${JSON.stringify(sensitiveData, null, 2)}`,
      flag: "flag{data_breach_曝光_s3_bucket}",
      breachType: "Insecure Direct Object Reference (IDOR)"
    };
  }
  
  if (publicDataEndpoint === "/api/storage/all" || publicDataEndpoint === "all") {
    return {
      success: true,
      output: `[+] Enumerating all storage buckets...\n[+] FOUND: 3 exposed buckets\n\nBucket 1: customer_data (EXPOSED)\nBucket 2: employee_records (EXPOSED)\nBucket 3: secret_keys (CRITICAL)`,
      flag: "flag{s3_bucket_misconfiguration}",
      breachType: "Bucket Enumeration"
    };
  }

  return {
    success: false,
    output: `[-] Endpoint: ${publicDataEndpoint || "not specified"}\n[-] Status: 403 Forbidden\n\nTry accessing a public storage endpoint...`
  };
}

async function handleAccountHijacking(userId, payload, action) {
  const { username, password, attempt } = payload || {};
  
  if (!username) {
    return {
      success: false,
      output: `[-] No username provided\n[?] Hint: Try enumerating common admin usernames`
    };
  }

  const bruteForce = attempt && attempt > 3;
  const correctCreds = adminCredentials.find(c => 
    c.username === username && (c.password === password || bruteForce)
  );

  if (correctCreds) {
    return {
      success: true,
      output: `[+] Brute force successful!\n[+] Account: ${username}\n[+] Role: ${correctCreds.role}\n[+] Session hijacked!\n\n[!] WARNING: No rate limiting detected on auth endpoint`,
      flag: "flag{no_rate_limit_bruteforce_success}",
      breachType: "Brute Force Attack",
      attempts: attempt
    };
  }

  if (bruteForce) {
    return {
      success: false,
      output: `[-] Attempt ${attempt}: Failed\n[!] Warning: Target may be using simple passwords\n[?] Try common credentials: admin/admin123`
    };
  }

  return {
    success: false,
    output: `[-] Login attempt failed for: ${username}\n[!] This endpoint has NO rate limiting\n[?] Try brute force with multiple attempts`
  };
}

async function handleMisconfiguration(userId, payload, action) {
  const { route } = payload || {};

  if (route === "/api/admin/deleteAllUsers" || route === "deleteAllUsers") {
    return {
      success: true,
      output: `[!] EXPLOITING MISCONFIGURATION!\n[!] No role-based access control (RBAC) detected\n\n[+] Executing: DELETE /api/admin/deleteAllUsers\n[+] DELETED: 1,247 user records\n[+] BACKUP: No backup configured\n\n[!] CRITICAL: Admin routes accessible to all users`,
      flag: "flag{broken_rbac_admin_route_exposed}",
      breachType: "Privilege Escalation"
    };
  }

  if (route === "/api/admin/config" || route === "config") {
    return {
      success: true,
      output: `[+] Accessing admin configuration...\n[+] No authorization check!\n\nCONFIGURATION:\n- Debug Mode: ENABLED\n- CORS Origins: *\n- Admin Panel: http://internal/admin\n- Default Password: admin123`,
      flag: "flag{debug_mode_enabled_exposes_config}",
      breachType: "Security Misconfiguration"
    };
  }

  if (route?.startsWith("/api/admin")) {
    return {
      success: true,
      output: `[!] Accessing restricted admin route: ${route}\n[!] Authorization header not validated\n[+] Route accessible without proper role check`,
      flag: "flag{admin_route_no_auth_check}",
      breachType: "IDOR on Admin Routes"
    };
  }

  return {
    success: false,
    output: `[-] Route: ${route || "not specified"}\n[-] Status: Attempting access...\n\n[?] Try accessing /api/admin/deleteAllUsers`
  };
}

async function handleDDoS(userId, payload, action) {
  const { requests } = payload || {};
  
  if (requests >= 100) {
    return {
      success: true,
      output: `[!] DDoS ATTACK INITIATED\n[!] Sending ${requests} requests...\n\n[+] Request ${requests}/second detected\n[-] No rate limiting in place!\n[-] No DDoS protection detected!\n[-] Target API overwhelmed\n\n[!] Impact: API unavailable for 30 minutes`,
      flag: "flag{no_ddos_protection_api_down}",
      breachType: "Denial of Service",
      requestsSent: requests
    };
  }

  return {
    success: false,
    output: `[?] DDoS simulation - send 100+ requests to overwhelm API\n[?] Current: ${requests || 0} requests\n[?] Try: {\"requests\": 150}`,
    currentRequests: requests || 0
  };
}

async function handleMalwareInjection(userId, payload, action) {
  const { filename, content } = payload || {};

  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /eval\(/i,
    /\.exe$/i,
    /\.php$/i,
    /\.sh$/i,
    /rm -rf/i,
    /cat \/etc\/passwd/i
  ];

  const isMalicious = maliciousPatterns.some(pattern => 
    content?.match(pattern) || filename?.match(pattern)
  );

  if (isMalicious) {
    return {
      success: true,
      output: `[!] MALICIOUS FILE UPLOADED!\n[!] No file validation detected!\n\n[+] File: ${filename || "malware.exe"}\n[+] Type: EXECUTABLE/HTML\n[+] No antivirus scan performed\n[+] File stored in: /uploads/malware/\n\n[!] Shell execution possible at: /uploads/malware/shell.php`,
      flag: "flag{unrestricted_file_upload_rce}",
      breachType: "Unrestricted File Upload"
    };
  }

  return {
    success: false,
    output: `[-] File: ${filename || "not specified"}\n[-] Scan: PASSED (basic)\n[!] No deep content analysis\n[?] Try uploading a script file or executable`
  };
}

async function handleInsiderThreat(userId, payload, action) {
  const { query } = payload || {};

  if (query === "employees" || query === "salaries" || query === "admin_data") {
    return {
      success: true,
      output: `[!] INSIDER THREAT EXPLOITED!\n[!] Normal user accessing restricted data\n\n[+] Query: ${query}\n[+] Data Retrieved:\n${JSON.stringify(sensitiveData.employees, null, 2)}\n\n[!] No data classification enforcement\n[!] Employees unaware of data exposure`,
      flag: "flag{no_data_classification_employee_leak}",
      breachType: "Data Exfiltration by Insider"
    };
  }

  if (query === "secrets" || query === "keys") {
    return {
      success: true,
      output: `[!] CRITICAL: Accessing internal secrets\n[!] No secret rotation in place\n\n[+] Secrets Retrieved:\n${JSON.stringify(sensitiveData.secrets, null, 2)}\n\n[!] AWS keys are LIVE\n[!] Database credentials are VALID`,
      flag: "flag{secret_keys_exposed_no_rotation}",
      breachType: "Credential Exposure"
    };
  }

  return {
    success: false,
    output: `[-] Query: ${query || "not specified"}\n[-] Data access: DENIED (surface level)\n\n[?] Try querying: employees, salaries, secrets, keys`,
    hint: "As a regular user, try to access admin/HR data"
  };
}

async function handleAPIAttack(userId, payload, action) {
  const { data } = payload || {};

  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "javascript:alert(document.cookie)",
    "<img src=x onerror=alert(1)>",
    "';alert('XSS');//"
  ];

  const sqlPayloads = [
    "1' OR '1'='1",
    "admin'--",
    "1; DROP TABLE users;--"
  ];

  const inputStr = JSON.stringify(data);
  
  if (xssPayloads.some(p => inputStr.includes(p))) {
    return {
      success: true,
      output: `[!] XSS PAYLOAD DETECTED!\n[!] No input sanitization on API\n\n[+] Payload reflected in response\n[+] No HTML encoding applied\n[+] Stored XSS possible\n\n[!] Other users can be attacked`,
      flag: "flag{xss_no_input_sanitization}",
      breachType: "Cross-Site Scripting (XSS)"
    };
  }

  if (sqlPayloads.some(p => inputStr.includes(p.replace(/'/g, "")))) {
    return {
      success: true,
      output: `[!] SQL INJECTION POSSIBLE!\n[!] No parameterized queries used\n\n[+] Payload: ${data}\n[+] Query manipulation detected\n[+] Database: MySQL 5.7\n\n[!] Full database dump possible`,
      flag: "flag{sql_injection_on_api_endpoint}",
      breachType: "SQL Injection"
    };
  }

  return {
    success: false,
    output: `[-] Payload: ${data || "not specified"}\n[-] API Response: Sanitized\n\n[?] Try XSS payloads or SQL injection`,
    hint: "No input validation detected - try common attack patterns"
  };
}

async function handleDataLoss(userId, payload, action) {
  const { confirm, records } = payload || {};

  if (confirm === "DELETE" && records === "ALL") {
    return {
      success: true,
      output: `[!] DATA LOSS ATTACK SUCCESSFUL!\n[!] No confirmation or backup\n\n[+] DELETE ALL records\n[+] Affected: ${users.length} users\n[+] Backup: DISABLED\n[+] Recovery: IMPOSSIBLE\n\n[!] This simulates an insider deletion attack`,
      flag: "flag{no_backup_strategy_data_loss}",
      breachType: "Data Deletion Attack"
    };
  }

  return {
    success: false,
    output: `[-] Deletion request received\n[-] Warning: This will delete data!\n\n[?] To confirm deletion, send: {"confirm": "DELETE", "records": "ALL"}\n[!] No backup will be created`,
    warning: "No data protection in place"
  };
}

async function handleMITM(userId, payload, action) {
  const { protocol, endpoint } = payload || {};

  if (protocol === "http" || endpoint?.startsWith("http://")) {
    return {
      success: true,
      output: `[!] MITM ATTACK SIMULATION!\n[!] Using insecure HTTP protocol\n\n[+] Interception possible\n[+] Credentials visible in plaintext\n[+] Session cookies exposed\n[+] Data can be modified in transit\n\n[!] Target uses HTTP (not HTTPS)\n[!] No HSTS headers\n[!] Certificate not validated`,
      flag: "flag{http_no_encryption_mitm}",
      breachType: "Man-in-the-Middle (MITM)"
    };
  }

  return {
    success: false,
    output: `[-] Protocol: ${protocol || "not specified"}\n[-] Security: UNKNOWN\n\n[?] Try using HTTP instead of HTTPS:\n    {"protocol": "http", "endpoint": "http://api.target.com"}`,
    hint: "Try accessing the API over HTTP to intercept traffic"
  };
}

async function handleSharedVulnerability(userId, payload, action) {
  const { service } = payload || {};

  const sharedServices = {
    "container-1": { ip: "10.0.0.5", data: "Container A: DB credentials" },
    "container-2": { ip: "10.0.0.6", data: "Container B: API keys" },
    "database": { ip: "10.0.0.10", data: "Main DB: All user data" }
  };

  if (service && sharedServices[service]) {
    return {
      success: true,
      output: `[!] SHARED VULNERABILITY EXPLOITED!\n[!] Container isolation not enforced\n\n[+] Service: ${service}\n[+] IP: ${sharedServices[service].ip}\n[+] Data: ${sharedServices[service].data}\n\n[!] Shared kernel namespaces\n[!] No network segmentation\n[!] Privilege escalation possible`,
      flag: "flag{container_no_isolation_shared_kernel}",
      breachType: "Container Escape"
    };
  }

  if (service === "all" || service === "enumerate") {
    return {
      success: true,
      output: `[+] Enumerating shared services...\n[+] Found 3 accessible containers\n\n${Object.entries(sharedServices).map(([k, v]) => 
        `[+] ${k}: ${v.ip} - ${v.data}`
      ).join("\n")}\n\n[!] No container-to-container auth`,
      flag: "flag{shared_network_no_auth}",
      breachType: "Service Enumeration"
    };
  }

  return {
    success: false,
    output: `[-] Service: ${service || "not specified"}\n[-] Access: DENIED\n\n[?] Available services: container-1, container-2, database\n[?] Try: {"service": "all"} to enumerate`,
    availableServices: Object.keys(sharedServices)
  };
}

export const getPublicEndpoints = async (req, res) => {
  res.json({
    endpoints: [
      { path: "/api/storage/public-data", method: "GET", auth: "none" },
      { path: "/api/storage/backup", method: "GET", auth: "none" },
      { path: "/api/status", method: "GET", auth: "none" }
    ],
    message: "Intentionally exposed endpoints for testing"
  });
};

export const getHint = async (req, res) => {
  const { labSlug } = req.body;

  const hints = {
    "data-breach": [
      "Look for publicly accessible storage endpoints",
      "Try accessing /api/storage/public-data",
      "The bucket name might be 'public' or 'exposed'"
    ],
    "account-hijacking": [
      "This endpoint has no rate limiting",
      "Try multiple login attempts with common credentials",
      "admin/admin123 is a common default credential"
    ],
    "misconfiguration": [
      "Admin routes are not properly protected",
      "Try accessing /api/admin/* routes",
      "The deleteAllUsers endpoint is exposed"
    ],
    "ddos": [
      "Send many rapid requests to overwhelm the API",
      "Try 100+ requests per second",
      "There is no DDoS protection in place"
    ],
    "malware-injection": [
      "Upload files without validation",
      "Try uploading an executable or script file",
      "Look for unrestricted file upload endpoints"
    ],
    "insider-threat": [
      "Normal users can access sensitive data",
      "Try querying for employee or salary data",
      "No data classification is enforced"
    ],
    "api-attack": [
      "Try injecting scripts or SQL in API inputs",
      "XSS and SQLi payloads work here",
      "No input sanitization is performed"
    ],
    "data-loss": [
      "Send a DELETE request to remove data",
      "Confirm the deletion without backup",
      "No confirmation or backup is required"
    ],
    "mitm": [
      "Use HTTP instead of HTTPS",
      "The API accepts insecure connections",
      "Try accessing via plaintext protocol"
    ],
    "shared-vulnerability": [
      "Containers share the same kernel",
      "Try accessing other containers",
      "No network isolation is configured"
    ]
  };

  res.json({
    hint: hints[labSlug]?.[0] || "No hint available",
    labSlug
  });
};
