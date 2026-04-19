# Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Node/Express API on the NAS, migrate the 25 static recipes into PostgreSQL, wire Clerk auth, and update the React frontend to fetch all data from the API instead of static files.

**Architecture:** A new `server/` directory holds the Express app, which connects to the existing NAS Postgres and verifies requests using Clerk's JWT middleware. The React frontend is updated to fetch from `http://localhost:3001/api` in dev. Static recipe imports are replaced with `fetch()` calls throughout.

**Tech Stack:** Node.js (ESM), Express 4, pg, @clerk/express, dotenv, cors — supertest + node:test for backend tests, existing Vitest for frontend.

---

## File Map

**New — `server/`**
| File | Responsibility |
|---|---|
| `server/package.json` | Server dependencies and scripts |
| `server/.env` | Secrets — gitignored |
| `server/.env.example` | Committed template |
| `server/db.js` | pg Pool singleton |
| `server/app.js` | Express app config, middleware, route wiring — exported for tests |
| `server/index.js` | Calls `app.listen()` — entry point |
| `server/middleware/auth.js` | Clerk JWT verification, `requireAuth` helper |
| `server/routes/recipes.js` | GET /api/recipes, GET /api/recipes/:slug |
| `server/routes/recipes.test.js` | supertest tests for recipe routes |
| `server/routes/auth.js` | POST /api/auth/sync |
| `server/scripts/migrate.js` | CREATE TABLE statements |
| `server/scripts/seed.js` | Insert 25 recipes from src/data/recipes.js |

**Modified — frontend**
| File | Change |
|---|---|
| `.gitignore` | Add `server/.env`, `.env` |
| `.env` | New — VITE_CLERK_PUBLISHABLE_KEY, VITE_API_URL |
| `src/main.jsx` | Wrap app in ClerkProvider |
| `src/lib/api.js` | New — fetch helper with auth header |
| `src/components/Nav/Nav.jsx` | Add SignInButton / UserButton |
| `src/pages/BrowseRecipes/BrowseRecipes.jsx` | Fetch recipes from API |
| `src/pages/RecipeDetail/RecipeDetail.jsx` | Fetch single recipe from API |
| `src/pages/MyFridge/MyFridge.jsx` | Fetch all recipes from API for matching |

---

## Task 1: Create Clerk Account and Application

**Files:** none — manual browser steps

- [ ] **Step 1: Create Clerk account**

Go to https://clerk.com and sign up for a free account.

- [ ] **Step 2: Create a new application**

In the Clerk dashboard, click "Add application". Name it `Whats In My Fridge`. Enable these sign-in options: **Email**, **Google**, **Apple**.

- [ ] **Step 3: Copy your keys**

In the dashboard → API Keys, copy:
- **Publishable key** — starts with `pk_test_`
- **Secret key** — starts with `sk_test_`

Keep these ready for Task 4.

---

## Task 2: Create the PostgreSQL Database

**Files:** none — run commands directly

- [ ] **Step 1: Create the database**

Run this from your Mac (password prompt will appear):

```bash
PGPASSWORD=<your_new_password> psql -h 192.168.4.234 -p 5434 -U postgres -c "CREATE DATABASE whats_in_my_fridge;"
```

Expected output: `CREATE DATABASE`

- [ ] **Step 2: Verify**

```bash
PGPASSWORD=<your_new_password> psql -h 192.168.4.234 -p 5434 -U postgres -c "\l" | grep whats_in_my_fridge
```

Expected: one line containing `whats_in_my_fridge`.

> **Note:** Change your PostgreSQL password before this step — the old one was shared in plaintext. Use `ALTER USER postgres PASSWORD 'new_password';` via psql.

---

## Task 3: Initialize Server Directory

