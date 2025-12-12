# Blog Post Checklist

This document contains notes and requirements for writing the blog post based on this PoC.

## Required Assets

### Screenshots to Capture

- [ ] **Unsafe XSS Alert** - Browser showing `alert('pwned')` popup in unsafe render mode
- [ ] **Sanitized Output** - Same payload in safe mode, showing neutralized/escaped content
- [ ] **CSP Report Log** - Console/logs showing blocked inline script attempts from CSP violations

### Optional Screenshots
- [ ] Side-by-side comparison of unsafe vs safe renderer UI
- [ ] Toggle switches showing different security configurations
- [ ] Direct injection demo (bypasses LLM, proves renderer is the issue)
- [ ] Network tab showing LLM API request/response

## Code Excerpts to Include

### 1. SafeRenderer Component
Show the React component using DOMPurify:

```javascript
import { useState } from 'react'
import DOMPurify from 'dompurify'

function SafeRenderer() {
  const [response, setResponse] = useState('')
  
  // Sanitize HTML before rendering
  const sanitized = response ? DOMPurify.sanitize(response, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title']
  }) : ''
  
  return (
    <div className="response-content safe">
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  )
}
```

### 2. CSP Meta Tag Configuration
Show CSP set via meta tag in HTML (frontend/index.html):

```html
<!-- Uncomment to enable CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self'; 
               connect-src 'self' http://127.0.0.1:5000;">
```

**Note:** CSP is configured in the frontend HTML file, not backend headers. Uncomment the meta tag to enable CSP protection.

### 3. Unsafe vs Safe Comparison
Side-by-side code showing the vulnerability:

```javascript
// ❌ UNSAFE - Direct rendering (UnsafeRenderer.jsx)
<div dangerouslySetInnerHTML={{ __html: response }} />

// ✅ SAFE - Sanitized rendering (SafeRenderer.jsx)
const sanitized = DOMPurify.sanitize(response, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'title']
})
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

**Key difference:** UnsafeRenderer renders raw LLM output directly, while SafeRenderer sanitizes with DOMPurify before rendering.

## Key Messaging

### Opening Hook
Start with a relatable scenario: "You've built an AI-powered dashboard that summarizes documents. The LLM returns formatted content, so you render it as HTML. What could go wrong?"

### Core Message (1 Paragraph)
**"Treat LLM output like user input"**

Large language models can be manipulated through prompt injection to return malicious content. Just like you wouldn't trust raw user input in a form field, you shouldn't trust LLM output without validation and sanitization. An attacker can craft prompts that coerce the model into generating XSS payloads, SQL injection, or other dangerous code. The solution is simple: apply the same security controls you'd use for untrusted user data—sanitization, content security policies, and structured validation.

### Technical Takeaways

1. **XSS is real in LLM applications** - Models can be prompted to generate `<script>` tags
2. **Defense in depth works** - Layer DOMPurify + CSP for maximum protection
3. **Structured outputs are safer** - JSON schemas prevent freeform dangerous content
4. **This applies beyond XSS** - SQL injection, RCE, SSRF are all possible with improper output handling

## Required Links

Include these references in the blog post:

- [ ] [OWASP LLM Top 10](https://genai.owasp.org/llmrisk/)
- [ ] [OWASP LLM05:2025 Improper Output Handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)
- [ ] [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [ ] [Content Security Policy (CSP) Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [ ] [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [ ] [xkcd: Exploits of a Mom (Little Bobby Tables)](https://xkcd.com/327/) - Classic injection comic
- [ ] Link to this GitHub repo (when published)

## Blog Post Structure (Suggested)

### 1. Introduction (Hook)
- Real-world scenario where LLM output causes XSS
- Why this matters: LLMs are being integrated everywhere

### 2. The Vulnerability Explained
- What is improper output handling?
- Why LLM output is untrusted
- Attack scenario walkthrough

### 3. Live Demo
- Screenshots of the PoC
- Unsafe render → XSS alert
- Safe render → neutralized
- CSP violations in logs

### 4. The Fix (Technical Details)
- Code excerpt: DOMPurify sanitization
- Code excerpt: CSP headers
- Explanation of defense-in-depth

### 5. Broader Implications
- Other OWASP LLM05 attack vectors (SQL injection, RCE, SSRF, etc.)
- Why this applies to agents, RAG systems, code generation tools

### 6. Call to Action
- Try the PoC yourself (link to repo)
- Review your own LLM integrations
- Apply these mitigations today

### 7. Resources
- Links to OWASP, DOMPurify, etc.

## Style Guidelines

- **Tone**: Educational but approachable; assume reader has some dev experience
- **Code formatting**: Use syntax highlighting, keep snippets short
- **Screenshots**: Annotate with arrows/boxes to highlight key elements
- **Length**: Aim for 1000-1500 words (5-7 minute read)
- **SEO keywords**: LLM security, prompt injection, XSS, OWASP LLM05, AI security

## Pre-Publish Checklist

- [ ] All code examples tested and working
- [ ] Screenshots captured and annotated
- [ ] Links verified (no 404s)
- [ ] Spell check and grammar review
- [ ] Someone else reviewed for clarity
- [ ] GitHub repo is public and ready to share
- [ ] .env.example file exists with clear instructions
- [ ] README.md is polished and complete

