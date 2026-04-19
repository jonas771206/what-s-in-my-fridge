import { describe, it, expect, vi } from 'vitest'
import { apiFetch } from './api'

describe('apiFetch', () => {
  it('calls fetch with the correct URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await apiFetch('/recipes')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/recipes',
      expect.any(Object)
    )

    vi.unstubAllGlobals()
  })
})
