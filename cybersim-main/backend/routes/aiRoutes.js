import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const labHints = {
  "sql-injection": {
    hint: "💉 SQL Injection Tip:",
    messages: [
      "The query is vulnerable because user input is directly concatenated. Try escaping the query with: ' OR '1'='1",
      "In SQL, OR 1=1 always evaluates to true, making the query return all rows.",
      "Try payload: admin' OR '1'='1"
    ]
  },
  "xss-reflection": {
    hint: "⚠️ XSS Tip:",
    messages: [
      "Script tags can execute JavaScript in the browser context.",
      "Try: <script>alert('XSS')</script>",
      "HTML entities won't be encoded in the reflection point."
    ]
  },
  "command-injection": {
    hint: "💻 Command Injection Tip:",
    messages: [
      "Command separators like ; | & can chain multiple commands.",
      "Try: ; ls or | cat /etc/passwd",
      "The shell interprets everything after the separator."
    ]
  },
  "directory-traversal": {
    hint: "📁 Directory Traversal Tip:",
    messages: [
      "Use ../ to go up one directory level.",
      "Try: ../../../etc/passwd",
      "URL encode special characters: %2e%2e%2f for ../"
    ]
  }
};

const contextAwareResponses = {
  "sql-injection": {
    topic: "SQL Injection",
    explanation: "SQL injection exploits vulnerabilities in database queries by inserting malicious SQL code through user input fields. The attacker can bypass authentication, extract data, or modify the database.",
    prevention: "Use parameterized queries (prepared statements) that separate code from data, preventing user input from being interpreted as SQL commands.",
    example: "❌ Vulnerable: query = `SELECT * FROM users WHERE username = '${input}'`\n✅ Secure: query = `SELECT * FROM users WHERE username = ?`"
  },
  "xss-reflection": {
    topic: "Cross-Site Scripting (XSS)",
    explanation: "XSS attacks inject malicious scripts into web pages that are then executed in the victim's browser. This can steal cookies, session tokens, or redirect users.",
    prevention: "Encode HTML entities (< becomes &lt;, > becomes &gt;, etc.) and implement Content Security Policy headers.",
    example: "❌ Vulnerable: element.innerHTML = userInput\n✅ Secure: element.textContent = userInput"
  },
  "command-injection": {
    topic: "Command Injection",
    explanation: "Command injection occurs when an application passes unsafe user input to system shell commands. Attackers can execute arbitrary commands on the server.",
    prevention: "Avoid shell commands when possible. If needed, use allowlists and avoid user input in command arguments.",
    example: "❌ Vulnerable: exec('ls ' + userInput)\n✅ Secure: Use execFile() with array arguments"
  },
  "directory-traversal": {
    topic: "Directory Traversal",
    explanation: "Also known as path traversal, this vulnerability allows attackers to access files outside the intended directory by manipulating file paths with sequences like ../",
    prevention: "Validate and sanitize file paths, use realpath() to resolve paths, and implement chroot jails.",
    example: "❌ Vulnerable: serveFile('/uploads/' + userFilename)\n✅ Secure: Validate filename against allowlist, use path.join() with base directory"
  }
};

router.post('/assist', protect, async (req, res) => {
  try {
    const { message, currentLab, labCategory } = req.body;
    const lowerMessage = (message || '').toLowerCase();

    let response = {
      text: '',
      hint: null,
      context: null
    };

    if (currentLab && labHints[currentLab]) {
      const labHint = labHints[currentLab];
      
      if (lowerMessage.includes('hint') || lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
        const hintIndex = Math.min(
          lowerMessage.split('hint').length - 1 || 0,
          labHint.messages.length - 1
        );
        response.hint = `${labHint.hint} ${labHint.messages[hintIndex]}`;
      }

      if (lowerMessage.includes('explain') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
        const context = contextAwareResponses[currentLab];
        if (context) {
          response.context = context;
          response.text = `📚 **${context.topic}**\n\n${context.explanation}\n\n🛡️ **Prevention:**\n${context.prevention}\n\n\`\`\`\n${context.example}\n\`\`\``;
        }
      }
    }

    if (!response.text) {
      const genericResponses = [
        "🔍 I'm here to help! Try asking about specific techniques or say 'give me a hint' for the current lab.",
        "💡 Need help? Ask about SQL injection, XSS, command injection, or directory traversal.",
        "🎯 Focus on understanding the vulnerability type and think about how user input flows through the system.",
        "⚡ Break the problem down: What input would bypass the current check?"
      ];
      
      if (lowerMessage.includes('not working') || lowerMessage.includes("doesn't work")) {
        response.text = "🤔 Let's debug together:\n1. What input are you using?\n2. What error or unexpected behavior are you seeing?\n3. Have you tried basic payloads for this vulnerability type?";
      } else if (lowerMessage.includes('how') && lowerMessage.includes('start')) {
        response.text = "🚀 Starting strategy:\n1. Read the lab instructions carefully\n2. Understand what vulnerability to exploit\n3. Try a basic payload first\n4. If stuck, ask for a hint!";
      } else {
        response.text = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }
    }

    res.json({
      success: true,
      response: response.text,
      hint: response.hint,
      context: response.context,
      labContext: currentLab ? { slug: currentLab, category: labCategory } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are CyberSim AI Assistant, an expert cybersecurity trainer. Be concise, helpful, and educational. Use emojis sparingly. Focus on teaching concepts, not giving away answers directly.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const fallbackResponse = getFallbackResponse(message);
    res.json({
      success: true,
      response: fallbackResponse,
      fallback: true
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getFallbackResponse(message) {
  const lowerMessage = (message || '').toLowerCase();
  
  const responses = {
    sql: "💉 SQL Injection exploits vulnerabilities in database queries. Try: ' OR '1'='1 to bypass authentication. For defense, use parameterized queries!",
    xss: "⚠️ XSS (Cross-Site Scripting) injects malicious scripts. Try: <script>alert('XSS')</script>. For defense, encode HTML entities!",
    command: "💻 Command injection occurs when user input reaches system commands. Try: ; ls or | cat /etc/passwd. Use execFile() with array args for defense!",
    directory: "📁 Directory traversal accesses files outside the web root. Try: ../../../etc/passwd. Validate paths and use chroot for defense!",
    lab: "🧪 Available labs: SQL Injection, XSS, Command Injection, Directory Traversal (Attack) and their Defense counterparts. Start a lab to begin!",
    default: "🎯 I'm your cybersecurity assistant! Ask about:\n- Specific attack techniques\n- How to defend against attacks\n- Lab hints and guidance\n- Security concepts"
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) return response;
  }
  return responses.default;
}

export default router;
