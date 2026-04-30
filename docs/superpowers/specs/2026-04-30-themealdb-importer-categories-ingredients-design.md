# TheMealDB Importer — Categories and Ingredients Filters

**Date:** 2026-04-30
**Status:** Approved, pending implementation

## Goal

Extend `server/scripts/import-themealdb.js` so the input file can also drive imports by **category** (Beef, Dessert, Vegan, …) and by **main ingredient** (chicken_breast, salmon, …), in addition to the existing `ids`, `names`, and `areas`. Add per-run dedup so the same meal is never looked up twice when it matches multiple filters.

## Background

Today the importer reads `server/scripts/data/themealdb-dishes.json` with three keys: `ids`, `names`, `areas`. `areas: ["*"]` expands to every area via `list.php?a=list`. TheMealDB exposes equivalent filter and list endpoints for categories and ingredients, but the importer doesn't use them.

When two filters happen to overlap (e.g. an Italian Dessert appears under both `areas: ["Italian"]` and `categories: ["Dessert"]`), the second pass redundantly hits `lookup.php` and is then dropped by `ON CONFLICT DO NOTHING`. Wasteful, not broken.

## Design

### Input file shape

`server/scripts/data/themealdb-dishes.json` gains two keys:

```json
{
  "ids": [],
  "names": [],
  "areas": ["*"],
  "categories": [],
  "ingredients": []
}
```

Both new keys accept the same shape as `areas`: a list of strings, with `"*"` expanding to "all of this kind".

### New fetch helpers

In `import-themealdb.js`:

- `fetchByCategory(category)` → `GET filter.php?c=<category>`, returns summary list (`{ idMeal, strMeal, strMealThumb }`)
- `fetchByIngredient(ingredient)` → `GET filter.php?i=<ingredient>`
- `fetchAllCategories()` → `GET list.php?c=list`, returns `meals.map(m => m.strCategory)`
- `fetchAllIngredients()` → `GET list.php?i=list`, returns `meals.map(m => m.strIngredient)`

### Expansion

Mirrors the existing `areas` pattern:

```js
const categories = categoriesInput.includes('*') ? await fetchAllCategories() : categoriesInput
const ingredients = ingredientsInput.includes('*') ? await fetchAllIngredients() : ingredientsInput
```

`ingredients: ["*"]` expands to ~600 entries, which is a lot of API calls. That cost is the user's choice; no warning or confirmation prompt.

### Dedup

A single `Set<string>` of already-seen `idMeal` values, scoped to the run. Behavior:

- **`ids` loop:** add the id to the set after a successful fetch.
- **`names` loop:** for each returned meal, add `idMeal` to the set after upsert. (The `names` path doesn't do a separate lookup, so the set serves only to inform later loops.)
- **`areas`, `categories`, `ingredients` loops:** for each summary, check the set before calling `fetchById(summary.idMeal)`. If present, skip silently and move on. If absent, fetch, upsert, then add to the set.

Effect: each `idMeal` triggers at most one `lookup.php` call per run.

### Loop order

`ids` → `names` → `areas` → `categories` → `ingredients`. Preserves existing behavior when the new keys are empty arrays.

### Counters

Reuse existing `created` / `skipped` / `failed`. Dedup-skips are silent and do not increment any counter (they aren't user-facing skips, just avoided work).

## Files Touched

- `server/scripts/import-themealdb.js` — four new helper functions, `*`-expansion for the new keys, two new loops, dedup `Set`, plumbing of the set through the existing `areas` loop.
- `server/scripts/data/themealdb-dishes.json` — add `categories: []` and `ingredients: []`. `areas: ["*"]` stays as-is.

## Out of Scope

- Intersection / AND-combination mode (user picked union; no `mode` switch).
- Confirmation prompt before expanding `ingredients: ["*"]`.
- README or doc updates.
- Tests (the importer has none today; not adding the testing infra in this change).
- Changes to `themealdb-flags.js`, `backfill-flags.js`, `migrate.js`.

## Success Criteria

- `node server/scripts/import-themealdb.js` with `categories: ["Dessert"]` imports every TheMealDB dessert and skips any that are already in the DB.
- `categories: ["*"]` imports across every category; `ingredients: ["*"]` imports across every ingredient (slow but works).
- A meal that matches both an area filter and a category filter in the same run triggers exactly one `lookup.php` call.
- Existing behavior with only `ids`/`names`/`areas` is unchanged.
