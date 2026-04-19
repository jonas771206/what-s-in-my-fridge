import { pool } from '../db.js'
import { recipes } from '../../src/data/recipes.js'

for (const recipe of recipes) {
  await pool.query(
    `INSERT INTO recipes (slug, title, country, data, dietary_tags)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO NOTHING`,
    [recipe.id, recipe.name, recipe.country, JSON.stringify(recipe), []]
  )
}

console.log(`Seeded ${recipes.length} recipes`)
await pool.end()
