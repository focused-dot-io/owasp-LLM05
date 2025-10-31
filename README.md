# LLM05 — Improper Output Handling (POC)

**Reference:** [OWASP LLM05:2025 Improper Output Handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)

Goal: demonstrate how unsafe rendering or execution of LLM outputs leads to XSS/data risks, and how simple guards (sanitization, schema validation, policies) mitigate them.

## What this repo demonstrates:

**Vulnerability:** trusting LLM output (HTML/Markdown, code, queries) without validation/sanitization.

**Impact:** XSS in a dashboard when LLM returns HTML; optional SQL injection if app executes model-generated SQL.

**Fixes:** sanitize rendered content, enforce content policies, validate structured output, parameterize any queries, add "human-in-the-loop" for risky actions.

## What's the Vulnerability?

Treating LLM output as trusted and directly rendering or executing it creates serious security risks. This PoC demonstrates two common examples, but these represent just a sample of the many issues that can arise from improper output handling:

- **Rendering HTML/Markdown without sanitization** → XSS attacks  
  When LLM-generated content containing malicious scripts is rendered directly in the browser, attackers can execute arbitrary JavaScript in users' browsers, steal sessions, or manipulate the DOM.

- **Executing generated SQL** *(optional demo)* → SQL injection/data loss  
  If an application runs LLM-generated database queries without validation or parameterization, attackers can manipulate the LLM to produce malicious SQL that deletes data, exfiltrates sensitive information, or compromises the database.

Other potential risks include remote code execution (when LLM output is passed to `eval()` or system shells), CSRF attacks, path traversal vulnerabilities, and more. See the [OWASP reference](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/) for additional attack scenarios.

**Core principle:** LLM output must be validated and sanitized like any other untrusted user input. Just because it comes from an AI model doesn't make it safe.

## How It Works

```
User ──> UI Form ──> /api/generate (Backend) ──> LLM API
                              │
                              └──> Returns Markdown/HTML
                                   │
                                   ├─> ❌ Unsafe Path: UI renders raw HTML
                                   │   └─> XSS vulnerability
                                   │
                                   └─> ✅ Safe Path: UI uses DOMPurify + CSP
                                       └─> User sees sanitized content
```

The application demonstrates both vulnerable and secure implementations side-by-side, allowing you to see the difference in behavior and understand how proper output handling prevents attacks.

## Mitigations Implemented

This PoC demonstrates the two essential security controls that prevent XSS from improper output handling:

### 1. **Sanitize Before Render (DOMPurify)**
Strip dangerous elements before displaying LLM output in the browser:

```javascript
DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title']
})
```

This removes `<script>` tags, event handlers, and other XSS vectors while preserving safe formatting.

### 2. **Content Security Policy (CSP) Headers**
Default-deny inline scripts and restrict resource loading:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
```

Even if malicious content bypasses sanitization, CSP prevents inline scripts from executing.

### Interactive Controls

The UI includes toggle switches to demonstrate different security configurations:

- **Renderer Mode**: `UnsafeRenderer` vs `SanitizedRenderer`
- **CSP Enforcement**: `off` | `report-only` | `enforced`

These controls let you see exactly how each mitigation affects the handling of malicious LLM output.

### Additional Hardening Options

For production applications, consider layering additional defenses:
- Structured output validation (validate JSON schema before rendering)
- Human-in-the-loop review for high-risk content
- Parameterized queries if executing LLM-generated SQL

## Quick Start

This PoC consists of a React frontend (Vite) and a Python backend (Flask/FastAPI).

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- An LLM API key (OpenAI, Anthropic, etc.)

### Setup

**1. Clone and install dependencies:**

```bash
# Frontend setup
npm create vite@latest frontend -- --template react
cd frontend
npm install dompurify marked
npm install -D vitest @testing-library/react @testing-library/jest-dom
cd ..

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

**2. Configure environment variables:**

```bash
cp .env.example .env
```

**3. Run the application:**

```bash
# Terminal 1 - Start backend (port 5000)
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Start frontend (port 5173)
cd frontend
npm run dev
```

### Available Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run unit tests (sanitization/validation tests)

# Backend
python app.py        # Start API server
pytest               # Run backend tests
pytest test_attacks.py  # Run attack scenario tests
```

<!-- TODO: Add section for running the attack scenarios once implemented -->
<!-- TODO: Document expected vs actual behavior for each vulnerability demo -->