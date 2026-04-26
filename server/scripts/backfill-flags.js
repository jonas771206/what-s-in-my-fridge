import { pool } from '../db.js'
import { FLAGS } from './themealdb-flags.js'

const result = await pool.query(`
  SELECT id, slug, country, data
  FROM recipes
  WHERE source = 'themealdb'
    AND (data->>'flag' IS NULL OR data->>'flag' = '')
`)

let updated = 0
let unmapped = 0
for (const row of result.rows) {
  const flag = FLAGS[row.country]
  if (!flag) {
    unmapped++
    console.warn(`  miss: no flag for country="${row.country}" (${row.slug})`)
    continue
  }
  const newData = { ...row.data, flag }
  await pool.query('UPDATE recipes SET data = $1 WHERE id = $2', [JSON.stringify(newData), row.id])
  updated++
  console.log(`  +    ${row.slug} → ${flag}`)
}

console.log(`\nBackfilled ${updated} flags, ${unmapped} unmapped, ${result.rowCount} total checked`)
await pool.end()
