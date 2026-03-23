import Log from "../models/Log.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import Lab from "../models/Lab.js";

const DEFENSE_SLUG_ALIASES = {
  "cloud-data-protection": "data-breach",
  "rate-limiting-defense": "account-hijacking",
  "access-control-fix": "misconfiguration",
  "ddos-protection": "ddos",
  "secure-file-upload": "malware-injection",
  "data-classification": "insider-threat",
  "api-security-hardening": "api-attack",
  "backup-strategy": "data-loss",
  "tls-configuration": "mitm",
  "container-isolation": "shared-vulnerability",
  "secure-sql": "api-attack",
  "xss-defense": "api-attack"
};

const resolveDefenseSlug = (labSlug) => DEFENSE_SLUG_ALIASES[labSlug] || labSlug;

const defenseStrategies = {
  "data-breach": {
    name: "Data Encryption & Access Control",
    description: "Implement encryption at rest and in transit, plus proper access controls",
    actions: ["encrypt", "restrict", "audit", "rotate"]
  },
  "account-hijacking": {
    name: "Multi-Factor Authentication & Rate Limiting",
    description: "Add MFA and implement rate limiting on auth endpoints",
    actions: ["mfa", "ratelimit", "lockout", "monitor"]
  },
  "misconfiguration": {
    name: "Role-Based Access Control (RBAC)",
    description: "Implement proper role-based access control for all admin routes",
    actions: ["rbac", "validate", "audit", "harden"]
  },
  "ddos": {
    name: "Rate Limiting & DDoS Protection",
    description: "Implement rate limiting and DDoS protection mechanisms",
    actions: ["ratelimit", "cdn", "waf", "geo-block"]
  },
  "malware-injection": {
    name: "File Validation & Antivirus",
    description: "Implement file upload validation and antivirus scanning",
    actions: ["validate", "scan", "quarantine", "sandbox"]
  },
  "insider-threat": {
    name: "Data Classification & Access Controls",
    description: "Implement data classification and strict access controls",
    actions: ["classify", "isolate", "monitor", "audit"]
  },
  "api-attack": {
    name: "Input Sanitization & Parameterized Queries",
    description: "Sanitize all inputs and use parameterized queries",
    actions: ["sanitize", "parametrize", "validate", "escape"]
  },
  "data-loss": {
    name: "Backup Strategy & Confirmation",
    description: "Implement automated backups and deletion confirmation",
    actions: ["backup", "confirm", "snapshot", "archive"]
  },
  "mitm": {
    name: "TLS/HTTPS Enforcement",
    description: "Enforce HTTPS and implement certificate pinning",
    actions: ["https", "hsts", "pinning", "cert-validate"]
  },
  "shared-vulnerability": {
    name: "Container Isolation & Network Segmentation",
    description: "Implement container isolation and network segmentation",
    actions: ["isolate", "segment", "namespaces", "policy"]
  }
};

