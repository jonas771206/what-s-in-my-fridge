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