**Files:** Create `server/package.json`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "whats-in-my-fridge-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "test": "node --test routes/*.test.js"
  },
  "dependencies": {
    "@clerk/express": "^1.3.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd server && npm install
```

Expected: `added N packages` with no errors.

- [ ] **Step 3: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "feat: initialize server package"
```

---

## Task 4: Configure Environment Files

**Files:** Create `server/.env.example`, `server/.env`, `.env`, `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
# Dependencies
node_modules/
server/node_modules/

# Environment
.env
server/.env

# Build
dist/
```

- [ ] **Step 2: Create server/.env.example**

```
DB_HOST=192.168.4.234
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=whats_in_my_fridge
CLERK_SECRET_KEY=sk_test_your_key_here
PORT=3001
```

- [ ] **Step 3: Create server/.env** (fill in your real values — never commit this)

```
DB_HOST=192.168.4.234
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=<your_new_postgres_password>
DB_NAME=whats_in_my_fridge
CLERK_SECRET_KEY=<your_clerk_secret_key>
PORT=3001
```

- [ ] **Step 4: Create .env** (root — for Vite, never commit this)

```
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
VITE_API_URL=http://localhost:3001
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore server/.env.example
git commit -m "feat: add environment config and gitignore"
```

---

## Task 5: Database Connection

**Files:** Create `server/db.js`

- [ ] **Step 1: Create server/db.js**

```js
import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})
```

- [ ] **Step 2: Verify connection**

```bash
cd server && node -e "import('./db.js').then(m => m.pool.query('SELECT 1').then(() => { console.log('DB OK'); process.exit(0) }))"
```

Expected output: `DB OK`

- [ ] **Step 3: Commit**

```bash
git add server/db.js
git commit -m "feat: add database connection pool"
```

---

## Task 6: Database Migration

**Files:** Create `server/scripts/migrate.js`

- [ ] **Step 1: Create server/scripts/migrate.js**

```js
import { pool } from '../db.js'

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL,
    display_name  TEXT,
    role          TEXT DEFAULT 'user',
    created_at    TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id            SERIAL PRIMARY KEY,
    slug          TEXT UNIQUE NOT NULL,
    title         TEXT NOT NULL,
    country       TEXT,
    dietary_tags  TEXT[] DEFAULT '{}',
    data          JSONB NOT NULL,
    source        TEXT DEFAULT 'official',
    submitted_by  TEXT REFERENCES users(id) NULL,
    status        TEXT DEFAULT 'approved',
    created_at    TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS meal_plan_items (
    id            SERIAL PRIMARY KEY,
    user_id       TEXT REFERENCES users(id),
    recipe_id     INT REFERENCES recipes(id),
    added_at      TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS dietary_profiles (
    user_id       TEXT PRIMARY KEY REFERENCES users(id),
    presets       TEXT[] DEFAULT '{}',
    custom        TEXT[] DEFAULT '{}',
    updated_at    TIMESTAMPTZ DEFAULT now()
  );
`)

console.log('Migration complete')
await pool.end()
```

- [ ] **Step 2: Run migration**

```bash
cd server && npm run migrate
```

Expected output: `Migration complete`

- [ ] **Step 3: Verify tables exist**

```bash
PGPASSWORD=<password> psql -h 192.168.4.234 -p 5434 -U postgres -d whats_in_my_fridge -c "\dt"
```

Expected: four rows — `users`, `recipes`, `meal_plan_items`, `dietary_profiles`.

- [ ] **Step 4: Commit**

```bash
git add server/scripts/migrate.js
git commit -m "feat: add database migration script"
```

---

## Task 7: Seed Recipes

**Files:** Create `server/scripts/seed.js`

- [ ] **Step 1: Create server/scripts/seed.js**

```js
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
```

- [ ] **Step 2: Run seed**

```bash
cd server && npm run seed
```

Expected output: `Seeded 25 recipes`

- [ ] **Step 3: Verify**

```bash
PGPASSWORD=<password> psql -h 192.168.4.234 -p 5434 -U postgres -d whats_in_my_fridge -c "SELECT COUNT(*) FROM recipes;"
```

Expected: `25`

- [ ] **Step 4: Commit**

```bash
git add server/scripts/seed.js
git commit -m "feat: add recipe seed script"
```

---

## Task 8: Auth Middleware

**Files:** Create `server/middleware/auth.js`

- [ ] **Step 1: Create server/middleware/auth.js**

```js
import { clerkMiddleware, getAuth } from '@clerk/express'

export { clerkMiddleware }

export function requireAuth(req, res, next) {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

export function requireAdmin(req, res, next) {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  req.clerkUserId = userId
  next()
}
```

- [ ] **Step 2: Commit**

```bash
git add server/middleware/auth.js
git commit -m "feat: add Clerk auth middleware"
```

---

## Task 9: Recipe Routes

**Files:** Create `server/routes/recipes.js`, `server/routes/recipes.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/routes/recipes.test.js
import { test, before, after } from 'node:test'
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
```

- [ ] **Step 2: Create server/routes/recipes.js**

```js
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
```

- [ ] **Step 3: Create server/app.js** (needed before tests can run)

```js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from './middleware/auth.js'
import recipeRoutes from './routes/recipes.js'

const app = express()

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(clerkMiddleware())

app.use('/api/recipes', recipeRoutes)

export default app
```

- [ ] **Step 4: Create server/index.js**

```js
import 'dotenv/config'
import app from './app.js'

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

- [ ] **Step 5: Run tests**

```bash
cd server && npm test
```

Expected: 3 passing tests.

- [ ] **Step 6: Commit**

```bash
git add server/app.js server/index.js server/routes/recipes.js server/routes/recipes.test.js
git commit -m "feat: add recipe routes with tests"
```

---

## Task 10: Auth Sync Route

**Files:** Create `server/routes/auth.js`, update `server/app.js`

- [ ] **Step 1: Create server/routes/auth.js**

```js
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
```

- [ ] **Step 2: Register auth route in server/app.js**

Add after the existing `import recipeRoutes` line:

```js
import authRoutes from './routes/auth.js'
```

Add after `app.use('/api/recipes', recipeRoutes)`:

```js
app.use('/api/auth', authRoutes)
```

- [ ] **Step 3: Start server and verify manually**

```bash
cd server && npm run dev
```

Expected output: `Server running on port 3001`

In a separate terminal:

```bash
curl http://localhost:3001/api/recipes | head -c 200
```

Expected: JSON array starting with recipe objects.

- [ ] **Step 4: Commit**

```bash
git add server/routes/auth.js server/app.js
git commit -m "feat: add auth sync route"
```

---

## Task 11: Frontend — Clerk and Environment

**Files:** Update root `.env`, install `@clerk/clerk-react`

- [ ] **Step 1: Install Clerk React SDK**

```bash
npm install @clerk/clerk-react
```

- [ ] **Step 2: Verify .env has Clerk publishable key**

The root `.env` (created in Task 4) should already contain:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install Clerk React SDK"
```

---

## Task 12: Frontend — API Helper

**Files:** Create `src/lib/api.js`

- [ ] **Step 1: Write the failing test**

Create `src/lib/api.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/api.test.js
```

Expected: FAIL with "Cannot find module './api'"

- [ ] **Step 3: Create src/lib/api.js**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/lib/api.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.js src/lib/api.test.js
git commit -m "feat: add API fetch helper"
```

---

## Task 13: Frontend — Update BrowseRecipes

**Files:** Modify `src/pages/BrowseRecipes/BrowseRecipes.jsx`

- [ ] **Step 1: Read the current file**

Open `src/pages/BrowseRecipes/BrowseRecipes.jsx` and find the static import:
```js
import { recipes } from '../../data/recipes'
```

- [ ] **Step 2: Replace static import with API fetch**

Remove the `import { recipes }` line. Add `useState`, `useEffect` to the React import and add the apiFetch import. Replace the top of the component:

```js
import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
```

Inside the component, before existing state, add:

```js
const [recipes, setRecipes] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  apiFetch('/api/recipes')
    .then(setRecipes)
    .finally(() => setLoading(false))
}, [])
```

Add a loading guard before the return:

```js
if (loading) return <div className={styles.page}><p style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading…</p></div>
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:5173/recipes. Recipes should load from the API. The search and country filter should work as before.

- [ ] **Step 4: Commit**

```bash
git add src/pages/BrowseRecipes/BrowseRecipes.jsx
git commit -m "feat: fetch Browse Recipes from API"
```

---

## Task 14: Frontend — Update RecipeDetail

**Files:** Modify `src/pages/RecipeDetail/RecipeDetail.jsx`

- [ ] **Step 1: Read the current file**

Open `src/pages/RecipeDetail/RecipeDetail.jsx` and find how the recipe is looked up (likely from a static import by `id` param).

- [ ] **Step 2: Replace static lookup with API fetch**

Remove any static `import { recipes }` line. Add imports:

```js
import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
```

Inside the component, replace the recipe lookup with:

```js
const { id } = useParams()
const [recipe, setRecipe] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  apiFetch(`/api/recipes/${id}`)
    .then(setRecipe)
    .catch(() => setRecipe(null))
    .finally(() => setLoading(false))
}, [id])

if (loading) return <div className={styles.page}><p style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading…</p></div>
if (!recipe) return <div className={styles.page}><p style={{ color: 'var(--text-secondary)', padding: 32 }}>Recipe not found.</p></div>
```

Remove the early return that previously handled a missing recipe (if one existed).

- [ ] **Step 3: Verify**

Navigate to any recipe detail page (e.g. http://localhost:5173/recipes/chicken-tikka-masala). All content should render correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/RecipeDetail/RecipeDetail.jsx
git commit -m "feat: fetch Recipe Detail from API"
```

---

## Task 15: Frontend — Update MyFridge

**Files:** Modify `src/pages/MyFridge/MyFridge.jsx`

- [ ] **Step 1: Read current file**

Open `src/pages/MyFridge/MyFridge.jsx` and find the static import:
```js
import { recipes } from '../../data/recipes'
```

- [ ] **Step 2: Replace static import with API fetch**

Remove the `import { recipes }` line. Add to React import and add apiFetch:

```js
import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '../../lib/api'
```

Inside the component, add after the existing `useState` hooks:

```js
const [allRecipes, setAllRecipes] = useState([])

useEffect(() => {
  apiFetch('/api/recipes').then(setAllRecipes)
}, [])
```

Update the `useMemo` to use `allRecipes` instead of `recipes`:

```js
const results = useMemo(
  () => selectedKeys.size > 0 ? rankRecipes(allRecipes, [...selectedKeys]) : null,
  [selectedKeys, allRecipes]
)
```

- [ ] **Step 3: Verify**

Open http://localhost:5173/fridge. Select ingredients — matching recipes should appear as before.

- [ ] **Step 4: Commit**

```bash
git add src/pages/MyFridge/MyFridge.jsx
git commit -m "feat: fetch recipes from API in My Fridge"
```

---

## Task 16: Frontend — Clerk Provider

**Files:** Modify `src/main.jsx`

- [ ] **Step 1: Update src/main.jsx**

```js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import './styles/tokens.css'
import './App.css'
import App from './App.jsx'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
)
```

- [ ] **Step 2: Verify app still loads**

```bash
npm run dev
```

Open http://localhost:5173. No errors in browser console. All pages work as before.

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add ClerkProvider to React root"
```

---

## Task 17: Frontend — Nav Auth UI

**Files:** Modify `src/components/Nav/Nav.jsx`

- [ ] **Step 1: Read current Nav.jsx**

Open `src/components/Nav/Nav.jsx` to understand the current markup structure.

- [ ] **Step 2: Trigger user sync after sign-in — modify src/App.jsx**

Add these imports at the top of `src/App.jsx`:

```js
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { apiFetchAuth } from './lib/api'
```

Inside the `App` component, before the `return`, add:

```js
const { isSignedIn, getToken } = useAuth()

useEffect(() => {
  if (!isSignedIn) return
  getToken().then(token => apiFetchAuth('/api/auth/sync', token, { method: 'POST' }))
}, [isSignedIn])
```

- [ ] **Step 3: Add Clerk auth UI to Nav**

Add imports at the top of Nav.jsx:

```js
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react'
```

Inside the nav markup, after the existing nav links, add an auth section. Place it at the end of the nav container element:

```jsx
<div className={styles.authArea}>
  <SignedOut>
    <SignInButton mode="modal">
      <button className={styles.signInBtn}>Sign in</button>
    </SignInButton>
  </SignedOut>
  <SignedIn>
    <UserButton afterSignOutUrl="/" />
  </SignedIn>
</div>
```

- [ ] **Step 4: Add styles to Nav.module.css**

Add to the end of `src/components/Nav/Nav.module.css`:

```css
.authArea {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.signInBtn {
  border: 1px solid rgba(196, 148, 50, 0.45);
  border-radius: var(--radius-pill);
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gold);
  background: transparent;
  transition: opacity 0.15s ease;
}

.signInBtn:hover { opacity: 0.75; }
```

- [ ] **Step 5: Verify**

Open http://localhost:5173/recipes. Nav should show a "Sign in" button on the right. Clicking it should open Clerk's sign-in modal. After signing in, it should show a user avatar.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/Nav/Nav.jsx src/components/Nav/Nav.module.css
git commit -m "feat: add Clerk sign in / user button to Nav and sync user on login"
```

---

## Task 18: End-to-End Smoke Test

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all existing tests pass (matching engine + api helper).

```bash
cd server && npm test
```

Expected: 3 recipe route tests pass.

- [ ] **Step 2: Manual walkthrough**

With both `npm run dev` (frontend) and `cd server && npm run dev` (backend) running:

1. Open http://localhost:5173 — landing page loads
2. Click Browse Recipes — recipes load from API, search and filter work
3. Click any recipe — detail page loads from API
4. Open My Fridge — select ingredients — matching recipes appear
5. Click Sign in in Nav — Clerk modal opens — sign up with email
6. After sign in — user avatar appears in Nav
7. Check NAS Postgres:
   ```bash
   PGPASSWORD=<password> psql -h 192.168.4.234 -p 5434 -U postgres -d whats_in_my_fridge -c "SELECT * FROM users;"
   ```
   Expected: your user row appears.
