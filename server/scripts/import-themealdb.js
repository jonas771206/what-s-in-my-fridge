import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { pool } from '../db.js'
import { FLAGS } from './themealdb-flags.js'

const API_BASE = 'https://www.themealdb.com/api/json/v1/1'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT_FILE = resolve(__dirname, 'data/themealdb-dishes.json')

function kebab(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

async function fetchById(id) {
  const { meals } = await fetchJson(`${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`)
  return meals?.[0] ?? null
}

async function fetchByName(name) {
  const { meals } = await fetchJson(`${API_BASE}/search.php?s=${encodeURIComponent(name)}`)
  return meals ?? []
}

async function fetchByArea(area) {
  const { meals } = await fetchJson(`${API_BASE}/filter.php?a=${encodeURIComponent(area)}`)
  return meals ?? []
}

async function fetchAllAreas() {
  const { meals } = await fetchJson(`${API_BASE}/list.php?a=list`)
  return (meals ?? []).map(m => m.strArea)
}

function extractIngredients(raw) {
  const out = []
  for (let i = 1; i <= 20; i++) {
    const name = (raw[`strIngredient${i}`] ?? '').trim()
    const amount = (raw[`strMeasure${i}`] ?? '').trim()
    if (!name) continue
    out.push({ name, amount, key: kebab(name) })
  }
  return out
}

function extractSteps(raw) {
  const text = (raw.strInstructions ?? '').trim()
  if (!text) return []
  let chunks = text.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean)
  if (chunks.length <= 1) {
    chunks = text.split(/\r?\n+/).map(s => s.trim()).filter(Boolean)
  }
  return chunks.map(t => ({ text: t }))
}

function transformMeal(raw) {
  const baseSlug = kebab(raw.strMeal)
  // Suffix idMeal to keep slugs unique against the hand-curated set in src/data/recipes.js.
  const slug = `${baseSlug}-${raw.idMeal}`
  return {
    id: slug,
    name: raw.strMeal,
    country: raw.strArea || null,
    cuisine: raw.strArea || null,
    flag: FLAGS[raw.strArea] || null,
    // description/prepTime/difficulty/servings intentionally omitted — TheMealDB does not provide them.
    ingredients: extractIngredients(raw),
    steps: extractSteps(raw),
    image: raw.strMealThumb || null,
    sourceUrl: raw.strSource || `https://www.themealdb.com/meal/${raw.idMeal}`,
    externalId: `themealdb:${raw.idMeal}`,
  }
}

async function upsert(recipe) {
  const result = await pool.query(
    `INSERT INTO recipes (slug, title, country, data, dietary_tags, source)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (slug) DO NOTHING
     RETURNING id`,
    [recipe.id, recipe.name, recipe.country, JSON.stringify(recipe), [], 'themealdb']
  )
  return result.rowCount > 0
}

const input = JSON.parse(await readFile(INPUT_FILE, 'utf8'))
const ids = Array.isArray(input.ids) ? input.ids : []
const names = Array.isArray(input.names) ? input.names : []
const areasInput = Array.isArray(input.areas) ? input.areas : []
const areas = areasInput.includes('*') ? await fetchAllAreas() : areasInput

let created = 0
let skipped = 0
let failed = 0

for (const id of ids) {
  try {
    const raw = await fetchById(id)
    if (!raw) {
      console.warn(`  miss: id=${id} not found`)
      failed++
      continue
    }
    const recipe = transformMeal(raw)
    const inserted = await upsert(recipe)
    if (inserted) {
      created++
      console.log(`  +    ${recipe.id}`)
    } else {
      skipped++
      console.log(`  skip ${recipe.id}`)
    }
  } catch (err) {
    failed++
    console.error(`  fail id=${id}: ${err.message}`)
  }
}

for (const name of names) {
  try {
    const meals = await fetchByName(name)
    if (meals.length === 0) {
      console.warn(`  miss: name="${name}" returned 0 meals`)
      failed++
      continue
    }
    for (const raw of meals) {
      const recipe = transformMeal(raw)
      const inserted = await upsert(recipe)
      if (inserted) {
        created++
        console.log(`  +    ${recipe.id}`)
      } else {
        skipped++
        console.log(`  skip ${recipe.id}`)
      }
    }
  } catch (err) {
    failed++
    console.error(`  fail name="${name}": ${err.message}`)
  }
}

for (const area of areas) {
  try {
    const summaries = await fetchByArea(area)
    console.log(`  area "${area}": ${summaries.length} meals`)
    for (const summary of summaries) {
      try {
        const raw = await fetchById(summary.idMeal)
        if (!raw) {
          failed++
          continue
        }
        const recipe = transformMeal(raw)
        const inserted = await upsert(recipe)
        if (inserted) {
          created++
          console.log(`  +    ${recipe.id}`)
        } else {
          skipped++
        }
      } catch (err) {
        failed++
        console.error(`  fail id=${summary.idMeal}: ${err.message}`)
      }
    }
  } catch (err) {
    failed++
    console.error(`  fail area="${area}": ${err.message}`)
  }
}

console.log(`\nImported ${created}, skipped ${skipped}, failed ${failed}`)
await pool.end()
