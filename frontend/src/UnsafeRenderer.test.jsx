import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UnsafeRenderer from './UnsafeRenderer'

global.fetch = vi.fn()

describe('UnsafeRenderer Component - User Flow', () => {
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

    render(<UnsafeRenderer />)
    
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

  it('should disable submit button when prompt is empty', () => {
    render(<UnsafeRenderer />)
    
    const submitButton = screen.getByRole('button', { name: /generate/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when prompt is entered', async () => {
    const user = userEvent.setup()
    render(<UnsafeRenderer />)
    
    const textarea = screen.getByLabelText(/enter prompt/i)
    const submitButton = screen.getByRole('button', { name: /generate/i })
    
    expect(submitButton).toBeDisabled()
    
    await user.type(textarea, 'test')
    
    expect(submitButton).not.toBeDisabled()
  })
})
