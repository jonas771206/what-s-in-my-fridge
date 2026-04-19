import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import app from '../app.js'
import { pool } from '../db.js'

after(async () => { await pool.end() })

test('GET /api/recipes returns array of approved recipes', async () => {
  const res = await request(app).get('/api/recipes')
  assert.equal(res.status, 200)
  assert.ok(Array.isArray(res.body))
  assert.ok(res.body.length > 0)
  assert.ok(res.body[0].id)
  assert.ok(res.body[0].name)
})

test('GET /api/recipes/:slug returns a single recipe', async () => {
  const res = await request(app).get('/api/recipes/chicken-tikka-masala')
  assert.equal(res.status, 200)
  assert.equal(res.body.id, 'chicken-tikka-masala')
  assert.equal(res.body.name, 'Chicken Tikka Masala')
})

test('GET /api/recipes/:slug returns 404 for unknown slug', async () => {
  const res = await request(app).get('/api/recipes/does-not-exist')
  assert.equal(res.status, 404)
})
