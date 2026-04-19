const BASE = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function apiFetchAuth(path, token, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}
