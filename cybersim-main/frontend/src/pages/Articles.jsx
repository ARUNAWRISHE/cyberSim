import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import './Articles.css';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch articles from backend API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articlesAPI.getArticles();
        
        // Handle both direct array and object with articles property
        const articlesData = Array.isArray(response.data) ? response.data : response.data?.articles || [];
        
        setArticles(articlesData);
        setFilteredArticles(articlesData);
      } catch (error) {
        console.error('Error fetching articles:', error);
        // Fallback to mock data if API fails
        const mockArticles = [
          // Attack Articles
          {
            id: 1,
            title: "Introduction to SQL Injection",
            slug: "intro-sql-injection",
            category: "attack",
            difficulty: "beginner",
            description: "Learn the basics of SQL injection attacks and how they work in web applications.",
            content: "SQL injection is one of the most common web application vulnerabilities...",
            tags: ["sql", "injection", "web-security", "owasp"],
            readTime: 8,
            author: "CyberSim Team",
            createdAt: "2024-01-15",
            practiceLink: "/attack/sql-injection"
          },
          {
            id: 2,
            title: "Cross-Site Scripting (XSS) Attacks",
            slug: "xss-attacks",
            category: "attack",
            difficulty: "beginner",
            description: "Understand XSS vulnerabilities and learn to exploit them in web applications.",
            content: "Cross-Site Scripting (XSS) attacks inject malicious scripts...",
            tags: ["xss", "javascript", "web-security", "client-side"],
            readTime: 10,
            author: "CyberSim Team",
            createdAt: "2024-01-14",
            practiceLink: "/attack/xss"
          },
          {
            id: 3,
            title: "Command Injection Techniques",
            slug: "command-injection",
            category: "attack",
            difficulty: "intermediate",
            description: "Learn how to exploit command injection vulnerabilities in web applications.",
            content: "Command injection occurs when user input is passed to system commands...",
            tags: ["command-injection", "system", "exploitation", "shell"],
            readTime: 12,
            author: "CyberSim Team",
            createdAt: "2024-01-13",
            practiceLink: "/attack/command-injection"
          },
          {
            id: 4,
            title: "Directory Traversal Attacks",
            slug: "directory-traversal",
            category: "attack",
            difficulty: "intermediate",
            description: "Exploit path traversal vulnerabilities to access unauthorized files.",
            content: "Directory traversal attacks allow attackers to access files...",
            tags: ["path-traversal", "file-access", "web-security", "lfi"],
            readTime: 9,
            author: "CyberSim Team",
            createdAt: "2024-01-12",
            practiceLink: "/attack/directory-traversal"
          },
          {
            id: 5,
            title: "Penetration Testing Methodology",
            slug: "penetration-testing-methodology",
            category: "attack",
            difficulty: "advanced",
            description: "Systematic approach to ethical hacking and penetration testing.",
            content: "A structured approach to identifying and exploiting vulnerabilities...",
            tags: ["pentest", "methodology", "ethical-hacking", "tools"],
            readTime: 15,
            author: "CyberSim Team",
            createdAt: "2024-01-11",
            practiceLink: "/attack/pentest"
          },
          {
            id: 6,
            title: "Web Application Security Testing",
            slug: "web-application-security-testing",
            category: "attack",
            difficulty: "intermediate",
            description: "Comprehensive guide to testing web application security.",
            content: "Web application security testing involves identifying vulnerabilities...",
            tags: ["web-security", "testing", "owasp", "vulnerabilities"],
            readTime: 14,
            author: "CyberSim Team",
            createdAt: "2024-01-10",
            practiceLink: "/attack/pentest"
          },

          // Defense Articles
          {
            id: 7,
            title: "System Hardening Fundamentals",
            slug: "system-hardening-fundamentals",
            category: "defense",
            difficulty: "beginner",
            description: "Essential steps to secure and harden your systems against cyber threats.",
            content: "System hardening is the process of securing a system...",
            tags: ["hardening", "security", "linux", "defense"],
            readTime: 10,
            author: "CyberSim Team",
            createdAt: "2024-01-09",
            practiceLink: "/defense/system-hardening"
          },
          {
            id: 8,
            title: "Network Security Configuration",
            slug: "network-security-config",
            category: "defense",
            difficulty: "intermediate",
            description: "Configure firewalls, IDS, and network monitoring for robust security.",
            content: "Network security involves multiple layers of protection...",
            tags: ["network", "firewall", "ids", "monitoring"],
            readTime: 14,
            author: "CyberSim Team",
            createdAt: "2024-01-08",
            practiceLink: "/defense/network-security"
          },
          {
            id: 9,
            title: "Incident Response Planning",
            slug: "incident-response-planning",
            category: "defense",
            difficulty: "intermediate",
            description: "How to prepare for and respond to security incidents effectively.",
            content: "Effective incident response minimizes damage and reduces recovery time...",
            tags: ["incident-response", "security", "planning", "forensics"],
            readTime: 11,
            author: "CyberSim Team",
            createdAt: "2024-01-07",
            practiceLink: "/defense/incident-response"
          },
          {
            id: 10,
            title: "Web Application Security Testing",
            slug: "web-app-security-testing",
            category: "defense",
            difficulty: "advanced",
            description: "Comprehensive guide to testing web applications for security vulnerabilities.",
            content: "Web application security testing involves multiple approaches...",
            tags: ["web-security", "testing", "owasp", "vulnerability-assessment"],
            readTime: 16,
            author: "CyberSim Team",
            createdAt: "2024-01-06",
            practiceLink: "/defense/web-app-testing"
          },
          {
            id: 11,
            title: "Malware Analysis & Detection",
            slug: "malware-analysis",
            category: "defense",
            difficulty: "advanced",
            description: "Learn to analyze, detect, and respond to malware threats.",
            content: "Malware analysis is crucial for understanding threats...",
            tags: ["malware", "analysis", "detection", "reverse-engineering"],
            readTime: 18,
            author: "CyberSim Team",
            createdAt: "2024-01-05",
            practiceLink: "/defense/malware-analysis"
          },
          {
            id: 12,
            title: "SOC Log Monitoring and SIEM Triage",
            slug: "soc-log-monitoring-siem-triage",
            category: "defense",
            difficulty: "intermediate",
            description: "Learn practical SOC workflows for triaging brute-force and beaconing alerts.",
            content: "SOC triage combines log analysis, network validation, and targeted containment...",
            tags: ["siem", "soc", "log-analysis", "detection", "incident-response"],
            readTime: 13,
            author: "CyberSim Team",
            createdAt: "2024-01-04",
            practiceLink: "/defense/log-monitoring-siem"
          },
          {
            id: 13,
            title: "Ransomware Containment and Recovery",
            slug: "ransomware-containment-recovery",
            category: "defense",
            difficulty: "advanced",
            description: "Practice realistic containment, evidence collection, and backup recovery actions.",
            content: "Ransomware response requires speed, discipline, and recovery planning...",
            tags: ["ransomware", "containment", "recovery", "forensics", "backup"],
            readTime: 15,
            author: "CyberSim Team",
            createdAt: "2024-01-03",
            practiceLink: "/defense/ransomware-containment"
          }
        ];
        setArticles(mockArticles);
        setFilteredArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
    
    // Force scroll to top when component mounts
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, []);

  // Filter articles based on category, difficulty, and search term
  useEffect(() => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(article => article.difficulty === selectedDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Debug logging - keep minimal for production
    if (articles.length > 0) {
      console.log('Articles loaded:', {
        total: articles.length,
        attack: articles.filter(a => a.category === 'attack').length,
        defense: articles.filter(a => a.category === 'defense').length
      });
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, selectedDifficulty, searchTerm]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#0066FF',
      intermediate: '#FFA502',
      advanced: '#FF4757'
    };
    return colors[difficulty] || '#8892B0';
  };

  const getPracticeLink = (article) => {
    if (article.practiceLink) return article.practiceLink;

    const slugToPath = {
      'intro-sql-injection': '/lab/sql-injection',
      'xss-fundamentals': '/lab/xss-reflection',
      'xss-attacks': '/lab/xss-reflection',
      'command-injection': '/lab/command-injection',
      'command-injection-attacks': '/lab/command-injection',
      'directory-traversal': '/lab/directory-traversal',
      'directory-traversal-vulnerabilities': '/lab/directory-traversal',
      'penetration-testing-methodology': '/lab/shared-vulnerability',
      'web-application-security-testing': '/lab/api-attack',
      'system-hardening-fundamentals': '/defense/system-hardening',
      'network-security-config': '/defense/network-security',
      'network-security-monitoring': '/defense/network-security',
      'incident-response-planning': '/defense/incident-response',
      'web-app-security-testing': '/defense/web-app-testing',
      'malware-analysis': '/defense/malware-analysis',
      'soc-log-monitoring-siem-triage': '/defense/log-monitoring-siem',
      'ransomware-containment-recovery': '/defense/ransomware-containment'
    };

    if (slugToPath[article.slug]) return slugToPath[article.slug];
    return article.category === 'defense' ? '/defense/system-hardening' : '/learn';
  };

  if (loading) {
    return (
      <div className="articles-loading">
        <div className="loading-spinner"></div>
        <p>Loading Intel Base articles...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="articles-loading">
        <div className="no-articles-icon">📚</div>
        <h3>No Articles Available</h3>
        <p>Unable to load articles from the Intel Base. Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn primary"
          style={{ marginTop: '1rem' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="articles-container">
      {/* Header Section */}
      <div className="articles-header">
        <div className="header-content">
          <h1>Intel Base - Cybersecurity Knowledge</h1>
          <p>Access classified cybersecurity intelligence, attack strategies, and defense protocols from our comprehensive knowledge base</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-number">{articles.length}</div>
            <div className="stat-label">Articles</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">∞</div>
            <div className="stat-label">Practice Labs</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="articles-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search intel database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="attack">Attack Techniques</option>
            <option value="defense">Defense Strategies</option>
            <option value="cloud">Cloud Security</option>
            <option value="tools">Tools & Methods</option>
            <option value="fundamentals">Fundamentals</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Articles Sections */}
      <div className="articles-sections">
        {/* Attack Articles Section */}
        <div className="articles-section attack-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">⚔️</span>
              <h2>Attack Techniques</h2>
            </div>
            <p>Learn offensive security methods and ethical hacking techniques</p>
          </div>
          
          <div className="articles-grid">
            {filteredArticles.filter(article => article.category === 'attack').length > 0 ? (
              filteredArticles.filter(article => article.category === 'attack').map((article) => (
                <div key={article.id} className="article-card attack-card">
                  <div className="article-header">
                    <div className="article-category attack">
                      <span className="category-icon">⚔️</span>
                      <span className="category-name">Attack</span>
                    </div>
                    <div 
                      className="article-difficulty"
                      style={{ color: getDifficultyColor(article.difficulty) }}
                    >
                      {article.difficulty}
                    </div>
                  </div>

                  <div className="article-content">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-description">{article.description}</p>

                    <div className="article-tags">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="article-tag">#{tag}</span>
                      ))}
                    </div>

                    <div className="article-meta">
                      <div className="meta-item">
                        <span className="meta-icon">👤</span>
                        <span>{article.author}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{article.readTime} min read</span>
                      </div>
                    </div>
                  </div>

                  <div className="article-actions">
                    <Link to={`/articles/${article.slug}`} className="btn ghost">
                      Read Article
                    </Link>
                    <Link to={getPracticeLink(article)} className="btn primary">
                      <span className="practice-icon">🚀</span>
                      Practice Lab
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-articles">
                <div className="no-articles-icon">⚔️</div>
                <h3>No Attack Articles Found</h3>
                <p>Try adjusting your filters to see more articles</p>
              </div>
            )}
          </div>
        </div>

        {/* Defense Articles Section */}
        <div className="articles-section defense-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">🛡️</span>
              <h2>Defense Strategies</h2>
            </div>
            <p>Master defensive security practices and system hardening techniques</p>
          </div>
          
          <div className="articles-grid">
            {filteredArticles.filter(article => article.category === 'defense').length > 0 ? (
              filteredArticles.filter(article => article.category === 'defense').map((article) => (
                <div key={article.id} className="article-card defense-card">
                  <div className="article-header">
                    <div className="article-category defense">
                      <span className="category-icon">🛡️</span>
                      <span className="category-name">Defense</span>
                    </div>
                    <div 
                      className="article-difficulty"
                      style={{ color: getDifficultyColor(article.difficulty) }}
                    >
                      {article.difficulty}
                    </div>
                  </div>

                  <div className="article-content">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-description">{article.description}</p>

                    <div className="article-tags">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="article-tag">#{tag}</span>
                      ))}
                    </div>

                    <div className="article-meta">
                      <div className="meta-item">
                        <span className="meta-icon">👤</span>
                        <span>{article.author}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{article.readTime} min read</span>
                      </div>
                    </div>
                  </div>

                  <div className="article-actions">
                    <Link to={`/articles/${article.slug}`} className="btn ghost">
                      Read Article
                    </Link>
                    <Link to={getPracticeLink(article)} className="btn primary">
                      <span className="practice-icon">🚀</span>
                      Practice Lab
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-articles">
                <div className="no-articles-icon">🛡️</div>
                <h3>No Defense Articles Found</h3>
                <p>Try adjusting your filters to see more articles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="articles-cta">
        <div className="cta-content">
          <h2>Ready to Practice?</h2>
          <p>Put your knowledge to the test with our interactive cybersecurity simulations</p>
          <div className="cta-actions">
            <Link to="/learn" className="btn primary large">
              Start Simulations
            </Link>
            <Link to="/dashboard" className="btn ghost large">
              View Progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}