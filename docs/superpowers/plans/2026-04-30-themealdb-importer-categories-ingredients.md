# TheMealDB Importer — Categories & Ingredients Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `server/scripts/import-themealdb.js` to accept `categories` and `ingredients` filters (with `*` expansion), and add per-run dedup so a meal is looked up at most once even if it matches multiple filters.

**Architecture:** All changes are in a single Node script and its sibling JSON input. Two new fetch helpers per dimension (one filter, one list-all), two new loops mirroring the existing `areas` loop, and one shared `Set<string>` consulted by all summary-driven loops before they hit `lookup.php`.

**Tech Stack:** Node (ESM), `node:fs/promises`, native `fetch`, `pg` pool. No test framework — verification is by running the script against the live TheMealDB API and inspecting console output / DB rows.

**Spec:** `docs/superpowers/specs/2026-04-30-themealdb-importer-categories-ingredients-design.md`

---

## File Structure

- **Modify:** `server/scripts/import-themealdb.js` — add fetch helpers, expansion, dedup `Set`, two new loops, plumb the set into existing loops.
- **Modify:** `server/scripts/data/themealdb-dishes.json` — add `categories` and `ingredients` keys.

No new files. No test files (importer has no test infra; explicitly out of scope per spec).

---

## Task 1: Add the four new fetch helpers

**Files:**
- Modify: `server/scripts/import-themealdb.js` (add after the existing `fetchAllAreas` at line 45)

- [ ] **Step 1: Add `fetchByCategory`, `fetchByIngredient`, `fetchAllCategories`, `fetchAllIngredients`**

Insert immediately after the existing `fetchAllAreas` function (after line 45, before `extractIngredients`):

```js
async function fetchByCategory(category) {
  const { meals } = await fetchJson(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`)
  return meals ?? []
}

async function fetchByIngredient(ingredient) {
  const { meals } = await fetchJson(`${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`)
  return meals ?? []
}

async function fetchAllCategories() {
  const { meals } = await fetchJson(`${API_BASE}/list.php?c=list`)
  return (meals ?? []).map(m => m.strCategory)
}

async function fetchAllIngredients() {
  const { meals } = await fetchJson(`${API_BASE}/list.php?i=list`)
  return (meals ?? []).map(m => m.strIngredient)
}
```

- [ ] **Step 2: Verify the helpers compile and the four endpoints respond**

Run a one-off check (do **not** commit this scratch code):

```bash
cd /Users/j/Documents/Whats_In_My_Fridge_v2/.claude/worktrees/jovial-elbakyan-f110d7
node --input-type=module -e "
import('./server/scripts/import-themealdb.js').catch(e => console.error('import error:', e.message));
" 2>&1 | head -5
```

The script will start running its main loop (it has top-level await) — that's fine; Ctrl-C after you see it begin. We're only confirming it parses. If you see a `SyntaxError` or `ReferenceError`, fix it before continuing.

A cleaner verification: just `node --check server/scripts/import-themealdb.js` — that parses without executing.

Run: `node --check server/scripts/import-themealdb.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add server/scripts/import-themealdb.js
git commit -m "feat(import): add category and ingredient fetch helpers"
```

---

## Task 2: Add the dedup `Set` and parse the new input keys

**Files:**
- Modify: `server/scripts/import-themealdb.js:98-102`

- [ ] **Step 1: Read `categories` and `ingredients` from the input file and create the seen-set**

Replace the existing block:

```js
const input = JSON.parse(await readFile(INPUT_FILE, 'utf8'))
const ids = Array.isArray(input.ids) ? input.ids : []
const names = Array.isArray(input.names) ? input.names : []
const areasInput = Array.isArray(input.areas) ? input.areas : []
const areas = areasInput.includes('*') ? await fetchAllAreas() : areasInput
```

with:

```js
const input = JSON.parse(await readFile(INPUT_FILE, 'utf8'))
const ids = Array.isArray(input.ids) ? input.ids : []
const names = Array.isArray(input.names) ? input.names : []
const areasInput = Array.isArray(input.areas) ? input.areas : []
const categoriesInput = Array.isArray(input.categories) ? input.categories : []
const ingredientsInput = Array.isArray(input.ingredients) ? input.ingredients : []
const areas = areasInput.includes('*') ? await fetchAllAreas() : areasInput
const categories = categoriesInput.includes('*') ? await fetchAllCategories() : categoriesInput
const ingredients = ingredientsInput.includes('*') ? await fetchAllIngredients() : ingredientsInput

