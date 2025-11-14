import { useState } from 'react'
import DOMPurify from 'dompurify'

const API_URL = 'http://127.0.0.1:5000/api/generate'

function SafeRenderer() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      const rawContent = data.content || ''
      console.log('🟢 Safe Renderer - Raw LLM Response:', rawContent)
      setResponse(rawContent)
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sanitize HTML before rendering
  const sanitized = response ? DOMPurify.sanitize(response, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title']
  }) : ''
  
  // Log sanitized output for comparison
  if (response && sanitized !== response) {
    console.log('🟢 Safe Renderer - After DOMPurify Sanitization:', sanitized)
    console.log('🟢 Safe Renderer - Original length:', response.length, '| Sanitized length:', sanitized.length)
    console.log('🟢 Safe Renderer - DOMPurify removed dangerous content!')
  } else if (response) {
    console.log('🟢 Safe Renderer - No changes after sanitization (already safe)')
  }

  return (
    <div className="renderer-container safe">
      <h3>Safe Renderer (DOMPurify)</h3>
      
      <form onSubmit={handleSubmit} className="renderer-form">
        <div className="form-group">
          <label htmlFor="safe-prompt">Enter prompt:</label>
          <textarea
            id="safe-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Try XSS prompts from DEMO_PROMPTS.md"
            rows={3}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="response-content safe">
          <div dangerouslySetInnerHTML={{ __html: sanitized }} />
        </div>
      )}
    </div>
  )
}

export default SafeRenderer
