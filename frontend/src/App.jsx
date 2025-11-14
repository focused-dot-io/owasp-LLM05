import './App.css'
import UnsafeRenderer from './UnsafeRenderer'
import SafeRenderer from './SafeRenderer'

function App() {
  return (
    <div className="app">
      <header>
        <h1>LLM05: Improper Output Handling PoC</h1>
        <p>Demonstrating XSS vulnerability from unsafe LLM output rendering</p>
      </header>

      <main>
        <div className="renderers-comparison">
          <UnsafeRenderer />
          <SafeRenderer />
        </div>
      </main>
    </div>
  )
}

export default App
