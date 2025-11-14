import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SafeRenderer from './SafeRenderer'

// Mock fetch
global.fetch = vi.fn()

describe('SafeRenderer Component - User Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow user to enter a prompt and submit', async () => {
    const user = userEvent.setup()
    const mockResponse = { content: '<p>Hello world</p>' }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<SafeRenderer />)
    
    const textarea = screen.getByLabelText(/enter prompt/i)
    const submitButton = screen.getByRole('button', { name: /generate/i })
    
    await user.type(textarea, 'Say hello')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/api/generate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ prompt: 'Say hello' }),
        })
      )
    })
  })

  it('should show loading state while fetching', async () => {
    const user = userEvent.setup()
    
    // Delay the fetch response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ content: 'test' }),
      }), 100))
    )

    render(<SafeRenderer />)
    
    const textarea = screen.getByLabelText(/enter prompt/i)
    await user.type(textarea, 'test')
    await user.click(screen.getByRole('button', { name: /generate/i }))
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
    })
  })

  it('should display error message on API failure', async () => {
    const user = userEvent.setup()
    
    fetch.mockRejectedValueOnce(new Error('Network error'))

    render(<SafeRenderer />)
    
    const textarea = screen.getByLabelText(/enter prompt/i)
    await user.type(textarea, 'test')
    await user.click(screen.getByRole('button', { name: /generate/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button when prompt is empty', () => {
    render(<SafeRenderer />)
    
    const submitButton = screen.getByRole('button', { name: /generate/i })
    expect(submitButton).toBeDisabled()
  })
})