export const checkAttackCompleted = async (req, res) => {
  try {
    const { labSlug: requestedSlug } = req.params;
    const userId = req.user._id;
    const canonicalSlug = resolveDefenseSlug(requestedSlug);
    const lab = await Lab.findOne({ slug: requestedSlug }).select("_id category");

    if (!lab) {
      return res.status(404).json({ completed: false, message: "Lab not found" });
    }

    // Defense-category labs can enter defense mode directly.
    if (lab.category === "defense") {
      return res.json({
        completed: true,
        canDefend: true,
        labSlug: canonicalSlug,
        message: "Defense lab ready"
      });
    }

    const progress = await Progress.findOne({ userId, labId: lab._id });
    const completed = Boolean(progress && progress.status === "completed");

    return res.json({
      completed,
      canDefend: completed,
      labSlug: canonicalSlug,
      message: completed
        ? "Attack phase completed"
        : "You must complete the attack phase before defending"
    });
  } catch (error) {
    console.error("Check attack status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const executeDefense = async (req, res) => {
  try {
    const { labSlug: requestedSlug, action, parameters } = req.body;
    const userId = req.user._id;
    const canonicalSlug = resolveDefenseSlug(requestedSlug);
    const lab = await Lab.findOne({ slug: requestedSlug }).select("_id category");

    if (!lab) {
      return res.status(404).json({ success: false, output: "Lab not found" });
    }

    if (lab.category !== "defense") {
      const progress = await Progress.findOne({ userId, labId: lab._id });
      if (!progress || progress.status !== "completed") {
        return res.status(400).json({
          success: false,
          output: "You must complete the attack phase before defending!"
        });
      }
    }

    let result = { success: false, output: "", defenseDeployed: null };

    switch (canonicalSlug) {
      case "data-breach":
        result = handleDataBreachDefense(userId, action, parameters);
        break;
      case "account-hijacking":
        result = handleAccountHijackingDefense(userId, action, parameters);
        break;
      case "misconfiguration":
        result = handleMisconfigurationDefense(userId, action, parameters);
        break;
      case "ddos":
        result = handleDDoSDefense(userId, action, parameters);
        break;
      case "malware-injection":
        result = handleMalwareInjectionDefense(userId, action, parameters);
        break;
      case "insider-threat":
        result = handleInsiderThreatDefense(userId, action, parameters);
        break;
      case "api-attack":
        result = handleAPIAttackDefense(userId, action, parameters);
        break;
      case "data-loss":
        result = handleDataLossDefense(userId, action, parameters);
        break;
      case "mitm":
        result = handleMITMDefense(userId, action, parameters);
        break;
      case "shared-vulnerability":
        result = handleSharedVulnerabilityDefense(userId, action, parameters);
        break;
      default:
        result = { success: false, output: "Unknown lab type", defenseDeployed: null };
    }

    await Log.create({
      userId,
      labId: lab._id,
      action: "defense",
      input: JSON.stringify({ action, parameters, labSlug: requestedSlug }),
      output: JSON.stringify(result),
      success: result.success
    });

    res.json(result);
  } catch (error) {
    console.error("Defense error:", error);
    res.status(500).json({ success: false, output: "Server error", error: error.message });
  }
};

function handleDataBreachDefense(userId, action, parameters) {
  if (action === "encrypt") {
    return {
      success: true,
      output: `[+] DEPLOYING ENCRYPTION...\n[+] Algorithm: AES-256-GCM\n[+] Key Rotation: ENABLED\n[+] Data at rest: ENCRYPTED\n[+] Data in transit: ENCRYPTED\n\n✓ All S3 buckets now require authentication\n✓ Bucket policies enforced\n✓ Public access blocked\n✓ Encryption at rest enabled\n✓ Access logging enabled`,
      defenseDeployed: "AES-256 Encryption + S3 Bucket Policies",
      blockedAttack: "Insecure Direct Object Reference (IDOR)"
    };
  }

  if (action === "restrict") {
    return {
      success: true,
      output: `[+] DEPLOYING ACCESS RESTRICTIONS...\n[+] IAM policies applied\n[+] Bucket policies configured\n[+] Public access blocked\n\n✓ Only authorized users can access storage\n✓ Cross-account access denied\n✓ No direct object references exposed`,
      defenseDeployed: "IAM + Bucket Policies",
      blockedAttack: "Bucket Enumeration"
    };
  }

  if (action === "audit") {
    return {
      success: true,
      output: `[+] ENABLING AUDIT LOGGING...\n[+] CloudTrail configured\n[+] S3 access logging enabled\n[+] Alert thresholds set\n\n✓ All access attempts now logged\n✓ Anomaly detection active\n✓ Alerts configured for sensitive data access`,
      defenseDeployed: "CloudTrail + Access Logging",
      blockedAttack: "Undetected Data Exfiltration"
    };
  }

  if (action === "rotate") {
    return {
      success: true,
      output: `[+] ROTATING CREDENTIALS...\n[+] AWS Access Keys: ROTATED\n[+] Database credentials: ROTATED\n[+] API keys: REGENERATED\n\n✓ Old compromised credentials invalidated\n✓ New credentials distributed securely\n✓ Rotation schedule: 90 days`,
      defenseDeployed: "Credential Rotation",
      blockedAttack: "Credential-based Access"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: encrypt, restrict, audit, rotate`,
    defenseDeployed: null
  };
}

function handleAccountHijackingDefense(userId, action, parameters) {
  if (action === "mfa") {
    return {
      success: true,
      output: `[+] ENABLING MULTI-FACTOR AUTHENTICATION...\n[+] TOTP support: CONFIGURED\n[+] SMS backup: CONFIGURED\n[+] Hardware keys: SUPPORTED\n\n✓ MFA required for all admin accounts\n✓ MFA required for password changes\n✓ Session timeout: 30 minutes\n✓ Suspicious login blocks MFA`,
      defenseDeployed: "Multi-Factor Authentication",
      blockedAttack: "Brute Force Attack"
    };
  }

  if (action === "ratelimit") {
    return {
      success: true,
      output: `[+] DEPLOYING RATE LIMITING...\n[+] Login attempts: 5 per 15 minutes\n[+] Account lockout: 30 minutes after 5 failures\n[+] CAPTCHA on 3rd attempt\n\n✓ Brute force attacks now blocked\n✓ Suspicious IPs automatically blocked\n✓ Login attempts logged and monitored`,
      defenseDeployed: "Rate Limiting + Account Lockout",
      blockedAttack: "Brute Force / Credential Stuffing"
    };
  }

  if (action === "lockout") {
    return {
      success: true,
      output: `[+] CONFIGURED ACCOUNT LOCKOUT POLICY...\n[+] Max attempts: 5\n[+] Lockout duration: 30 minutes\n[+] Admin notification: ENABLED\n\n✓ Compromised accounts automatically locked\n✓ Password reset via verified email required\n✓ Security team alerted`,
      defenseDeployed: "Account Lockout Policy",
      blockedAttack: "Repeated Login Attempts"
    };
  }

  if (action === "monitor") {
    return {
      success: true,
      output: `[+] ENABLING THREAT MONITORING...\n[+] Anomaly detection: ACTIVE\n[+] Geolocation tracking: ENABLED\n[+] Device fingerprinting: CONFIGURED\n\n✓ Unusual login patterns detected\n✓ Impossible travel alerts enabled\n✓ Real-time security notifications`,
      defenseDeployed: "Threat Detection & Monitoring",
      blockedAttack: "Unauthorized Access Attempts"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: mfa, ratelimit, lockout, monitor`,
    defenseDeployed: null
  };
}

function handleMisconfigurationDefense(userId, action, parameters) {
  if (action === "rbac") {
    return {
      success: true,
      output: `[+] IMPLEMENTING ROLE-BASED ACCESS CONTROL...\n[+] Roles defined: admin, user, guest\n[+] Permissions matrix: CONFIGURED\n[+] Inheritance rules: SET\n\n✓ Admin routes require admin role\n✓ deleteAllUsers requires super_admin\n✓ All routes validate authorization header\n✓ Default deny policy applied`,
      defenseDeployed: "RBAC Implementation",
      blockedAttack: "Privilege Escalation via IDOR"
    };
  }

  if (action === "validate") {
    return {
      success: true,
      output: `[+] ADDING AUTHORIZATION VALIDATION...\n[+] JWT validation: ENFORCED\n[+] Role verification: MANDATORY\n[+] Token expiration: 1 hour\n\n✓ All admin endpoints validate permissions\n✓ Invalid tokens rejected immediately\n✓ Expired sessions terminated`,
      defenseDeployed: "Authorization Middleware",
      blockedAttack: "Unauthorized Admin Access"
    };
  }

  if (action === "audit") {
    return {
      success: true,
      output: `[+] ENABLING SECURITY AUDIT...\n[+] Admin action logging: ACTIVE\n[+] Configuration change tracking: ENABLED\n[+] Audit report generation: SCHEDULED\n\n✓ All admin actions logged\n✓ Configuration changes tracked\n✓ Compliance reports available`,
      defenseDeployed: "Security Audit Trail",
      blockedAttack: "Undetected Configuration Changes"
    };
  }

  if (action === "harden") {
    return {
      success: true,
      output: `[+] HARDENING SERVER CONFIGURATION...\n[+] Debug mode: DISABLED\n[+] CORS: Restricted origins only\n[+] Default credentials: CHANGED\n\n✓ Production debug mode OFF\n✓ CORS restricted to whitelisted domains\n✓ Default admin passwords changed`,
      defenseDeployed: "Security Hardening",
      blockedAttack: "Debug Mode Information Disclosure"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: rbac, validate, audit, harden`,
    defenseDeployed: null
  };
}

function handleDDoSDefense(userId, action, parameters) {
  if (action === "ratelimit") {
    return {
      success: true,
      output: `[+] IMPLEMENTING RATE LIMITING...\n[+] Requests per minute: 100\n[+] Burst allowance: 150\n[+] Global limits: ENFORCED\n\n✓ API rate limiting active\n✓ Per-user limits applied\n✓ Excess requests return 429`,
      defenseDeployed: "API Rate Limiting",
      blockedAttack: "DDoS via Request Flooding"
    };
  }

  if (action === "cdn") {
    return {
      success: true,
      output: `[+] CONFIGURED CDN PROTECTION...\n[+] CDN nodes: 200+ globally\n[+] Traffic scrubbing: ENABLED\n[+] Origin shielding: ACTIVE\n\n✓ Malicious traffic filtered at edge\n✓ Origin server protected\n✓ SSL/TLS termination at CDN`,
      defenseDeployed: "CDN + DDoS Mitigation",
      blockedAttack: "Volumetric DDoS Attack"
    };
  }

  if (action === "waf") {
    return {
      success: true,
      output: `[+] DEPLOYING WEB APPLICATION FIREWALL...\n[+] OWASP rules: ACTIVE\n[+] Custom rules: CONFIGURED\n[+] IP reputation lists: ENABLED\n\n✓ SQL injection blocked\n✓ XSS attacks prevented\n✓ Known attack patterns filtered`,
      defenseDeployed: "Web Application Firewall (WAF)",
      blockedAttack: "Application-Layer DDoS"
    };
  }

  if (action === "geo-block") {
    return {
      success: true,
      output: `[+] CONFIGURED GEOGRAPHIC RESTRICTIONS...\n[+] Allowed regions: Whitelisted\n[+] Blacklisted countries: 50+\n[+] IP-based blocking: ACTIVE\n\n✓ Traffic restricted to allowed regions\n✓ Tor exit nodes blocked\n✓ VPN services restricted`,
      defenseDeployed: "Geographic IP Filtering",
      blockedAttack: "Botnet-originated DDoS"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: ratelimit, cdn, waf, geo-block`,
    defenseDeployed: null
  };
}

function handleMalwareInjectionDefense(userId, action, parameters) {
  if (action === "validate") {
    return {
      success: true,
      output: `[+] IMPLEMENTING FILE VALIDATION...\n[+] MIME type checking: ENABLED\n[+] Extension whitelist: CONFIGURED\n[+] Magic byte verification: ACTIVE\n\n✓ Only whitelisted file types allowed\n✓ Executable files rejected\n✓ Content inspection performed`,
      defenseDeployed: "File Type Validation",
      blockedAttack: "Unrestricted File Upload"
    };
  }

  if (action === "scan") {
    return {
      success: true,
      output: `[+] DEPLOYING ANTIVIRUS SCANNING...\n[+] ClamAV integration: CONFIGURED\n[+] Real-time scanning: ENABLED\n[+] Signature database: UPDATED\n\n✓ All uploaded files scanned\n✓ Malware detected and quarantined\n✓ Zero-day detection via sandboxing`,
      defenseDeployed: "Real-time Antivirus Scanning",
      blockedAttack: "Malware Upload and Execution"
    };
  }

  if (action === "quarantine") {
    return {
      success: true,
      output: `[+] CONFIGURED QUARANTINE SYSTEM...\n[+] Suspicious files: ISOLATED\n[+] Upload directory: SANDBOXED\n[+] Execution: BLOCKED\n\n✓ Malicious files moved to quarantine\n✓ Cannot execute uploaded scripts\n✓ Admin notification on detection`,
      defenseDeployed: "File Quarantine System",
      blockedAttack: "Shell Upload via Web Shell"
    };
  }

  if (action === "sandbox") {
    return {
      success: true,
      output: `[+] ENABLING SANDBOX EXECUTION...\n[+] Containerized uploads: ISOLATED\n[+] Execution permissions: REMOVED\n[+] Network access: DENIED\n\n✓ Uploaded files cannot execute\n✓ PHP/Perl/Python execution blocked\n✓ Shell escape attempts prevented`,
      defenseDeployed: "Execution Sandboxing",
      blockedAttack: "Remote Code Execution via Upload"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: validate, scan, quarantine, sandbox`,
    defenseDeployed: null
  };
}

function handleInsiderThreatDefense(userId, action, parameters) {
  if (action === "classify") {
    return {
      success: true,
      output: `[+] IMPLEMENTING DATA CLASSIFICATION...\n[+] Public: No restrictions\n[+] Internal: Authenticated users\n[+] Confidential: Role-based access\n[+] Restricted: MFA + approval required\n\n✓ Employee data marked CONFIDENTIAL\n✓ Salary data marked RESTRICTED\n✓ Access requires appropriate clearance`,
      defenseDeployed: "Data Classification System",
      blockedAttack: "Unauthorized Data Access"
    };
  }

  if (action === "isolate") {
    return {
      success: true,
      output: `[+] IMPLEMENTING DATA ISOLATION...\n[+] Network segmentation: ACTIVE\n[+] Database-level isolation: ENABLED\n[+] Query restrictions: CONFIGURED\n\n✓ Regular users cannot query employee tables\n✓ Cross-department data access blocked\n✓ HR data accessible to HR only`,
      defenseDeployed: "Data Isolation & Segmentation",
      blockedAttack: "Lateral Movement to Sensitive Data"
    };
  }

  if (action === "monitor") {
    return {
      success: true,
      output: `[+] ENABLING USER ACTIVITY MONITORING...\n[+] DLP system: DEPLOYED\n[+] Anomaly detection: ACTIVE\n[+] Behavior analytics: CONFIGURED\n\n✓ Unusual data access patterns flagged\n✓ Large data exports require approval\n✓ Real-time alerts for suspicious activity`,
      defenseDeployed: "Data Loss Prevention (DLP)",
      blockedAttack: "Insider Data Exfiltration"
    };
  }

  if (action === "audit") {
    return {
      success: true,
      output: `[+] CONFIGURED ACCESS AUDITING...\n[+] All data access: LOGGED\n[+] Access reviews: SCHEDULED\n[+] Privilege escalation: MONITORED\n\n✓ Complete audit trail of data access\n✓ Quarterly access reviews mandated\n✓ Excessive permissions flagged`,
      defenseDeployed: "Access Auditing & Review",
      blockedAttack: "Privilege Abuse"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: classify, isolate, monitor, audit`,
    defenseDeployed: null
  };
}

function handleAPIAttackDefense(userId, action, parameters) {
  if (action === "sanitize") {
    return {
      success: true,
      output: `[+] IMPLEMENTING INPUT SANITIZATION...\n[+] HTML encoding: ENABLED\n[+] Special chars: ESCAPED\n[+] Unicode normalization: ACTIVE\n\n✓ All user input sanitized\n✓ XSS payloads neutralized\n✓ Dangerous characters escaped`,
      defenseDeployed: "Input Sanitization",
      blockedAttack: "Cross-Site Scripting (XSS)"
    };
  }

  if (action === "parametrize") {
    return {
      success: true,
      output: `[+] IMPLEMENTING PARAMETERIZED QUERIES...\n[+] ORM: Active Record pattern\n[+] Query builder: TYPE-SAFE\n[+] Raw SQL: DISABLED\n\n✓ All queries use prepared statements\n✓ SQL injection payloads neutralized\n✓ Database access fully parameterized`,
      defenseDeployed: "Parameterized Queries (SQL Injection Prevention)",
      blockedAttack: "SQL Injection"
    };
  }

  if (action === "validate") {
    return {
      success: true,
      output: `[+] IMPLEMENTING INPUT VALIDATION...\n[+] Schema validation: ENFORCED\n[+] Type checking: STRICT\n[+] Length limits: ENFORCED\n\n✓ All API inputs validated against schema\n✓ Invalid types rejected immediately\n✓ Buffer overflows prevented`,
      defenseDeployed: "Strict Input Validation",
      blockedAttack: "Injection Attacks"
    };
  }

  if (action === "escape") {
    return {
      success: true,
      output: `[+] APPLYING OUTPUT ESCAPING...\n[+] Context-aware encoding: ENABLED\n[+] Content-Security-Policy: DEPLOYED\n[+] X-XSS-Protection: ACTIVE\n\n✓ Output properly encoded per context\n✓ CSP prevents inline script execution\n✓ Reflected XSS blocked`,
      defenseDeployed: "Output Escaping + CSP",
      blockedAttack: "Reflected XSS"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: sanitize, parametrize, validate, escape`,
    defenseDeployed: null
  };
}

function handleDataLossDefense(userId, action, parameters) {
  if (action === "backup") {
    return {
      success: true,
      output: `[+] IMPLEMENTING BACKUP STRATEGY...\n[+] Automated backups: EVERY 6 HOURS\n[+] Retention: 30 days\n[+] Off-site replication: ENABLED\n\n✓ Daily incremental backups\n✓ Weekly full backups\n✓ Point-in-time recovery available`,
      defenseDeployed: "Automated Backup System",
      blockedAttack: "Irreversible Data Deletion"
    };
  }

  if (action === "confirm") {
    return {
      success: true,
      output: `[+] IMPLEMENTING DELETION CONFIRMATION...\n[+] Two-factor confirmation: REQUIRED\n[+] Review period: 24 hours\n[+] Rollback available: YES\n\n✓ All deletion operations require confirmation\n✓ Email notification before deletion\n✓ 24-hour rollback window`,
      defenseDeployed: "Deletion Confirmation & Rollback",
      blockedAttack: "Accidental/Malicious Bulk Deletion"
    };
  }

  if (action === "snapshot") {
    return {
      success: true,
      output: `[+] ENABLING DATABASE SNAPSHOTS...\n[+] Snapshot schedule: DAILY\n[+] Manual snapshots: AVAILABLE\n[+] Cross-region copies: ENABLED\n\n✓ Pre-deletion snapshots automatic\n✓ Instant recovery from snapshot\n✓ Geo-redundant snapshot storage`,
      defenseDeployed: "Database Snapshots",
      blockedAttack: "Catastrophic Data Loss"
    };
  }

  if (action === "archive") {
    return {
      success: true,
      output: `[+] IMPLEMENTING DATA ARCHIVAL...\n[+] Soft delete: ENABLED\n[+] Archive period: 7 years\n[+] Immutable storage: ACTIVE\n\n✓ Deleted records archived, not removed\n✓ Audit trail preserved\n✓ Archived data tamper-proof`,
      defenseDeployed: "Soft Delete + Archival",
      blockedAttack: "Permanent Data Destruction"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: backup, confirm, snapshot, archive`,
    defenseDeployed: null
  };
}

function handleMITMDefense(userId, action, parameters) {
  if (action === "https") {
    return {
      success: true,
      output: `[+] ENFORCING HTTPS...\n[+] TLS 1.3: ENABLED\n[+] HTTP → HTTPS redirect: ACTIVE\n[+] HSTS: CONFIGURED\n\n✓ All traffic now encrypted\n✓ HTTP access disabled\n✓ Modern cipher suites only`,
      defenseDeployed: "TLS/HTTPS Enforcement",
      blockedAttack: "Man-in-the-Middle via HTTP"
    };
  }

  if (action === "hsts") {
    return {
      success: true,
      output: `[+] CONFIGURED HSTS...\n[+] Max-age: 1 year\n[+] IncludeSubDomains: YES\n[+] Preload: SUBMITTED\n\n✓ Browser remembers HTTPS-only for 1 year\n✓ No HTTP fallback possible\n✓ Prevents SSL stripping attacks`,
      defenseDeployed: "HTTP Strict Transport Security (HSTS)",
      blockedAttack: "SSL Stripping"
    };
  }

  if (action === "pinning") {
    return {
      success: true,
      output: `[+] IMPLEMENTING CERTIFICATE PINNING...\n[+] Pins configured: SHA-256 fingerprints\n[+] Backup pins: CONFIGURED\n[+] Validation: STRICT\n\n✓ Only pinned certificates accepted\n✓ MitM certificates rejected\n✓ Mobile app security enhanced`,
      defenseDeployed: "Certificate Pinning",
      blockedAttack: "Fake Certificate Injection"
    };
  }

  if (action === "cert-validate") {
    return {
      success: true,
      output: `[+] ENABLING CERTIFICATE VALIDATION...\n[+] Chain verification: STRICT\n[+] Hostname check: ENFORCED\n[+] Revocation check: OCSP + CRL\n\n✓ Invalid certificates rejected\n✓ Expired certificates blocked\n✓ Revoked certificates denied`,
      defenseDeployed: "Strict Certificate Validation",
      blockedAttack: "Certificate Bypass"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: https, hsts, pinning, cert-validate`,
    defenseDeployed: null
  };
}

function handleSharedVulnerabilityDefense(userId, action, parameters) {
  if (action === "isolate") {
    return {
      success: true,
      output: `[+] IMPLEMENTING CONTAINER ISOLATION...\n[+] Seccomp profiles: ENFORCED\n[+] AppArmor/SELinux: CONFIGURED\n[+] Capability dropping: ACTIVE\n\n✓ Containers cannot access host resources\n✓ Kernel calls restricted\n✓ Privilege escalation blocked`,
      defenseDeployed: "Container Isolation (Seccomp + AppArmor)",
      blockedAttack: "Container Escape"
    };
  }

  if (action === "segment") {
    return {
      success: true,
      output: `[+] IMPLEMENTING NETWORK SEGMENTATION...\n[+] Network policies: ENFORCED\n[+] Service mesh: ISTIO\n[+] Micro-segmentation: ACTIVE\n\n✓ Containers can only reach authorized services\n✓ East-west traffic filtered\n✓ No container-to-container default access`,
      defenseDeployed: "Network Segmentation + Service Mesh",
      blockedAttack: "Lateral Movement Between Containers"
    };
  }

  if (action === "namespaces") {
    return {
      success: true,
      output: `[+] ENABLING KERNEL NAMESPACES...\n[+] PID namespace: ISOLATED\n[+] Network namespace: ISOLATED\n[+] Mount namespace: PRIVATE\n\n✓ Each container has own process tree\n✓ Network interfaces isolated\n✓ Filesystem isolated`,
      defenseDeployed: "Kernel Namespace Isolation",
      blockedAttack: "Shared Kernel Exploit"
    };
  }

  if (action === "policy") {
    return {
      success: true,
      output: `[+] APPLYING SECURITY POLICIES...\n[+] PodSecurityPolicy: ENFORCED\n[+] Resource limits: CONFIGURED\n[+] Privilege escalation: DENIED\n\n✓ No privileged containers allowed\n✓ Root user prohibited\n✓ Host filesystem access blocked`,
      defenseDeployed: "Kubernetes Security Policies",
      blockedAttack: "Container Root Escape"
    };
  }

  return {
    success: false,
    output: `[-] Unknown defense action: ${action}\n[?] Available actions: isolate, segment, namespaces, policy`,
    defenseDeployed: null
  };
}

export const completeDefense = async (req, res) => {
  try {
    const { labSlug: requestedSlug, defensesDeployed } = req.body;
    const userId = req.user._id;
    const canonicalSlug = resolveDefenseSlug(requestedSlug);
    const lab = await Lab.findOne({ slug: requestedSlug }).select("_id category");

    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }

    const minDefenses = 2;
    if (!defensesDeployed || defensesDeployed.length < minDefenses) {
      return res.json({
        success: false,
        output: `[-] You must deploy at least ${minDefenses} defenses to complete this lab!\n[-] Current: ${defensesDeployed?.length || 0} defenses`,
        message: `Deploy at least ${minDefenses} different defenses`
      });
    }

    let progress = await Progress.findOne({ userId, labId: lab._id });
    if (!progress) {
      progress = await Progress.create({
        userId,
        labId: lab._id,
        status: "in-progress",
        startedAt: new Date()
      });
    }

    if (lab.category === "defense" && progress.status === "completed") {
      const user = await User.findById(userId).select("points");
      return res.json({
        success: true,
        output: `[+] Defense phase already completed for this lab!`,
        message: "Already completed",
        totalPoints: user?.points || 0
      });
    }

    if (lab.category !== "defense" && progress.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You must complete the attack phase first!"
      });
    }

    const pointsEarned = defensesDeployed.length * 25;
    const defenseFlag = `defense_${canonicalSlug}_${defensesDeployed.length}_layers`;
    progress.status = "completed";
    progress.completedAt = new Date();
    progress.lastAttempt = new Date();
    progress.score = Math.max(progress.score || 0, pointsEarned);
    await progress.save();

    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + pointsEarned;
      await user.save();
    }

    await Log.create({
      userId,
      labId: lab._id,
      action: "defense",
      input: JSON.stringify({ action: "complete", defensesDeployed, labSlug: requestedSlug }),
      output: JSON.stringify({ defenseFlag, pointsEarned }),
      success: true
    });

    res.json({
      success: true,
      output: `\n╔═══════════════════════════════════════════════════════════╗
║  🛡️  DEFENSE SUCCESSFUL!                                      ║
╚═══════════════════════════════════════════════════════════╝
\n[+] All selected defenses deployed successfully!\n[+] Attack vectors blocked!\n\n[+] Defenses Deployed:\n${defensesDeployed.map((d, i) => `    ${i + 1}. ${d}`).join('\n')}\n\n[+] Points Earned: +${pointsEarned}\n\n✓ Defense Flag: ${defenseFlag}
✓ Lab Complete!\n`,
      message: "Defense phase completed!",
      pointsEarned,
      defenseFlag,
      totalPoints: user?.points || 0
    });
  } catch (error) {
    console.error("Complete defense error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDefenseHint = async (req, res) => {
  const { labSlug: requestedSlug } = req.body;
  const labSlug = resolveDefenseSlug(requestedSlug);

  const hints = {
    "data-breach": [
      "Encrypt sensitive data at rest using AES-256",
      "Implement proper IAM policies and bucket policies",
      "Enable CloudTrail for audit logging"
    ],
    "account-hijacking": [
      "Enable multi-factor authentication (MFA)",
      "Implement rate limiting on login endpoints",
      "Set up account lockout policies"
    ],
    "misconfiguration": [
      "Implement role-based access control (RBAC)",
      "Add authorization middleware to all routes",
      "Disable debug mode in production"
    ],
    "ddos": [
      "Implement API rate limiting",
      "Use a CDN with DDoS protection",
      "Deploy a Web Application Firewall (WAF)"
    ],
    "malware-injection": [
      "Validate file types before upload",
      "Scan all uploaded files with antivirus",
      "Sandbox and isolate uploaded files"
    ],
    "insider-threat": [
      "Implement data classification system",
      "Use network segmentation for sensitive data",
      "Enable Data Loss Prevention (DLP)"
    ],
    "api-attack": [
      "Sanitize all user inputs",
      "Use parameterized queries (never raw SQL)",
      "Implement strict input validation"
    ],
    "data-loss": [
      "Implement automated backup strategy",
      "Require confirmation for destructive operations",
      "Enable database snapshots"
    ],
    "mitm": [
      "Enforce HTTPS with TLS 1.3",
      "Enable HSTS headers",
      "Implement certificate pinning"
    ],
    "shared-vulnerability": [
      "Enable container isolation (Seccomp, AppArmor)",
      "Implement network segmentation",
      "Use Kubernetes security policies"
    ]
  };

  res.json({
    hint: hints[labSlug]?.[0] || "No hint available",
    labSlug: requestedSlug,
    canonicalLabSlug: labSlug,
    availableActions: defenseStrategies[labSlug]?.actions || []
  });
};

export const getDefenseInfo = async (req, res) => {
  const { labSlug: requestedSlug } = req.params;
  const labSlug = resolveDefenseSlug(requestedSlug);
  const strategy = defenseStrategies[labSlug];

  if (!strategy) {
    return res.status(404).json({ message: "Lab not found" });
  }

  res.json({
    labSlug: requestedSlug,
    canonicalLabSlug: labSlug,
    name: strategy.name,
    description: strategy.description,
    actions: strategy.actions
  });
};
