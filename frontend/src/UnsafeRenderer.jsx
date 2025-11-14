import { useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/api/generate'

function UnsafeRenderer() {
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
      console.log('🔴 Unsafe Renderer - Raw LLM Response:', rawContent)
      setResponse(rawContent)
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="renderer-container unsafe">
      <h3>Unsafe Renderer</h3>
      
      <form onSubmit={handleSubmit} className="renderer-form">
        <div className="form-group">
          <label htmlFor="unsafe-prompt">Enter prompt:</label>
          <textarea
            id="unsafe-prompt"
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
        <div className="response-content unsafe">
          <div dangerouslySetInnerHTML={{ __html: response }} />
        </div>
      )}
    </div>
  )
}

export default UnsafeRenderer