const seen = new Set()
```

- [ ] **Step 2: Verify the file still parses**

Run: `node --check server/scripts/import-themealdb.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add server/scripts/import-themealdb.js
git commit -m "feat(import): parse categories/ingredients input and add dedup set"
```

---

## Task 3: Plumb the dedup `Set` into the existing `ids`, `names`, `areas` loops

**Files:**
- Modify: `server/scripts/import-themealdb.js` — the three existing loops (`for (const id of ids)`, `for (const name of names)`, `for (const area of areas)`)

- [ ] **Step 1: Update the `ids` loop to record successful fetches in `seen`**

Find the existing `ids` loop. After the `if (!raw) { ... continue }` guard, add `seen.add(String(raw.idMeal))` so the id is marked once we know it's real. The loop becomes:

```js
for (const id of ids) {
  try {
    const raw = await fetchById(id)
    if (!raw) {
      console.warn(`  miss: id=${id} not found`)
      failed++
      continue
    }
    seen.add(String(raw.idMeal))
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
```

- [ ] **Step 2: Update the `names` loop to record each returned meal in `seen`**

Inside `for (const raw of meals)`, add `seen.add(String(raw.idMeal))` before `transformMeal`:

```js
for (const raw of meals) {
  seen.add(String(raw.idMeal))
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
```

- [ ] **Step 3: Update the `areas` loop to consult `seen` before the `lookup.php` call**

In the existing `for (const summary of summaries)` block, gate the `fetchById` on `seen`:

```js
for (const summary of summaries) {
  const mealId = String(summary.idMeal)
  if (seen.has(mealId)) continue
  seen.add(mealId)
  try {
    const raw = await fetchById(mealId)
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
    console.error(`  fail id=${mealId}: ${err.message}`)
  }
}
```

Note: we add to `seen` **before** the fetch (not after) so a transient API failure on one filter doesn't cause a re-fetch on the next filter. The spec says "at most one `lookup.php` call per run" — that means failures count too.

- [ ] **Step 4: Verify the file still parses**

Run: `node --check server/scripts/import-themealdb.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add server/scripts/import-themealdb.js
git commit -m "refactor(import): plumb dedup set through existing id/name/area loops"
```

---

## Task 4: Add the `categories` and `ingredients` loops

**Files:**
- Modify: `server/scripts/import-themealdb.js` — append after the existing `areas` loop, before the final `console.log` summary.

- [ ] **Step 1: Add the `categories` loop**

Append immediately after the `areas` loop closes:

```js
for (const category of categories) {
  try {
    const summaries = await fetchByCategory(category)
    console.log(`  category "${category}": ${summaries.length} meals`)
    for (const summary of summaries) {
      const mealId = String(summary.idMeal)
      if (seen.has(mealId)) continue
      seen.add(mealId)
      try {
        const raw = await fetchById(mealId)
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
        console.error(`  fail id=${mealId}: ${err.message}`)
      }
    }
  } catch (err) {
    failed++
    console.error(`  fail category="${category}": ${err.message}`)
  }
}
```

- [ ] **Step 2: Add the `ingredients` loop**

Append immediately after the `categories` loop:

```js
for (const ingredient of ingredients) {
  try {
    const summaries = await fetchByIngredient(ingredient)
    console.log(`  ingredient "${ingredient}": ${summaries.length} meals`)
    for (const summary of summaries) {
      const mealId = String(summary.idMeal)
      if (seen.has(mealId)) continue
      seen.add(mealId)
      try {
        const raw = await fetchById(mealId)
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
        console.error(`  fail id=${mealId}: ${err.message}`)
      }
    }
  } catch (err) {
    failed++
    console.error(`  fail ingredient="${ingredient}": ${err.message}`)
  }
}
```

The two loops are near-duplicates of the `areas` loop — that is intentional. Per `.claude/CLAUDE.md` rule 2 ("Three similar lines is better than a premature abstraction"), we are **not** extracting a shared helper here. If a fourth filter type is added later, that's the right time to refactor.

- [ ] **Step 3: Verify the file still parses**

Run: `node --check server/scripts/import-themealdb.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add server/scripts/import-themealdb.js
git commit -m "feat(import): add categories and ingredients loops"
```

---

## Task 5: Update the input JSON file

**Files:**
- Modify: `server/scripts/data/themealdb-dishes.json`

- [ ] **Step 1: Add the two new keys**

Replace the file contents with:

```json
{
  "ids": [],
  "names": [],
  "areas": ["*"],
  "categories": [],
  "ingredients": []
}
```

- [ ] **Step 2: Verify it's valid JSON**

Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('server/scripts/data/themealdb-dishes.json', 'utf8')))"`
Expected: prints the object with all five keys.

- [ ] **Step 3: Commit**

```bash
git add server/scripts/data/themealdb-dishes.json
git commit -m "chore(import): add categories and ingredients to input file"
```

---

## Task 6: End-to-end verification against TheMealDB

This task validates real behavior. It requires the DB connection (`server/db.js`) to work — same as running the importer normally.

- [ ] **Step 1: Verify a small category-only run imports new rows**

Set the input file temporarily:

```bash
cat > server/scripts/data/themealdb-dishes.json <<'EOF'
{
  "ids": [],
  "names": [],
  "areas": [],
  "categories": ["Dessert"],
  "ingredients": []
}
EOF
```

Run: `node server/scripts/import-themealdb.js`

Expected output (counts will vary as TheMealDB updates):
- A line `category "Dessert": NN meals`
- Some `+    <slug>-<idMeal>` lines for new rows
- Some `skip` lines for any already in DB
- Final summary `Imported X, skipped Y, failed 0`

- [ ] **Step 2: Verify dedup with overlapping filters**

```bash
cat > server/scripts/data/themealdb-dishes.json <<'EOF'
{
  "ids": [],
  "names": [],
  "areas": ["Italian"],
  "categories": ["Pasta"],
  "ingredients": []
}
EOF
```

Run: `node server/scripts/import-themealdb.js`

Expected:
- Italian and Pasta both print their meal counts.
- The total `Imported + skipped` for the second run should be **less than** `(Italian count) + (Pasta count)`, because overlapping meals are deduped — they appear only once in the `+`/`skip` output.
- `failed` should be 0.

You can also verify by counting `+`/`skip` lines vs the sum of `category "..."` and `area "..."` counts; they should be equal to the number of unique meal ids across the two filters, not the sum.

- [ ] **Step 3: Verify a small ingredient-only run**

```bash
cat > server/scripts/data/themealdb-dishes.json <<'EOF'
{
  "ids": [],
  "names": [],
  "areas": [],
  "categories": [],
  "ingredients": ["chicken_breast"]
}
EOF
```

Run: `node server/scripts/import-themealdb.js`

Expected: a line `ingredient "chicken_breast": NN meals`, followed by `+`/`skip` lines, `failed 0`.

- [ ] **Step 4: Restore the input file to the post-spec default**

```bash
cat > server/scripts/data/themealdb-dishes.json <<'EOF'
{
  "ids": [],
  "names": [],
  "areas": ["*"],
  "categories": [],
  "ingredients": []
}
EOF
```

- [ ] **Step 5: Confirm git status is clean**

Run: `git status --short server/scripts/data/themealdb-dishes.json`
Expected: no output (the file matches the committed version from Task 5).

If the file shows as modified, diff it against the committed version and reconcile:
```bash
git diff server/scripts/data/themealdb-dishes.json
```

- [ ] **Step 6: No commit for this task**

Verification only. Nothing new to commit if Step 5 passed.

---

## Out of Scope (per spec)

- Intersection / AND-combination of filters
- Confirmation prompt before `ingredients: ["*"]` expansion
- Tests / test infra
- Changes to `themealdb-flags.js`, `backfill-flags.js`, `migrate.js`
- README updates
