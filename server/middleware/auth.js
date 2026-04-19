import { clerkMiddleware, getAuth } from '@clerk/express'

export { clerkMiddleware }

export function requireAuth(req, res, next) {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

export function requireSignedIn(req, res, next) {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  req.clerkUserId = userId
  next()
}
