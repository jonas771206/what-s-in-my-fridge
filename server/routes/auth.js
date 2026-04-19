import { Router } from 'express'
import { getAuth, createClerkClient } from '@clerk/express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
const router = Router()

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req)
    const user = await clerkClient.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress ?? ''
    const displayName = user.firstName ?? ''

    await pool.query(
      `INSERT INTO users (id, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [userId, email, displayName]
    )

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
