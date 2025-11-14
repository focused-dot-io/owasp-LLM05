# Development & Testing Specification

## Overview

This document contains technical specifications for implementing and testing the LLM05 Improper Output Handling PoC.

### Attack Scenarios

#### SQL Injection
**User Action**: Coerce LLM to generate malicious SQL query  
**Expected Result (Unsafe)**: Database operation executes (data loss/exfiltration)  
**Expected Result (Safe)**: Query is parameterized or validated


## Frameworks & Libraries

### Core Dependencies

**Frontend (React/Vite):**
- **DOMPurify** - HTML/DOM sanitization (browser + server compatible)
- **marked** or **markdown-it** - Markdown parsing with tight config; sanitize post-render
- **vitest** + **@testing-library/react** - Testing framework

**Backend (Python):**
- **Flask** or **FastAPI** - Web framework
- **openai** or **anthropic** - LLM SDK (or your preferred provider)
- **pytest** - Testing framework
- **python-dotenv** - Environment variable management

### Security Headers (Optional Enhancement)
- **Helmet** (Node.js) - Easy CSP, X-Frame-Options, etc. configuration
- For Python: Set CSP headers manually in Flask/FastAPI middleware

### Additional Libraries (Optional Features)

**Schema Validation:**
- **Zod** (TypeScript/JavaScript) - Runtime schema validation for structured outputs
- **Ajv** - JSON schema validator

**Policy Engine:**
- Simple approach: allowlists/regex for content filtering
- Advanced: **OPA/Rego** for policy-as-code enforcement

### Reference Resources
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Environment Variables

```bash
# .env.example
LLM_API_KEY=your-api-key-here
LLM_PROVIDER=openai  # or anthropic, etc.
LLM_MODEL=gpt-4      # or claude-3-sonnet, etc.
FLASK_ENV=development
FLASK_DEBUG=1
```

## Architecture Notes

### Data Flow
1. User submits prompt in React UI
2. Frontend sends POST request to `/api/generate`
3. Backend calls LLM API with user prompt
4. Backend returns raw LLM response (JSON)
5. Frontend renders response in selected mode (safe/unsafe)


## Optional Add-On: Natural Language → SQL Demo

**Goal**: Demonstrate why executing raw LLM-generated SQL is dangerous and how structured outputs + parameterization prevent SQL injection.

### Keep It Light
This is a minimal secondary demo to complement the primary XSS vulnerability.

### Vulnerable Path
1. User prompt: "Show me all pro users"
2. LLM returns raw SQL string: `SELECT * FROM users WHERE plan='pro'`
3. App executes the SQL directly → **SQL injection vulnerability**

### Mitigated Path
1. User prompt: "Show me all pro users"
2. LLM returns **structured intent** (JSON):
   ```json
   {
     "op": "select",
     "table": "users",
     "columns": ["id", "email"],
     "filters": [
       {"col": "plan", "op": "=", "val": "pro"}
     ],
     "limit": 50
   }
   ```
3. Validate schema with **Zod** (frontend) or **Pydantic** (backend)
4. Build parameterized SQL with a query builder (e.g., **SQLAlchemy**, **Knex**, **Prisma**)
5. Execute safe query → **SQL injection prevented**

### Attack Scenario
**Attack button**: "Suggest dangerous query"

Attempts to coerce LLM to generate malicious SQL:
- `'; DROP TABLE users; --`
- `' OR 1=1 --`
- `UNION SELECT password FROM admin_users`

**Expected Results:**
- **Vulnerable path**: Query executes, data leaked/destroyed
- **Mitigated path**: 
  - Invalid JSON schema → rejected
  - Suspicious operators/tables → blocked by allowlist
  - Query builder uses parameterization → injection neutralized

### Implementation Tasks
- [ ] Create simple SQLite database with sample data
- [ ] Add `/api/query` endpoint (vulnerable version)
- [ ] Add `/api/query-safe` endpoint (structured + parameterized)
- [ ] Add LLM prompt that requests structured JSON output
- [ ] Implement Zod/Pydantic schema validation
- [ ] Use query builder (SQLAlchemy recommended for Python)
- [ ] Add UI toggle: "Execute Raw SQL" vs "Use Structured Query"
- [ ] Add "Dangerous Query" attack button

### Database Schema (Simple Example)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL,  -- 'free', 'pro', 'enterprise'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Python Example (Safe Path)
```python
from pydantic import BaseModel
from sqlalchemy import select, and_

class QueryIntent(BaseModel):
    op: Literal["select"]
    table: str
    columns: list[str]
    filters: list[dict]
    limit: int

# Validate LLM output
intent = QueryIntent(**llm_response)

# Allowlist validation
if intent.table not in ["users"]:
    raise ValueError("Table not allowed")

# Build parameterized query with SQLAlchemy
stmt = select(*[getattr(User, col) for col in intent.columns])
for f in intent.filters:
    stmt = stmt.where(getattr(User, f["col"]) == f["val"])
stmt = stmt.limit(intent.limit)

# Execute safely
results = session.execute(stmt).fetchall()
```

## Future Enhancements

- [ ] Create automated test suite that runs all attack scenarios
- [ ] Add video walkthrough of attack scenarios
- [ ] Add more XSS payload examples (CSRF, path traversal)

