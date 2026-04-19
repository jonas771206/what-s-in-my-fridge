import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT data, dietary_tags FROM recipes WHERE status = 'approved' ORDER BY id`
    )
    res.json(rows.map(r => ({ ...r.data, dietary_tags: r.dietary_tags })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT data, dietary_tags FROM recipes WHERE slug = $1 AND status = 'approved'`,
      [req.params.slug]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ ...rows[0].data, dietary_tags: rows[0].dietary_tags })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
