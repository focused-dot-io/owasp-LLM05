import { useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:5000/api/generate'

function App() {
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
      setResponse(data.content || '')
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>LLM05: Improper Output Handling PoC</h1>
        <p>Demonstrating XSS vulnerability from unsafe LLM output rendering</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-group">
            <label htmlFor="prompt">Enter your prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Try: 'Just say hello' or 'Write some HTML with a script tag'"
              rows={4}
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
          <div className="response-section">
            <h2>LLM Response (Unsafe Render):</h2>
            <div 
              className="response-content unsafe"
              dangerouslySetInnerHTML={{ __html: response }}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
