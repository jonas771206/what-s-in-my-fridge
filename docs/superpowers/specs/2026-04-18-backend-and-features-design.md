# What's In My Fridge — Backend & Features Design

**Date:** 2026-04-18
**Status:** Approved

---

## Overview

Add a backend API, user accounts, meal planning, community recipe submissions, and dietary profiles to the existing React + Vite SPA.

---

## Architecture

```
Browser (React app)
        ↕ HTTPS
Express API  ←→  Clerk (auth only)
        ↕
  PostgreSQL (NAS)
```

| Component | Location |
|---|---|
| React frontend | Browser (unchanged) |
| Express API | NAS (192.168.4.234) |
| PostgreSQL | NAS port 5434 (already running, PostgreSQL 18.3) |
| Auth (Clerk) | Clerk cloud — free tier, up to 10,000 users |

**Auth flow:** Clerk issues a JWT on login. The React app sends it as a Bearer token on every API request. Express verifies the token with Clerk's SDK before any database operation.

**Data flow:** All app data (recipes, meal plans, profiles) lives in NAS Postgres. Clerk stores identity only (name, email, OAuth tokens).

---

## Backend

- **Runtime:** Node.js
- **Framework:** Express
- **Database client:** `pg`
- **Auth middleware:** `@clerk/express`
- **Environment:** `.env` file with DB credentials and Clerk secret key — never committed to git

### API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sync` | Required | Create user row on first login |
| GET | `/api/recipes` | Public | All approved recipes |
| GET | `/api/recipes/:id` | Public | Single recipe |
| POST | `/api/recipes` | Required | Submit community recipe |
| GET | `/api/meal-plan` | Required | Get user's meal plan |
| POST | `/api/meal-plan` | Required | Add recipe to meal plan |
| DELETE | `/api/meal-plan/:id` | Required | Remove from meal plan |
| GET | `/api/profile` | Required | Get dietary profile |
| PUT | `/api/profile` | Required | Update dietary profile |
| GET | `/api/admin/submissions` | Admin only | List pending submissions |
| PUT | `/api/admin/submissions/:id` | Admin only | Approve or reject |

---

## Database Schema

```sql
-- Synced from Clerk on first login
users (
  id            TEXT PRIMARY KEY,   -- Clerk user ID
  email         TEXT NOT NULL,
  display_name  TEXT,
  role          TEXT DEFAULT 'user', -- 'user' | 'admin'
  created_at    TIMESTAMPTZ DEFAULT now()
)

-- Official recipes + approved community submissions
recipes (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  country       TEXT,
  data          JSONB,              -- all recipe fields (ingredients, steps, etc.)
  dietary_tags  TEXT[],            -- e.g. ['vegetarian', 'gluten-free'] — used for conflict detection
  source        TEXT DEFAULT 'official', -- 'official' | 'community'
  submitted_by  TEXT REFERENCES users(id) NULL, -- NULL for official recipes
  status        TEXT DEFAULT 'approved', -- 'approved' | 'pending' | 'rejected'
  created_at    TIMESTAMPTZ DEFAULT now()
)

-- Simple meal plan list per user
meal_plan_items (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  recipe_id     INT  REFERENCES recipes(id),
  added_at      TIMESTAMPTZ DEFAULT now()
)

-- Dietary profile per user
dietary_profiles (
  user_id       TEXT PRIMARY KEY REFERENCES users(id),
  presets       TEXT[],            -- e.g. ['vegetarian', 'gluten-free']
  custom        TEXT[],            -- e.g. ['no MSG', 'low sodium']
  updated_at    TIMESTAMPTZ DEFAULT now()
)
```

Community submissions enter the `recipes` table with `status = 'pending'` and are only visible publicly once an admin sets `status = 'approved'`.

---

## Features

### User Accounts

- Clerk provides hosted sign-up/login — no auth UI to build
- On first login, React calls `POST /api/auth/sync` to create a `users` row
- Nav gains a user avatar (top-right) with dropdown: Profile, Meal Plan, Sign Out
- Unauthenticated users can still browse recipes and use My Fridge freely

### Meal Planning (`/meal-plan`)

- Simple list — no calendar, no dates
- "Add to Meal Plan" button on every RecipeCard, visible only when logged in
- Meal Plan page shows the saved list with a remove button per recipe
- Duplicate prevention: button is disabled if recipe is already in the plan

### Community Recipes (`/community`)

- Displays all approved community recipes in the same grid layout as Browse Recipes
- Logged-in users see a "Submit a Recipe" button → opens a form (title, country, ingredients, steps)
- Submitted recipes land in the DB with `status = 'pending'`
- Admin approves or rejects via `/admin` page (protected by `role = 'admin'`)

### Dietary Profiles (`/profile`)

- Preset toggles: Vegetarian, Vegan, Gluten-Free, Halal, Dairy-Free, Nut-Free
- Free-text field for custom restrictions (comma-separated)
- When a profile is set, RecipeCards show a small warning badge if the recipe's `dietary_tags` do not include the user's active presets (e.g. user is vegetarian but recipe is not tagged vegetarian)

---

## Frontend Changes

- Add Clerk `<ClerkProvider>` to `main.jsx`
- Add new pages: `/meal-plan`, `/community`, `/profile`, `/admin`
- Update Nav to show avatar + dropdown when logged in
- Update RecipeCard to accept an optional `inMealPlan` prop and show dietary conflict badge
- Migrate static recipe data to DB — seed script converts `src/data/recipes.js` into DB rows
- All data fetching moves from static imports to `fetch()` calls against the Express API

---

## Credential & Security Notes

- DB credentials and Clerk secret key stored in `.env` (gitignored)
- Clerk JWT verification happens in Express middleware before any route handler
- Admin routes additionally check `users.role = 'admin'`
- PostgreSQL password should be rotated before development begins (current one was shared in plaintext)
