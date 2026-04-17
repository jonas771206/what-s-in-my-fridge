# What's In My Fridge — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite SPA that lets users discover recipes based on fridge ingredients, with a warm amber dark design system.

**Architecture:** Four pages (Landing, Browse, Fridge, Detail) using React Router v6 for navigation. All recipe/ingredient data is static JS modules. The matching engine is a pure utility function. Fridge selections live in local component state and are passed to Recipe Detail via router state.

**Tech Stack:** React 18, Vite, React Router v6, CSS Modules, Google Fonts (Inter + Playfair Display), Vitest + @testing-library/react

---

## File Structure

```
/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── styles/
│   │   └── tokens.css
│   ├── data/
│   │   ├── recipes.js
│   │   └── ingredients.js
│   ├── utils/
│   │   ├── matching.js
│   │   └── matching.test.js
│   ├── components/
│   │   ├── Nav/
│   │   │   ├── Nav.jsx
│   │   │   └── Nav.module.css
│   │   └── RecipeCard/
│   │       ├── RecipeCard.jsx
│   │       └── RecipeCard.module.css
│   └── pages/
│       ├── Landing/
│       │   ├── Landing.jsx
│       │   └── Landing.module.css
│       ├── BrowseRecipes/
│       │   ├── BrowseRecipes.jsx
│       │   └── BrowseRecipes.module.css
│       ├── MyFridge/
│       │   ├── MyFridge.jsx
│       │   └── MyFridge.module.css
│       └── RecipeDetail/
│           ├── RecipeDetail.jsx
│           └── RecipeDetail.module.css
```

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`

- [ ] **Step 1: Initialise Vite + React project**

```bash
cd /Users/j/Documents/Whats_In_Your_Fridge_v2
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **No, keep existing files**. Vite will add its files without removing CLAUDE.md.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest in vite.config.js**

Replace the generated `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Add Google Fonts to index.html**

Replace the `<head>` section of `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/Logo.jpeg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>What's In My Fridge</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Replace src/main.jsx**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/tokens.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server running at http://localhost:5173 with no errors.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Vite + React project with routing and test setup"
```

---

## Task 2: Design Tokens & Global CSS

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/App.css`

- [ ] **Step 1: Create design tokens**

Create `src/styles/tokens.css`:

```css
:root {
  /* Colours */
  --bg: #0e0c09;
  --surface: rgba(196, 148, 50, 0.06);
  --border: rgba(196, 148, 50, 0.18);
  --border-subtle: rgba(196, 148, 50, 0.08);
  --gold: #C4943A;
  --gold-glow: rgba(196, 148, 50, 0.07);
  --text-primary: #f5e8c8;
  --text-secondary: rgba(255, 220, 130, 0.50);
  --text-muted: rgba(255, 220, 130, 0.35);

  /* Typography */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Radii */
  --radius-pill: 86px;
  --radius-card: 14px;
  --radius-panel: 10px;
  --radius-chip: 6px;

  /* Card depth */
  --card-shadow: 0 0 28px rgba(196, 148, 50, 0.07), inset 0 1px 0 rgba(196, 148, 50, 0.10);

  /* Motion */
  --spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 2: Create global reset and base styles**

Create `src/App.css`:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

button {
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  background: none;
}

input {
  font-family: var(--font-sans);
}

a {
  color: inherit;
  text-decoration: none;
}

/* Page entry animation */
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: pageEnter 0.4s var(--spring) forwards;
}
```

- [ ] **Step 3: Delete generated CSS files**

```bash
rm src/index.css src/App.jsx 2>/dev/null; true
```

(index.css and default App.jsx are replaced by our files)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and global CSS reset"
```

---

## Task 3: Recipe Data

**Files:**
- Create: `src/data/recipes.js`

- [ ] **Step 1: Create recipes.js with all 25 recipes**

Create `src/data/recipes.js`:

```js
export const recipes = [
  // ── INDIA ──────────────────────────────────────────────
  {
    id: 'chicken-tikka-masala',
    name: 'Chicken Tikka Masala',
    country: 'India', flag: '🇮🇳', cuisine: 'Indian',
    description: 'Charred chicken in a rich spiced tomato-cream sauce. One of the world\'s most popular curries.',
    prepTime: 50, difficulty: 'Medium', servings: 4,
    ingredients: [
      { name: 'Chicken breast', amount: '700g, diced', key: 'chicken-breast' },
      { name: 'Canned tomatoes', amount: '400g', key: 'canned-tomatoes' },
      { name: 'Heavy cream', amount: '150ml', key: 'cream' },
      { name: 'Onion', amount: '1 large', key: 'onion' },
      { name: 'Garlic', amount: '4 cloves', key: 'garlic' },
      { name: 'Ginger', amount: '1 tbsp', key: 'ginger' },
      { name: 'Garam masala', amount: '2 tsp', key: 'garam-masala' },
    ],
    steps: [
      { text: 'Marinate diced chicken in yogurt, garam masala, and salt for 30 minutes.', tip: 'Overnight marinating gives deeper flavour.' },
      { text: 'Grill or pan-fry chicken until charred at the edges. Set aside.' },
      { text: 'Sauté onion, garlic, and ginger until golden. Add tomatoes, simmer 15 minutes.' },
      { text: 'Blend sauce smooth, return to pan, add cream and chicken. Simmer 10 minutes.' },
      { text: 'Season and serve with rice or naan.', tip: 'A knob of butter stirred in at the end adds richness.' },
    ],
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    country: 'India', flag: '🇮🇳', cuisine: 'Indian',
    description: 'A velvety tomato-cream sauce with tender chicken. Milder than tikka masala, impossibly comforting.',
    prepTime: 45, difficulty: 'Medium', servings: 4,
    ingredients: [
      { name: 'Chicken breast', amount: '600g, diced', key: 'chicken-breast' },
      { name: 'Butter', amount: '3 tbsp', key: 'butter' },
      { name: 'Heavy cream', amount: '200ml', key: 'cream' },
      { name: 'Canned tomatoes', amount: '400g', key: 'canned-tomatoes' },
      { name: 'Garlic', amount: '4 cloves', key: 'garlic' },
      { name: 'Garam masala', amount: '2 tsp', key: 'garam-masala' },
    ],
    steps: [
      { text: 'Sear chicken in butter until golden. Remove and set aside.' },
      { text: 'Cook garlic 1 minute. Add tomatoes and garam masala, simmer 10 minutes.' },
      { text: 'Blend sauce smooth. Return to pan, add cream and chicken.', tip: 'Do not boil after adding cream — gentle simmer only.' },
      { text: 'Simmer 10 minutes until sauce coats the back of a spoon. Season.' },
    ],
  },
  {
    id: 'mango-coconut-pudding',
    name: 'Mango Coconut Pudding',
    country: 'India', flag: '🇮🇳', cuisine: 'Indian',
    description: 'A silky chilled dessert of fresh mango purée folded into lightly sweetened coconut cream.',
    prepTime: 20, difficulty: 'Easy', servings: 4,
    ingredients: [
      { name: 'Mango', amount: '2 large, ripe', key: 'mango' },
      { name: 'Coconut milk', amount: '400ml', key: 'coconut-milk' },
      { name: 'Heavy cream', amount: '100ml', key: 'cream' },
      { name: 'Sugar', amount: '3 tbsp', key: 'sugar' },
      { name: 'Lime', amount: '1, juice only', key: 'lime' },
    ],
    steps: [
      { text: 'Blend mango flesh until smooth. Mix with lime juice.' },
      { text: 'Warm coconut milk with sugar until dissolved. Do not boil.' },
      { text: 'Combine mango purée, coconut milk, and cream.', tip: 'Ripe mango may need less sugar — taste first.' },
      { text: 'Pour into glasses. Refrigerate at least 2 hours before serving.' },
    ],
  },
  // ── ITALY ──────────────────────────────────────────────
  {
    id: 'spaghetti-aglio-e-olio',
    name: 'Spaghetti Aglio e Olio',
    country: 'Italy', flag: '🇮🇹', cuisine: 'Italian',
    description: 'The Roman pantry pasta — garlic, olive oil, chili, and parsley. Deceptively simple.',
    prepTime: 20, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Pasta (spaghetti)', amount: '200g', key: 'pasta' },
      { name: 'Garlic', amount: '6 cloves, sliced', key: 'garlic' },
      { name: 'Olive oil', amount: '5 tbsp', key: 'olive-oil' },
      { name: 'Chili flakes', amount: '1 tsp', key: 'chili-flakes' },
    ],
    steps: [
      { text: 'Cook pasta in heavily salted water until al dente. Reserve 1 cup pasta water.' },
      { text: 'Slowly warm garlic in olive oil over low heat until golden — not brown.', tip: 'Burnt garlic makes the dish bitter. Low and slow.' },
      { text: 'Add chili flakes, then drained pasta. Toss with pasta water to make a glossy sauce.' },
      { text: 'Serve immediately with chopped parsley.' },
    ],
  },
  {
    id: 'spaghetti-carbonara',
    name: 'Spaghetti Carbonara',
    country: 'Italy', flag: '🇮🇹', cuisine: 'Italian',
    description: 'Silky egg and pecorino sauce with crispy guanciale. The real Roman carbonara — no cream.',
    prepTime: 25, difficulty: 'Medium', servings: 2,
    ingredients: [
      { name: 'Pasta (spaghetti)', amount: '200g', key: 'pasta' },
      { name: 'Eggs', amount: '3 (2 whole + 1 yolk)', key: 'eggs' },
      { name: 'Cheese (pecorino/parmesan)', amount: '60g, grated', key: 'cheese' },
      { name: 'Bacon / Pancetta', amount: '100g', key: 'bacon' },
    ],
    steps: [
      { text: 'Whisk eggs, yolk, and most of the cheese together. Season with black pepper.' },
      { text: 'Fry pancetta until crispy. Let the pan cool slightly off the heat.' },
      { text: 'Cook pasta al dente. Reserve 1 cup pasta water.' },
      { text: 'Add hot pasta to pancetta pan (off heat). Pour egg mixture over, tossing fast with pasta water.', tip: 'Off-heat is critical — eggs should coat the pasta, not scramble.' },
      { text: 'Toss until creamy. Top with remaining cheese.' },
    ],
  },
  {
    id: 'penne-arrabbiata',
    name: 'Penne Arrabbiata',
    country: 'Italy', flag: '🇮🇹', cuisine: 'Italian',
    description: 'A furiously spiced tomato sauce with garlic and chili. Angry by name, addictive by nature.',
    prepTime: 25, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Pasta (penne)', amount: '200g', key: 'pasta' },
      { name: 'Canned tomatoes', amount: '400g', key: 'canned-tomatoes' },
      { name: 'Garlic', amount: '4 cloves, sliced', key: 'garlic' },
      { name: 'Olive oil', amount: '3 tbsp', key: 'olive-oil' },
      { name: 'Chili flakes', amount: '1½ tsp', key: 'chili-flakes' },
    ],
    steps: [
      { text: 'Cook pasta al dente. Reserve pasta water.' },
      { text: 'Sauté garlic in olive oil until pale gold. Add chili flakes for 30 seconds.' },
      { text: 'Add tomatoes, crush with spoon. Simmer 15 minutes until thick.', tip: 'Season boldly — this sauce should have punch.' },
      { text: 'Toss drained pasta through the sauce with a splash of pasta water.' },
    ],
  },
  // ── MEXICO ─────────────────────────────────────────────
  {
    id: 'beef-tacos',
    name: 'Beef Tacos',
    country: 'Mexico', flag: '🇲🇽', cuisine: 'Mexican',
    description: 'Seasoned ground beef in warm tortillas with fresh salsa and lime.',
    prepTime: 20, difficulty: 'Easy', servings: 4,
    ingredients: [
      { name: 'Ground beef', amount: '500g', key: 'beef-ground' },
      { name: 'Tortillas', amount: '8 small', key: 'tortillas' },
      { name: 'Onion', amount: '1, diced', key: 'onion' },
      { name: 'Tomato', amount: '2, diced', key: 'tomato' },
      { name: 'Lime', amount: '2, wedges', key: 'lime' },
      { name: 'Cheese', amount: '80g, grated', key: 'cheese' },
    ],
    steps: [
      { text: 'Brown beef with diced onion. Season with cumin, paprika, salt, and pepper.' },
      { text: 'Warm tortillas in a dry pan or briefly over a gas flame.' },
      { text: 'Build tacos: beef, fresh tomato, cheese, squeeze of lime.' },
    ],
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    country: 'Mexico', flag: '🇲🇽', cuisine: 'Mexican',
    description: 'Ripe avocado mashed with lime, onion, and tomato. The only guacamole recipe you need.',
    prepTime: 10, difficulty: 'Easy', servings: 4,
    ingredients: [
      { name: 'Avocado', amount: '3 ripe', key: 'avocado' },
      { name: 'Lime', amount: '2, juiced', key: 'lime' },
      { name: 'Onion', amount: '½, finely diced', key: 'onion' },
      { name: 'Tomato', amount: '1, diced', key: 'tomato' },
    ],
    steps: [
      { text: 'Scoop avocado flesh into a bowl.' },
      { text: 'Add lime juice and salt. Mash to your preferred texture.', tip: 'Lime juice prevents browning.' },
      { text: 'Fold in onion and tomato. Adjust seasoning.' },
    ],
  },
  // ── JAPAN ──────────────────────────────────────────────
  {
    id: 'miso-ramen',
    name: 'Miso Ramen',
    country: 'Japan', flag: '🇯🇵', cuisine: 'Japanese',
    description: 'Umami-rich miso broth with springy noodles, a soft-boiled egg, and sesame oil finish.',
    prepTime: 35, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Ramen noodles', amount: '180g', key: 'ramen-noodles' },
      { name: 'Miso paste', amount: '3 tbsp', key: 'miso-paste' },
      { name: 'Eggs', amount: '2', key: 'eggs' },
      { name: 'Soy sauce', amount: '1 tbsp', key: 'soy-sauce' },
      { name: 'Sesame oil', amount: '1 tsp', key: 'sesame-oil' },
      { name: 'Green onion', amount: '2 stalks', key: 'green-onion' },
      { name: 'Garlic', amount: '2 cloves', key: 'garlic' },
      { name: 'Ginger', amount: '1 tsp, grated', key: 'ginger' },
    ],
    steps: [
      { text: 'Soft-boil eggs 6.5 minutes, transfer to ice water, peel.' },
      { text: 'Sauté garlic and ginger. Add 700ml water, bring to a simmer.' },
      { text: 'Whisk miso paste into broth with soy sauce. Do not boil.', tip: 'Boiling destroys miso\'s flavour and makes the broth cloudy.' },
      { text: 'Cook noodles separately, divide into bowls, pour broth over.' },
      { text: 'Top with halved eggs, green onion, and sesame oil.' },
    ],
  },
  {
    id: 'salmon-teriyaki',
    name: 'Salmon Teriyaki',
    country: 'Japan', flag: '🇯🇵', cuisine: 'Japanese',
    description: 'Glossy caramelised salmon in a soy-honey teriyaki glaze. Ready in 20 minutes.',
    prepTime: 20, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Salmon fillet', amount: '2 fillets (300g)', key: 'salmon-fillet' },
      { name: 'Soy sauce', amount: '3 tbsp', key: 'soy-sauce' },
      { name: 'Honey', amount: '2 tbsp', key: 'honey' },
      { name: 'Ginger', amount: '1 tsp, grated', key: 'ginger' },
      { name: 'Sesame oil', amount: '1 tsp', key: 'sesame-oil' },
    ],
    steps: [
      { text: 'Mix soy sauce, honey, ginger, and sesame oil into glaze.' },
      { text: 'Pan-fry salmon skin-side down 3 minutes. Flip, cook 2 more minutes.' },
      { text: 'Pour glaze over salmon, let it bubble and reduce 1–2 minutes, spooning over fish.', tip: 'Watch carefully — honey burns quickly at high heat.' },
    ],
  },
  // ── THAILAND ───────────────────────────────────────────
  {
    id: 'pad-thai',
    name: 'Pad Thai',
    country: 'Thailand', flag: '🇹🇭', cuisine: 'Thai',
    description: 'The definitive Thai stir-fried noodle — tangy, savoury, topped with crushed peanuts.',
    prepTime: 30, difficulty: 'Medium', servings: 2,
    ingredients: [
      { name: 'Rice noodles', amount: '180g, flat', key: 'rice-noodles' },
      { name: 'Eggs', amount: '2', key: 'eggs' },
      { name: 'Tofu', amount: '150g, cubed', key: 'tofu' },
      { name: 'Soy sauce', amount: '2 tbsp', key: 'soy-sauce' },
      { name: 'Lime', amount: '2, wedges', key: 'lime' },
      { name: 'Peanuts', amount: '3 tbsp, crushed', key: 'peanuts' },
      { name: 'Bean sprouts', amount: '100g', key: 'bean-sprouts' },
    ],
    steps: [
      { text: 'Soak rice noodles in warm water 20 minutes. Drain.' },
      { text: 'Stir-fry tofu until golden. Push aside and scramble eggs in same pan.' },
      { text: 'Add noodles and soy sauce. Toss over high heat.' },
      { text: 'Add bean sprouts, toss 30 seconds.' },
      { text: 'Top with crushed peanuts and lime wedges.' },
    ],
  },
  {
    id: 'green-curry',
    name: 'Green Curry',
    country: 'Thailand', flag: '🇹🇭', cuisine: 'Thai',
    description: 'Fragrant green curry paste in coconut milk with chicken and Thai vegetables.',
    prepTime: 30, difficulty: 'Medium', servings: 4,
    ingredients: [
      { name: 'Chicken thigh', amount: '600g, sliced', key: 'chicken-thigh' },
      { name: 'Coconut milk', amount: '400ml', key: 'coconut-milk' },
      { name: 'Green curry paste', amount: '3 tbsp', key: 'green-curry-paste' },
      { name: 'Eggplant', amount: '1, cubed', key: 'eggplant' },
      { name: 'Bell pepper', amount: '1, sliced', key: 'bell-pepper' },
    ],
    steps: [
      { text: 'Fry curry paste in a dry wok 1 minute until fragrant.' },
      { text: 'Add coconut milk, bring to a gentle simmer.' },
      { text: 'Add chicken, eggplant, and bell pepper. Simmer 15 minutes.', tip: 'Thigh stays juicier than breast in curry.' },
      { text: 'Season with salt. Serve with jasmine rice.' },
    ],
  },
  // ── FRANCE ─────────────────────────────────────────────
  {
    id: 'coq-au-vin',
    name: 'Coq au Vin',
    country: 'France', flag: '🇫🇷', cuisine: 'French',
    description: 'Slow-braised whole chicken in red wine with mushrooms, bacon, and onions.',
    prepTime: 90, difficulty: 'Hard', servings: 4,
    ingredients: [
      { name: 'Whole chicken', amount: '1.5kg, jointed', key: 'chicken-whole' },
      { name: 'Red wine', amount: '500ml', key: 'red-wine' },
      { name: 'Mushroom', amount: '200g', key: 'mushroom' },
      { name: 'Onion', amount: '2, quartered', key: 'onion' },
      { name: 'Bacon / Pancetta', amount: '150g, lardons', key: 'bacon' },
      { name: 'Garlic', amount: '4 cloves', key: 'garlic' },
      { name: 'Butter', amount: '2 tbsp', key: 'butter' },
    ],
    steps: [
      { text: 'Brown chicken pieces in butter until golden. Remove.' },
      { text: 'Fry bacon until crispy. Add onion and garlic, cook 3 minutes.' },
      { text: 'Return chicken. Pour over wine to nearly cover. Bring to a simmer.' },
      { text: 'Cover and braise on low 45 minutes, or in oven at 160°C.' },
      { text: 'Add mushrooms in the last 15 minutes.', tip: 'A splash of brandy flambéed at the start adds depth.' },
    ],
  },
  {
    id: 'ratatouille',
    name: 'Ratatouille',
    country: 'France', flag: '🇫🇷', cuisine: 'French',
    description: 'A Provençal vegetable stew — eggplant, zucchini, pepper, and tomato in olive oil.',
    prepTime: 60, difficulty: 'Medium', servings: 4,
    ingredients: [
      { name: 'Eggplant', amount: '1 large', key: 'eggplant' },
      { name: 'Zucchini', amount: '2 medium', key: 'zucchini' },
      { name: 'Bell pepper', amount: '2, mixed', key: 'bell-pepper' },
      { name: 'Tomato', amount: '4 large', key: 'tomato' },
      { name: 'Onion', amount: '1 large', key: 'onion' },
      { name: 'Garlic', amount: '3 cloves', key: 'garlic' },
      { name: 'Olive oil', amount: '4 tbsp', key: 'olive-oil' },
    ],
    steps: [
      { text: 'Dice all vegetables similarly.' },
      { text: 'Sauté onion and garlic 5 minutes. Add bell pepper, cook 5 more minutes.' },
      { text: 'Add eggplant and zucchini, season well. Cook 10 minutes.' },
      { text: 'Add tomatoes and simmer uncovered 25–30 minutes until thick.', tip: 'Ratatouille improves overnight — make it a day ahead.' },
    ],
  },
  {
    id: 'classic-french-omelette',
    name: 'Classic French Omelette',
    country: 'France', flag: '🇫🇷', cuisine: 'French',
    description: 'Pale, baveuse, barely set — the French omelette is a test of technique and butter.',
    prepTime: 10, difficulty: 'Medium', servings: 1,
    ingredients: [
      { name: 'Eggs', amount: '3 large', key: 'eggs' },
      { name: 'Butter', amount: '1 tbsp', key: 'butter' },
      { name: 'Heavy cream', amount: '1 tbsp', key: 'cream' },
    ],
    steps: [
      { text: 'Beat eggs with cream and salt until just combined — no foam.' },
      { text: 'Melt butter in non-stick pan over medium heat until foaming.' },
      { text: 'Pour in eggs. Stir gently with spatula while shaking the pan.' },
      { text: 'When 80% set and still glossy, fold and roll onto a plate.', tip: 'The outside should be pale gold — never browned.' },
    ],
  },
  // ── CHINA ──────────────────────────────────────────────
  {
    id: 'kung-pao-chicken',
    name: 'Kung Pao Chicken',
    country: 'China', flag: '🇨🇳', cuisine: 'Chinese',
    description: 'Diced chicken stir-fried with peanuts, dried chili, and a sweet-savoury sauce.',
    prepTime: 25, difficulty: 'Medium', servings: 2,
    ingredients: [
      { name: 'Chicken breast', amount: '400g, diced', key: 'chicken-breast' },
      { name: 'Peanuts', amount: '50g', key: 'peanuts' },
      { name: 'Bell pepper', amount: '1, diced', key: 'bell-pepper' },
      { name: 'Soy sauce', amount: '2 tbsp', key: 'soy-sauce' },
      { name: 'Chili flakes', amount: '1 tsp', key: 'chili-flakes' },
      { name: 'Garlic', amount: '3 cloves', key: 'garlic' },
      { name: 'Ginger', amount: '1 tsp', key: 'ginger' },
      { name: 'Sesame oil', amount: '1 tsp', key: 'sesame-oil' },
    ],
    steps: [
      { text: 'Marinate chicken in soy sauce and a pinch of cornstarch 10 minutes.' },
      { text: 'Stir-fry chicken in a very hot wok until cooked. Remove.' },
      { text: 'Fry garlic, ginger, and chili flakes 30 seconds. Add bell pepper, toss 1 minute.' },
      { text: 'Return chicken, add peanuts and sesame oil. Toss to combine.', tip: 'A splash of rice vinegar balances the heat.' },
    ],
  },
  {
    id: 'tofu-broccoli-stir-fry',
    name: 'Tofu & Broccoli Stir-Fry',
    country: 'China', flag: '🇨🇳', cuisine: 'Chinese',
    description: 'Crispy tofu and broccoli in a glossy ginger-soy sauce. Fast and protein-packed.',
    prepTime: 20, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Tofu', amount: '300g, firm, cubed', key: 'tofu' },
      { name: 'Broccoli', amount: '1 head, florets', key: 'broccoli' },
      { name: 'Soy sauce', amount: '3 tbsp', key: 'soy-sauce' },
      { name: 'Garlic', amount: '3 cloves', key: 'garlic' },
      { name: 'Ginger', amount: '1 tsp', key: 'ginger' },
      { name: 'Sesame oil', amount: '1 tsp', key: 'sesame-oil' },
    ],
    steps: [
      { text: 'Press tofu 10 minutes to remove moisture. Pan-fry until golden.' },
      { text: 'Blanch broccoli in boiling water 2 minutes. Drain.' },
      { text: 'Stir-fry garlic and ginger 30 seconds. Add broccoli and tofu.' },
      { text: 'Add soy sauce and sesame oil. Toss over high heat 1–2 minutes.', tip: 'A teaspoon of cornstarch mixed with soy sauce makes a silkier sauce.' },
    ],
  },
  {
    id: 'shrimp-fried-rice',
    name: 'Shrimp Fried Rice',
    country: 'China', flag: '🇨🇳', cuisine: 'Chinese',
    description: 'Day-old rice stir-fried with shrimp, egg, and soy sauce. Smoky and quick.',
    prepTime: 20, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Shrimp', amount: '200g, peeled', key: 'shrimp' },
      { name: 'Rice', amount: '300g, cooked day-old', key: 'rice' },
      { name: 'Eggs', amount: '2', key: 'eggs' },
      { name: 'Soy sauce', amount: '2 tbsp', key: 'soy-sauce' },
      { name: 'Green onion', amount: '3 stalks', key: 'green-onion' },
      { name: 'Garlic', amount: '2 cloves', key: 'garlic' },
      { name: 'Sesame oil', amount: '1 tsp', key: 'sesame-oil' },
    ],
    steps: [
      { text: 'Stir-fry shrimp until pink, about 2 minutes. Remove.' },
      { text: 'Scramble eggs in the same wok, breaking into small curds.' },
      { text: 'Add garlic, then cold rice. Press flat and let sit 1 minute to colour.', tip: 'Day-old rice fries better — fresh rice steams instead.' },
      { text: 'Toss rice, add soy sauce, shrimp, sesame oil, and green onion.' },
    ],
  },
  // ── GREECE ─────────────────────────────────────────────
  {
    id: 'moussaka',
    name: 'Moussaka',
    country: 'Greece', flag: '🇬🇷', cuisine: 'Greek',
    description: 'Layered lamb mince and eggplant topped with a thick béchamel crust.',
    prepTime: 90, difficulty: 'Hard', servings: 6,
    ingredients: [
      { name: 'Lamb mince', amount: '600g', key: 'lamb-mince' },
      { name: 'Eggplant', amount: '2 large', key: 'eggplant' },
      { name: 'Onion', amount: '1 large', key: 'onion' },
      { name: 'Canned tomatoes', amount: '400g', key: 'canned-tomatoes' },
      { name: 'Cinnamon', amount: '1 tsp', key: 'cinnamon' },
      { name: 'Eggs', amount: '2 (béchamel)', key: 'eggs' },
      { name: 'Cheese', amount: '50g, grated', key: 'cheese' },
      { name: 'Heavy cream', amount: '200ml (béchamel)', key: 'cream' },
    ],
    steps: [
      { text: 'Slice eggplant, salt and rest 20 minutes. Rinse, roast at 200°C until golden.' },
      { text: 'Brown lamb mince with onion, cinnamon, and tomatoes. Simmer 20 minutes.' },
      { text: 'Make béchamel: melt butter, add flour, whisk in warm cream until thick. Cool, beat in eggs.' },
      { text: 'Layer: eggplant → meat → eggplant → béchamel. Top with cheese.' },
      { text: 'Bake at 180°C for 40 minutes. Rest 15 minutes before cutting.', tip: 'Always better the next day.' },
    ],
  },
  {
    id: 'horiatiki-salad',
    name: 'Horiatiki Salad',
    country: 'Greece', flag: '🇬🇷', cuisine: 'Greek',
    description: 'The original Greek salad — chunky vegetables, olives, and a slab of feta. No lettuce.',
    prepTime: 10, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Tomato', amount: '3 large', key: 'tomato' },
      { name: 'Cucumber', amount: '1', key: 'cucumber' },
      { name: 'Bell pepper', amount: '1 green', key: 'bell-pepper' },
      { name: 'Red onion', amount: '½', key: 'red-onion' },
      { name: 'Olives', amount: '80g kalamata', key: 'olives' },
      { name: 'Cheese (feta)', amount: '150g block', key: 'cheese' },
      { name: 'Olive oil', amount: '3 tbsp', key: 'olive-oil' },
    ],
    steps: [
      { text: 'Chop tomatoes and cucumber into large chunks. Slice pepper and red onion.' },
      { text: 'Combine vegetables with olives in a bowl.' },
      { text: 'Place feta block on top whole — do not crumble.', tip: 'A whole slab stays creamier.' },
      { text: 'Drizzle with olive oil. Season with salt and dried oregano.' },
    ],
  },
  // ── MOROCCO ────────────────────────────────────────────
  {
    id: 'shakshuka',
    name: 'Shakshuka',
    country: 'Morocco', flag: '🇲🇦', cuisine: 'Moroccan',
    description: 'Eggs poached in a spiced tomato and pepper sauce. Perfect any time of day.',
    prepTime: 30, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Eggs', amount: '4', key: 'eggs' },
      { name: 'Canned tomatoes', amount: '400g', key: 'canned-tomatoes' },
      { name: 'Bell pepper', amount: '1, diced', key: 'bell-pepper' },
      { name: 'Onion', amount: '1, diced', key: 'onion' },
      { name: 'Garlic', amount: '3 cloves', key: 'garlic' },
      { name: 'Cumin', amount: '1 tsp', key: 'cumin' },
      { name: 'Paprika', amount: '1 tsp', key: 'paprika' },
    ],
    steps: [
      { text: 'Sauté onion, garlic, and bell pepper in olive oil until soft, about 8 minutes.' },
      { text: 'Add cumin and paprika, stir 1 minute. Add tomatoes, simmer 10 minutes.' },
      { text: 'Make wells in sauce, crack eggs in. Cover and cook on low 5–7 minutes.', tip: 'Check at 5 minutes — whites set, yolks still runny is ideal.' },
      { text: 'Serve straight from the pan with crusty bread.' },
    ],
  },
  {
    id: 'lamb-tagine',
    name: 'Lamb Tagine',
    country: 'Morocco', flag: '🇲🇦', cuisine: 'Moroccan',
    description: 'Slow-braised lamb with warm spices, honey, and olives. Deeply aromatic.',
    prepTime: 100, difficulty: 'Hard', servings: 4,
    ingredients: [
      { name: 'Lamb shoulder', amount: '800g, cubed', key: 'lamb-shoulder' },
      { name: 'Canned tomatoes', amount: '400g', key: 'canned-tomatoes' },
      { name: 'Onion', amount: '2, sliced', key: 'onion' },
      { name: 'Garlic', amount: '4 cloves', key: 'garlic' },
      { name: 'Ginger', amount: '1 tbsp', key: 'ginger' },
      { name: 'Cinnamon', amount: '1 stick', key: 'cinnamon' },
      { name: 'Honey', amount: '2 tbsp', key: 'honey' },
      { name: 'Olives', amount: '80g', key: 'olives' },
    ],
    steps: [
      { text: 'Brown lamb in batches in a heavy pot. Remove.' },
      { text: 'Fry onion, garlic, ginger until soft. Add cinnamon, cook 1 minute.' },
      { text: 'Return lamb, add tomatoes and 300ml water. Bring to a simmer.' },
      { text: 'Cover, cook on low 1.5 hours until falling apart.', tip: 'Any heavy casserole works in place of a tagine pot.' },
      { text: 'Stir in honey and olives. Simmer uncovered 10 minutes to reduce.' },
    ],
  },
  // ── USA ────────────────────────────────────────────────
  {
    id: 'smashed-avocado-toast',
    name: 'Smashed Avocado Toast',
    country: 'USA', flag: '🇺🇸', cuisine: 'American',
    description: 'Ripe avocado on toasted bread with a fried egg and chili flakes.',
    prepTime: 10, difficulty: 'Easy', servings: 2,
    ingredients: [
      { name: 'Avocado', amount: '2 ripe', key: 'avocado' },
      { name: 'Bread', amount: '4 slices, thick-cut', key: 'bread' },
      { name: 'Eggs', amount: '2', key: 'eggs' },
      { name: 'Lemon', amount: '½, juiced', key: 'lemon' },
      { name: 'Chili flakes', amount: '½ tsp', key: 'chili-flakes' },
    ],
    steps: [
      { text: 'Toast bread until golden and sturdy.' },
      { text: 'Mash avocado with lemon juice and salt.' },
      { text: 'Fry eggs sunny-side up.' },
      { text: 'Spread avocado on toast. Top with egg and chili flakes.', tip: 'A flake of sea salt on top makes a real difference.' },
    ],
  },
  {
    id: 'bbq-pork-ribs',
    name: 'BBQ Pork Ribs',
    country: 'USA', flag: '🇺🇸', cuisine: 'American',
    description: 'Fall-off-the-bone pork ribs with a sticky honey-soy glaze. Low and slow.',
    prepTime: 150, difficulty: 'Hard', servings: 4,
    ingredients: [
      { name: 'Pork ribs', amount: '1.2kg, rack', key: 'pork-ribs' },
      { name: 'Garlic', amount: '4 cloves, minced', key: 'garlic' },
      { name: 'Onion', amount: '1, grated', key: 'onion' },
      { name: 'Honey', amount: '3 tbsp', key: 'honey' },
      { name: 'Soy sauce', amount: '3 tbsp', key: 'soy-sauce' },
      { name: 'Mustard', amount: '1 tbsp', key: 'mustard' },
    ],
    steps: [
      { text: 'Remove membrane from back of ribs. Season generously with salt and pepper.' },
      { text: 'Wrap tightly in foil. Bake at 150°C for 2.5 hours.', tip: 'Low and slow breaks down the collagen — don\'t rush it.' },
      { text: 'Mix garlic, onion, honey, soy sauce, and mustard into a glaze.' },
      { text: 'Unwrap ribs, brush with glaze. Bake at 220°C for 15 minutes until caramelised.' },
    ],
  },
  {
    id: 'turkey-stuffed-peppers',
    name: 'Turkey Stuffed Peppers',
    country: 'USA', flag: '🇺🇸', cuisine: 'American',
    description: 'Bell peppers stuffed with seasoned turkey mince, rice, and tomato, topped with melted cheese.',
    prepTime: 50, difficulty: 'Medium', servings: 4,
    ingredients: [
      { name: 'Turkey mince', amount: '400g', key: 'turkey-mince' },
      { name: 'Bell pepper', amount: '4 large', key: 'bell-pepper' },
      { name: 'Rice', amount: '150g, cooked', key: 'rice' },
      { name: 'Tomato', amount: '2, diced', key: 'tomato' },
      { name: 'Cheese', amount: '80g, grated', key: 'cheese' },
      { name: 'Onion', amount: '1, diced', key: 'onion' },
      { name: 'Garlic', amount: '2 cloves', key: 'garlic' },
    ],
    steps: [
      { text: 'Halve peppers, remove seeds. Brush with oil, roast at 200°C for 15 minutes.' },
      { text: 'Brown turkey mince with onion and garlic. Season well.' },
      { text: 'Mix mince with cooked rice and diced tomato.' },
      { text: 'Fill pepper halves. Top with cheese.' },
      { text: 'Bake at 180°C for 20 minutes until cheese is golden.', tip: 'A splash of hot sauce through the filling adds kick.' },
    ],
  },
]
```

- [ ] **Step 2: Verify data is valid**

```bash
node -e "import('./src/data/recipes.js').then(m => console.log('Recipe count:', m.recipes.length))"
```

Expected output: `Recipe count: 25`

- [ ] **Step 3: Commit**

```bash
git add src/data/recipes.js
git commit -m "feat: add all 25 recipe data entries"
```

---

## Task 4: Ingredient Data

**Files:**
- Create: `src/data/ingredients.js`

- [ ] **Step 1: Create ingredients.js**

Create `src/data/ingredients.js`:

```js
export const MEAT_CUTS = {
  chicken: ['breast', 'thigh', 'drumstick', 'wings', 'whole'],
  beef:    ['ribeye', 'ground', 'sirloin', 'brisket', 'chuck', 'short-rib'],
  pork:    ['belly', 'ribs', 'shoulder', 'loin', 'mince', 'chop'],
  lamb:    ['leg', 'rack', 'shoulder', 'chop', 'mince', 'shank'],
  salmon:  ['fillet', 'steak', 'whole', 'smoked'],
  turkey:  ['breast', 'mince', 'whole', 'leg'],
}

// For display: maps cut slug to readable label
export const CUT_LABELS = {
  'chicken-breast': 'Breast',      'chicken-thigh': 'Thigh',
  'chicken-drumstick': 'Drumstick','chicken-wings': 'Wings',
  'chicken-whole': 'Whole',
  'beef-ribeye': 'Ribeye',         'beef-ground': 'Ground',
  'beef-sirloin': 'Sirloin',       'beef-brisket': 'Brisket',
  'beef-chuck': 'Chuck',           'beef-short-rib': 'Short Rib',
  'pork-belly': 'Belly',           'pork-ribs': 'Ribs',
  'pork-shoulder': 'Shoulder',     'pork-loin': 'Loin',
  'pork-mince': 'Mince',           'pork-chop': 'Chop',
  'lamb-leg': 'Leg',               'lamb-rack': 'Rack',
  'lamb-shoulder': 'Shoulder',     'lamb-chop': 'Chop',
  'lamb-mince': 'Mince',           'lamb-shank': 'Shank',
  'salmon-fillet': 'Fillet',       'salmon-steak': 'Steak',
  'salmon-whole': 'Whole',         'salmon-smoked': 'Smoked',
  'turkey-breast': 'Breast',       'turkey-mince': 'Mince',
  'turkey-whole': 'Whole',         'turkey-leg': 'Leg',
}

export const CATEGORIES = [
  {
    id: 'meat',
    label: 'Meat & Protein',
    ingredients: [
      { id: 'chicken', label: '🍗 Chicken', hasCuts: true },
      { id: 'beef',    label: '🥩 Beef',    hasCuts: true },
      { id: 'pork',    label: '🥓 Pork',    hasCuts: true },
      { id: 'lamb',    label: '🐑 Lamb',    hasCuts: true },
      { id: 'salmon',  label: '🐟 Salmon',  hasCuts: true },
      { id: 'turkey',  label: '🦃 Turkey',  hasCuts: true },
      { id: 'tofu',    label: '🧆 Tofu',    hasCuts: false },
      { id: 'eggs',    label: '🥚 Eggs',    hasCuts: false },
      { id: 'shrimp',  label: '🦐 Shrimp',  hasCuts: false },
    ],
  },
  {
    id: 'vegetables',
    label: 'Vegetables',
    ingredients: [
      { id: 'garlic',      label: '🧄 Garlic',      hasCuts: false },
      { id: 'onion',       label: '🧅 Onion',       hasCuts: false },
      { id: 'red-onion',   label: '🧅 Red Onion',   hasCuts: false },
      { id: 'tomato',      label: '🍅 Tomato',      hasCuts: false },
      { id: 'bell-pepper', label: '🫑 Bell Pepper', hasCuts: false },
      { id: 'broccoli',    label: '🥦 Broccoli',    hasCuts: false },
      { id: 'eggplant',    label: '🍆 Eggplant',    hasCuts: false },
      { id: 'zucchini',    label: '🥒 Zucchini',    hasCuts: false },
      { id: 'cucumber',    label: '🥒 Cucumber',    hasCuts: false },
      { id: 'mushroom',    label: '🍄 Mushroom',    hasCuts: false },
      { id: 'green-onion', label: '🌿 Green Onion', hasCuts: false },
      { id: 'spinach',     label: '🌿 Spinach',     hasCuts: false },
    ],
  },
  {
    id: 'fruits',
    label: 'Fruits',
    ingredients: [
      { id: 'mango',   label: '🥭 Mango',   hasCuts: false },
      { id: 'avocado', label: '🥑 Avocado', hasCuts: false },
      { id: 'lemon',   label: '🍋 Lemon',   hasCuts: false },
      { id: 'lime',    label: '🍋 Lime',    hasCuts: false },
    ],
  },
  {
    id: 'pantry',
    label: 'Pantry & Dairy',
    ingredients: [
      { id: 'olive-oil',        label: '🫙 Olive Oil',        hasCuts: false },
      { id: 'butter',           label: '🧈 Butter',           hasCuts: false },
      { id: 'cream',            label: '🥛 Heavy Cream',      hasCuts: false },
      { id: 'cheese',           label: '🧀 Cheese',           hasCuts: false },
      { id: 'pasta',            label: '🍝 Pasta',            hasCuts: false },
      { id: 'rice',             label: '🍚 Rice',             hasCuts: false },
      { id: 'bread',            label: '🍞 Bread',            hasCuts: false },
      { id: 'coconut-milk',     label: '🥥 Coconut Milk',     hasCuts: false },
      { id: 'canned-tomatoes',  label: '🥫 Canned Tomatoes',  hasCuts: false },
      { id: 'soy-sauce',        label: '🍶 Soy Sauce',        hasCuts: false },
      { id: 'sesame-oil',       label: '🫙 Sesame Oil',       hasCuts: false },
      { id: 'honey',            label: '🍯 Honey',            hasCuts: false },
      { id: 'miso-paste',       label: '🍜 Miso Paste',       hasCuts: false },
      { id: 'green-curry-paste',label: '🌿 Green Curry Paste',hasCuts: false },
      { id: 'red-wine',         label: '🍷 Red Wine',         hasCuts: false },
      { id: 'ramen-noodles',    label: '🍜 Ramen Noodles',    hasCuts: false },
      { id: 'rice-noodles',     label: '🍜 Rice Noodles',     hasCuts: false },
      { id: 'tortillas',        label: '🌮 Tortillas',        hasCuts: false },
      { id: 'garam-masala',     label: '🌶 Garam Masala',     hasCuts: false },
      { id: 'ginger',           label: '🫚 Ginger',           hasCuts: false },
      { id: 'chili-flakes',     label: '🌶 Chili Flakes',     hasCuts: false },
      { id: 'cumin',            label: '🌶 Cumin',            hasCuts: false },
      { id: 'paprika',          label: '🌶 Paprika',          hasCuts: false },
      { id: 'cinnamon',         label: '🌿 Cinnamon',         hasCuts: false },
      { id: 'mustard',          label: '🟡 Mustard',          hasCuts: false },
      { id: 'peanuts',          label: '🥜 Peanuts',          hasCuts: false },
      { id: 'olives',           label: '🫒 Olives',           hasCuts: false },
      { id: 'sugar',            label: '🍬 Sugar',            hasCuts: false },
      { id: 'bean-sprouts',     label: '🌱 Bean Sprouts',     hasCuts: false },
      { id: 'bacon',            label: '🥓 Bacon / Pancetta', hasCuts: false },
    ],
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/ingredients.js
git commit -m "feat: add ingredient categories and meat cut data"
```

---

## Task 5: Matching Engine + Tests

**Files:**
- Create: `src/utils/matching.js`
- Create: `src/utils/matching.test.js`

- [ ] **Step 1: Write failing tests first**

Create `src/utils/matching.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { scoreRecipe, rankRecipes } from './matching'

const mockRecipe = {
  id: 'test',
  name: 'Test Recipe',
  ingredients: [
    { name: 'Chicken breast', key: 'chicken-breast' },
    { name: 'Garlic', key: 'garlic' },
    { name: 'Cream', key: 'cream' },
  ],
}

describe('scoreRecipe', () => {
  it('returns 0 have when no ingredients selected', () => {
    const result = scoreRecipe(mockRecipe, [])
    expect(result.have).toBe(0)
    expect(result.total).toBe(3)
    expect(result.percentage).toBe(0)
  })

  it('counts only exact key matches', () => {
    const result = scoreRecipe(mockRecipe, ['chicken-breast', 'garlic'])
    expect(result.have).toBe(2)
    expect(result.percentage).toBe(67)
  })

  it('does not match parent meat when cut is required', () => {
    // Recipe needs 'chicken-breast'; selecting 'chicken-thigh' should not match
    const result = scoreRecipe(mockRecipe, ['chicken-thigh'])
    expect(result.have).toBe(0)
  })

  it('returns 100% when all ingredients present', () => {
    const result = scoreRecipe(mockRecipe, ['chicken-breast', 'garlic', 'cream'])
    expect(result.percentage).toBe(100)
    expect(result.have).toBe(3)
  })

  it('attaches the recipe to the result', () => {
    const result = scoreRecipe(mockRecipe, ['garlic'])
    expect(result.recipe).toBe(mockRecipe)
  })
})

describe('rankRecipes', () => {
  const recipes = [
    { id: 'a', name: 'A', ingredients: [{ key: 'garlic' }, { key: 'onion' }] },
    { id: 'b', name: 'B', ingredients: [{ key: 'garlic' }, { key: 'cream' }, { key: 'butter' }] },
    { id: 'c', name: 'C', ingredients: [{ key: 'pasta' }] },
  ]

  it('excludes recipes with 0 matching ingredients', () => {
    const result = rankRecipes(recipes, ['garlic'])
    const ids = result.map(r => r.recipe.id)
    expect(ids).not.toContain('c')
  })

  it('sorts by percentage descending', () => {
    const result = rankRecipes(recipes, ['garlic', 'onion'])
    expect(result[0].recipe.id).toBe('a') // 2/2 = 100%
    expect(result[1].recipe.id).toBe('b') // 1/3 = 33%
  })

  it('returns empty array when nothing selected', () => {
    const result = rankRecipes(recipes, [])
    expect(result).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: Tests fail with "Cannot find module './matching'"

- [ ] **Step 3: Implement matching.js**

Create `src/utils/matching.js`:

```js
/**
 * Scores a single recipe against selected ingredient keys.
 * Matching is exact-key: 'chicken-breast' only matches 'chicken-breast'.
 */
export function scoreRecipe(recipe, selectedKeys) {
  const have = recipe.ingredients.filter(ing => selectedKeys.includes(ing.key)).length
  const total = recipe.ingredients.length
  const percentage = total === 0 ? 0 : Math.round((have / total) * 100)
  return { recipe, have, total, percentage }
}

/**
 * Scores all recipes, filters out 0-match results, sorts by percentage desc.
 */
export function rankRecipes(recipes, selectedKeys) {
  if (selectedKeys.length === 0) return []
  return recipes
    .map(recipe => scoreRecipe(recipe, selectedKeys))
    .filter(result => result.have > 0)
    .sort((a, b) => b.percentage - a.percentage)
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: All 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add matching engine with full test coverage"
```

---

## Task 6: Nav Component

**Files:**
- Create: `src/components/Nav/Nav.jsx`
- Create: `src/components/Nav/Nav.module.css`

- [ ] **Step 1: Create Nav.module.css**

```css
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 28px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.nav.scrolled {
  background: rgba(14, 12, 9, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  height: 36px;
  width: auto;
  display: block;
}

.links {
  display: flex;
  gap: 28px;
  align-items: center;
}

.link {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 220, 130, 0.45);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: color 0.2s ease;
}

.link:hover {
  color: rgba(255, 220, 130, 0.7);
}

.link.active {
  color: var(--text-primary);
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0;
}

.link.active .dot {
  opacity: 1;
}
```

- [ ] **Step 2: Create Nav.jsx**

```jsx
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './Nav.module.css'
import logo from '/Logo.jpeg'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <NavLink to="/">
        <img src={logo} alt="What's In My Fridge" className={styles.logo} />
      </NavLink>
      <div className={styles.links}>
        <NavLink
          to="/recipes"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Recipes
          <span className={styles.dot} />
        </NavLink>
        <NavLink
          to="/fridge"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          My Fridge
          <span className={styles.dot} />
        </NavLink>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav/
git commit -m "feat: add Nav component with scroll-aware blur and active state"
```

---

## Task 7: RecipeCard Component

**Files:**
- Create: `src/components/RecipeCard/RecipeCard.jsx`
- Create: `src/components/RecipeCard/RecipeCard.module.css`

- [ ] **Step 1: Create RecipeCard.module.css**

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: opacity 0.2s var(--spring);
  text-decoration: none;
  display: block;
  color: inherit;
}

.card:hover {
  opacity: 0.8;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.flag {
  font-size: 20px;
}

.badge {
  font-size: 9px;
  font-weight: 500;
  color: var(--gold);
  background: rgba(196, 148, 50, 0.12);
  border: 1px solid rgba(196, 148, 50, 0.25);
  border-radius: var(--radius-pill);
  padding: 2px 10px;
}

.name {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 5px;
  line-height: 1.3;
}

.desc {
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  font-size: 9px;
  color: var(--text-muted);
}

/* Match bar — shown only in fridge results */
.matchLabel {
  font-size: 10px;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.matchLabel strong {
  color: var(--gold);
}

.matchTrack {
  width: 100%;
  height: 3px;
  background: rgba(196, 148, 50, 0.12);
  border-radius: 2px;
  overflow: hidden;
}

.matchFill {
  height: 100%;
  background: linear-gradient(90deg, #C4943A, #e8b84b);
  border-radius: 2px;
  transition: width 0.4s var(--spring);
}
```

- [ ] **Step 2: Create RecipeCard.jsx**

```jsx
import { Link } from 'react-router-dom'
import styles from './RecipeCard.module.css'

/**
 * Props:
 *   recipe      — recipe object from recipes.js
 *   matchResult — optional { have, total, percentage } from matching engine
 *   fromFridge  — boolean, whether navigation originates from fridge page
 *   selected    — array of selected ingredient keys (passed via router state)
 */
export default function RecipeCard({ recipe, matchResult, fromFridge, selected }) {
  const state = fromFridge ? { fromFridge: true, selected } : undefined

  return (
    <Link to={`/recipes/${recipe.id}`} state={state} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.flag}>{recipe.flag}</span>
        <span className={styles.badge}>{recipe.difficulty}</span>
      </div>
      <div className={styles.name}>{recipe.name}</div>
      <div className={styles.desc}>{recipe.description}</div>

      {matchResult ? (
        <>
          <div className={styles.matchLabel}>
            You have <strong>{matchResult.have} of {matchResult.total}</strong> ingredients
          </div>
          <div className={styles.matchTrack}>
            <div
              className={styles.matchFill}
              style={{ width: `${matchResult.percentage}%` }}
            />
          </div>
        </>
      ) : (
        <div className={styles.meta}>⏱ {recipe.prepTime} min · {recipe.cuisine}</div>
      )}
    </Link>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RecipeCard/
git commit -m "feat: add RecipeCard component with optional match bar"
```

---

## Task 8: Landing Page

**Files:**
- Create: `src/pages/Landing/Landing.jsx`
- Create: `src/pages/Landing/Landing.module.css`

- [ ] **Step 1: Create Landing.module.css**

```css
.page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.orb1 {
  width: 380px;
  height: 380px;
  background: rgba(196, 148, 50, 0.09);
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  animation: pulse1 7s ease-in-out infinite;
}

.orb2 {
  width: 220px;
  height: 220px;
  background: rgba(196, 148, 50, 0.06);
  bottom: 0;
  left: 5%;
  animation: pulse2 9s ease-in-out infinite 2s;
}

.orb3 {
  width: 180px;
  height: 180px;
  background: rgba(196, 148, 50, 0.05);
  bottom: 20px;
  right: 5%;
  animation: pulse2 8s ease-in-out infinite 4s;
}

@keyframes pulse1 {
  0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
  50%       { opacity: 1;   transform: translateX(-50%) scale(1.1); }
}

@keyframes pulse2 {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.12); }
}

.hero {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 48px 24px;
  max-width: 500px;
  animation: pageEnter 0.5s var(--spring) forwards;
}

.logo {
  width: 200px;
  height: auto;
}

.title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 44px;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin-top: 4px;
}

.subtitle {
  font-weight: 300;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.ctas {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.ctaPrimary {
  border: 1px solid rgba(196, 148, 50, 0.55);
  border-radius: var(--radius-pill);
  padding: 10px 26px;
  font-size: 13px;
  font-weight: 500;
  color: var(--gold);
  background: rgba(196, 148, 50, 0.07);
  transition: opacity 0.2s ease;
}

.ctaPrimary:hover { opacity: 0.75; }

.ctaSecondary {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-pill);
  padding: 10px 26px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  transition: opacity 0.2s ease;
}

.ctaSecondary:hover { opacity: 0.75; }
```

- [ ] **Step 2: Create Landing.jsx**

```jsx
import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'
import logo from '/Logo.jpeg'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.orb + ' ' + styles.orb1} />
      <div className={styles.orb + ' ' + styles.orb2} />
      <div className={styles.orb + ' ' + styles.orb3} />

      <div className={styles.hero}>
        <img src={logo} alt="What's In My Fridge" className={styles.logo} />
        <h1 className={styles.title}>Discover recipes<br />from what you have.</h1>
        <p className={styles.subtitle}>25 global recipes. No login. Just cook.</p>
        <div className={styles.ctas}>
          <button className={styles.ctaPrimary} onClick={() => navigate('/recipes')}>
            Browse Recipes
          </button>
          <button className={styles.ctaSecondary} onClick={() => navigate('/fridge')}>
            Open My Fridge
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing/
git commit -m "feat: add Landing page with animated orbs and hero CTA"
```

---

## Task 9: Browse Recipes Page

**Files:**
- Create: `src/pages/BrowseRecipes/BrowseRecipes.jsx`
- Create: `src/pages/BrowseRecipes/BrowseRecipes.module.css`

- [ ] **Step 1: Create BrowseRecipes.module.css**

```css
.page {
  padding: 32px 28px 64px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 32px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.search {
  width: 100%;
  background: rgba(196, 148, 50, 0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s ease;
}

.search::placeholder { color: var(--text-muted); }
.search:focus { border-color: rgba(196, 148, 50, 0.45); }

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

.pill {
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pill:hover { border-color: rgba(196, 148, 50, 0.35); color: var(--text-primary); }

.pill.active {
  border-color: rgba(196, 148, 50, 0.55);
  background: rgba(196, 148, 50, 0.10);
  color: var(--gold);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
  font-size: 14px;
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .page { padding: 24px 16px 48px; }
  .grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Create BrowseRecipes.jsx**

```jsx
import { useState, useMemo } from 'react'
import { recipes } from '../../data/recipes'
import RecipeCard from '../../components/RecipeCard/RecipeCard'
import styles from './BrowseRecipes.module.css'

const COUNTRIES = ['All', 'China', 'France', 'Greece', 'India', 'Italy', 'Japan', 'Morocco', 'Mexico', 'Thailand', 'USA']

const FLAG = { China:'🇨🇳', France:'🇫🇷', Greece:'🇬🇷', India:'🇮🇳', Italy:'🇮🇹', Japan:'🇯🇵', Morocco:'🇲🇦', Mexico:'🇲🇽', Thailand:'🇹🇭', USA:'🇺🇸' }

export default function BrowseRecipes() {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
      const matchesCountry = country === 'All' || r.country === country
      return matchesSearch && matchesCountry
    })
  }, [search, country])

  return (
    <div className={`${styles.page} page-enter`}>
      <h1 className={styles.title}>All Recipes</h1>
      <p className={styles.subtitle}>25 dishes across 10 countries</p>

      <input
        className={styles.search}
        type="text"
        placeholder="Search recipes…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className={styles.filters}>
        {COUNTRIES.map(c => (
          <button
            key={c}
            className={`${styles.pill} ${country === c ? styles.active : ''}`}
            onClick={() => setCountry(c)}
          >
            {c === 'All' ? 'All' : `${FLAG[c]} ${c}`}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No recipes match your search.</div>
        ) : (
          filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/BrowseRecipes/
git commit -m "feat: add Browse Recipes page with live search and country filter"
```

---

## Task 10: My Fridge Page

**Files:**
- Create: `src/pages/MyFridge/MyFridge.jsx`
- Create: `src/pages/MyFridge/MyFridge.module.css`

- [ ] **Step 1: Create MyFridge.module.css**

```css
.page {
  padding: 32px 28px 120px;
  max-width: 960px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 32px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.category {
  margin-bottom: 28px;
}

.categoryLabel {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(196, 148, 50, 0.55);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid var(--border);
  border-radius: var(--radius-chip);
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.15s ease;
}

.chip:hover {
  border-color: rgba(196, 148, 50, 0.35);
  color: rgba(255, 220, 130, 0.8);
}

.chip.selected {
  border-color: rgba(196, 148, 50, 0.6);
  background: rgba(196, 148, 50, 0.12);
  color: var(--gold);
  box-shadow: 0 0 10px rgba(196, 148, 50, 0.08);
}

.cutTray {
  margin-top: 10px;
  padding: 12px 16px;
  background: rgba(196, 148, 50, 0.03);
  border: 1px solid rgba(196, 148, 50, 0.12);
  border-radius: var(--radius-panel);
}

.cutTrayLabel {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(196, 148, 50, 0.4);
  margin-bottom: 8px;
}

.cutChips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cutChip {
  border: 1px solid rgba(196, 148, 50, 0.15);
  border-radius: var(--radius-chip);
  padding: 4px 11px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 220, 130, 0.45);
  background: transparent;
  transition: all 0.15s ease;
}

.cutChip:hover { opacity: 0.75; }

.cutChip.selected {
  border-color: rgba(196, 148, 50, 0.55);
  background: rgba(196, 148, 50, 0.10);
  color: var(--gold);
}

/* Sticky bottom bar */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(14, 12, 9, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-subtle);
  z-index: 50;
}

.count {
  font-size: 13px;
  color: var(--text-secondary);
}

.count strong { color: var(--gold); }

.findBtn {
  border: 1px solid rgba(196, 148, 50, 0.55);
  border-radius: var(--radius-pill);
  padding: 10px 28px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
  background: rgba(196, 148, 50, 0.08);
  transition: opacity 0.2s ease;
}

.findBtn:hover { opacity: 0.75; }
.findBtn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Results */
.results {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-subtle);
}

.resultsTitle {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 22px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

@media (max-width: 1024px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  {
  .page { padding: 24px 16px 120px; }
  .grid { grid-template-columns: 1fr; }
  .bottomBar { padding: 14px 16px; }
}
```

- [ ] **Step 2: Create MyFridge.jsx**

```jsx
import { useState, useRef } from 'react'
import { CATEGORIES, MEAT_CUTS, CUT_LABELS } from '../../data/ingredients'
import { rankRecipes } from '../../utils/matching'
import { recipes } from '../../data/recipes'
import RecipeCard from '../../components/RecipeCard/RecipeCard'
import styles from './MyFridge.module.css'

export default function MyFridge() {
  // selectedKeys: Set of ingredient key strings (e.g. 'chicken-breast', 'garlic')
  const [selectedKeys, setSelectedKeys] = useState(new Set())
  // openCutMeat: which meat's cut tray is open (e.g. 'chicken'), or null
  const [openCutMeat, setOpenCutMeat] = useState(null)
  // results: ranked recipe results, null means not yet searched
  const [results, setResults] = useState(null)
  const resultsRef = useRef(null)

  function togglePlainIngredient(id) {
    setSelectedKeys(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleMeat(meatId) {
    // If opening a different meat, close previous cut tray
    setOpenCutMeat(prev => prev === meatId ? null : meatId)
  }

  function toggleCut(meatId, cut) {
    const key = `${meatId}-${cut}`
    setSelectedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function isMeatActive(meatId) {
    return MEAT_CUTS[meatId].some(cut => selectedKeys.has(`${meatId}-${cut}`))
  }

  function handleFind() {
    const ranked = rankRecipes(recipes, [...selectedKeys])
    setResults(ranked)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const totalSelected = selectedKeys.size

  return (
    <div className={`${styles.page} page-enter`}>
      <h1 className={styles.title}>My Fridge</h1>
      <p className={styles.subtitle}>Select what you have — we'll find matching recipes.</p>

      {CATEGORIES.map(category => (
        <div key={category.id} className={styles.category}>
          <div className={styles.categoryLabel}>{category.label}</div>
          <div className={styles.chips}>
            {category.ingredients.map(ing => {
              if (ing.hasCuts) {
                const active = isMeatActive(ing.id)
                const isOpen = openCutMeat === ing.id
                return (
                  <button
                    key={ing.id}
                    className={`${styles.chip} ${(active || isOpen) ? styles.selected : ''}`}
                    onClick={() => toggleMeat(ing.id)}
                  >
                    {ing.label} {isOpen ? '▴' : '▾'}
                  </button>
                )
              }
              return (
                <button
                  key={ing.id}
                  className={`${styles.chip} ${selectedKeys.has(ing.id) ? styles.selected : ''}`}
                  onClick={() => togglePlainIngredient(ing.id)}
                >
                  {ing.label}
                </button>
              )
            })}
          </div>

          {/* Cut tray — rendered inside the Meat & Protein category only */}
          {category.id === 'meat' && openCutMeat && (
            <div className={styles.cutTray}>
              <div className={styles.cutTrayLabel}>
                {openCutMeat.charAt(0).toUpperCase() + openCutMeat.slice(1)} — select a cut
              </div>
              <div className={styles.cutChips}>
                {MEAT_CUTS[openCutMeat].map(cut => {
                  const key = `${openCutMeat}-${cut}`
                  return (
                    <button
                      key={key}
                      className={`${styles.cutChip} ${selectedKeys.has(key) ? styles.selected : ''}`}
                      onClick={() => toggleCut(openCutMeat, cut)}
                    >
                      {CUT_LABELS[key] || cut}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      {results && (
        <div className={styles.results} ref={resultsRef}>
          <div className={styles.resultsTitle}>
            {results.length === 0
              ? 'No matching recipes — try adding more ingredients.'
              : `Recipes you can make`}
          </div>
          <div className={styles.grid}>
            {results.map(({ recipe, have, total, percentage }) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                matchResult={{ have, total, percentage }}
                fromFridge
                selected={[...selectedKeys]}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.bottomBar}>
        <div className={styles.count}>
          <strong>{totalSelected}</strong> ingredient{totalSelected !== 1 ? 's' : ''} selected
        </div>
        <button
          className={styles.findBtn}
          onClick={handleFind}
          disabled={totalSelected === 0}
        >
          Find Recipes →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/MyFridge/
git commit -m "feat: add My Fridge page with chip selection, cut trays, and results"
```

---

## Task 11: Recipe Detail Page

**Files:**
- Create: `src/pages/RecipeDetail/RecipeDetail.jsx`
- Create: `src/pages/RecipeDetail/RecipeDetail.module.css`

- [ ] **Step 1: Create RecipeDetail.module.css**

```css
.page {
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 64px;
}

.breadcrumb {
  padding: 14px 28px;
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--border-subtle);
}

.breadcrumb a {
  color: var(--gold);
  cursor: pointer;
}

.hero {
  padding: 28px 28px 24px;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(196, 148, 50, 0.02);
}

.heroTop {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.flag { font-size: 36px; }

.country {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(196, 148, 50, 0.55);
}

.recipeTitle {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 36px;
  color: var(--text-primary);
  line-height: 1.15;
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 560px;
  margin-bottom: 18px;
}

.metaRow {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.metaItem { display: flex; flex-direction: column; gap: 2px; }

.metaLabel {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(196, 148, 50, 0.4);
}

.metaValue {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

/* Two-column body */
.body {
  display: grid;
  grid-template-columns: 240px 1fr;
  align-items: start;
}

.sidebar {
  padding: 20px 24px 24px 28px;
  border-right: 1px solid var(--border-subtle);
}

.matchBanner {
  padding: 11px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  margin-bottom: 20px;
}

.matchBannerText {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 7px;
}

.matchBannerText strong { color: var(--gold); }

.matchTrack {
  width: 100%;
  height: 3px;
  background: rgba(196, 148, 50, 0.12);
  border-radius: 2px;
  overflow: hidden;
}

.matchFill {
  height: 100%;
  background: linear-gradient(90deg, #C4943A, #e8b84b);
  border-radius: 2px;
}

.sectionLabel {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(196, 148, 50, 0.5);
  margin-bottom: 12px;
}

.ingredientRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid rgba(196, 148, 50, 0.06);
  gap: 8px;
}

.ingredientName {
  font-size: 12px;
  color: var(--text-secondary);
}

.ingredientRight {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ingredientAmount {
  font-size: 11px;
  color: var(--text-muted);
}

.haveBadge {
  font-size: 9px;
  font-weight: 600;
  color: var(--gold);
  background: rgba(196, 148, 50, 0.10);
  border: 1px solid rgba(196, 148, 50, 0.25);
  border-radius: 4px;
  padding: 1px 6px;
}

/* Instructions */
.instructions {
  padding: 20px 28px 24px 24px;
}

.step {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stepNum {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 40px;
  color: rgba(196, 148, 50, 0.45);
  line-height: 1;
  flex-shrink: 0;
  width: 36px;
  text-align: right;
}

.stepBody { padding-top: 4px; }

.stepText {
  font-size: 13px;
  color: rgba(255, 220, 130, 0.70);
  line-height: 1.65;
}

.stepTip {
  font-size: 11px;
  font-style: italic;
  color: rgba(255, 220, 130, 0.38);
  margin-top: 6px;
  padding-left: 10px;
  border-left: 2px solid rgba(196, 148, 50, 0.2);
}

/* Mobile */
@media (max-width: 768px) {
  .body { grid-template-columns: 1fr; }
  .sidebar { border-right: none; border-bottom: 1px solid var(--border-subtle); padding: 20px 16px; }
  .instructions { padding: 20px 16px; }
  .hero { padding: 20px 16px; }
  .breadcrumb { padding: 12px 16px; }
  .recipeTitle { font-size: 28px; }
}
```

- [ ] **Step 2: Create RecipeDetail.jsx**

```jsx
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { recipes } from '../../data/recipes'
import { scoreRecipe } from '../../utils/matching'
import styles from './RecipeDetail.module.css'

export default function RecipeDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const recipe = recipes.find(r => r.id === id)
  const fromFridge = location.state?.fromFridge ?? false
  const selected = location.state?.selected ?? []

  if (!recipe) {
    return (
      <div style={{ padding: '48px 28px', color: 'var(--text-muted)' }}>
        Recipe not found.
      </div>
    )
  }

  const matchResult = fromFridge ? scoreRecipe(recipe, selected) : null

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a onClick={() => navigate(fromFridge ? '/fridge' : '/recipes')}>
          ← {fromFridge ? 'My Fridge' : 'Recipes'}
        </a>
        <span style={{ opacity: 0.4 }}>/</span>
        <span>{recipe.name}</span>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.flag}>{recipe.flag}</span>
          <span className={styles.country}>{recipe.country} · {recipe.cuisine}</span>
        </div>
        <h1 className={styles.recipeTitle}>{recipe.name}</h1>
        <p className={styles.desc}>{recipe.description}</p>
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Prep time</div>
            <div className={styles.metaValue}>{recipe.prepTime} min</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Difficulty</div>
            <div className={styles.metaValue}>{recipe.difficulty}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Servings</div>
            <div className={styles.metaValue}>{recipe.servings}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Cuisine</div>
            <div className={styles.metaValue}>{recipe.cuisine}</div>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className={styles.body}>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {matchResult && (
            <div className={styles.matchBanner}>
              <div className={styles.matchBannerText}>
                You have <strong>{matchResult.have} of {matchResult.total}</strong> ingredients
              </div>
              <div className={styles.matchTrack}>
                <div
                  className={styles.matchFill}
                  style={{ width: `${matchResult.percentage}%` }}
                />
              </div>
            </div>
          )}

          <div className={styles.sectionLabel}>Ingredients</div>
          {recipe.ingredients.map((ing, i) => {
            const have = selected.includes(ing.key)
            return (
              <div key={i} className={styles.ingredientRow}>
                <span className={styles.ingredientName}>{ing.name}</span>
                <div className={styles.ingredientRight}>
                  <span className={styles.ingredientAmount}>{ing.amount}</span>
                  {have && <span className={styles.haveBadge}>✓ have</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <div className={styles.sectionLabel}>Instructions</div>
          {recipe.steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepBody}>
                <div className={styles.stepText}>{step.text}</div>
                {step.tip && <div className={styles.stepTip}>{step.tip}</div>}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/RecipeDetail/
git commit -m "feat: add Recipe Detail page with two-column layout and match banner"
```

---

## Task 12: App Routing

**Files:**
- Create: `src/App.jsx`

- [ ] **Step 1: Create App.jsx**

```jsx
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav/Nav'
import Landing from './pages/Landing/Landing'
import BrowseRecipes from './pages/BrowseRecipes/BrowseRecipes'
import MyFridge from './pages/MyFridge/MyFridge'
import RecipeDetail from './pages/RecipeDetail/RecipeDetail'

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {!isLanding && <Nav />}
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/recipes"     element={<BrowseRecipes />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/fridge"      element={<MyFridge />} />
      </Routes>
    </>
  )
}
```

- [ ] **Step 2: Verify all pages are reachable**

```bash
npm run dev
```

Manually visit each route and confirm they render without console errors:
- `http://localhost:5173/` — Landing page with animated orbs
- `http://localhost:5173/recipes` — Browse page with all 25 recipe cards
- `http://localhost:5173/fridge` — Fridge page with ingredient chips
- `http://localhost:5173/recipes/butter-chicken` — Recipe Detail with two-column layout

- [ ] **Step 3: Run all tests one final time**

```bash
npm test
```

Expected: All 8 tests pass.

- [ ] **Step 4: Final commit**

```bash
git add src/App.jsx
git commit -m "feat: wire up all routes and hide nav on landing page"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] §1 Brand/naming — "What's In My Fridge" used in index.html title, logo alt text, nav
- [x] §2.1 Colour palette — all tokens defined in tokens.css
- [x] §2.2 Typography — Playfair Display italic for display, Inter for UI, loaded via Google Fonts
- [x] §2.3 Depth system — `--card-shadow` token applied in RecipeCard
- [x] §2.4 Radius scale — all four radii as CSS custom properties
- [x] §2.5 Motion — `--spring` easing, `pageEnter` animation, orb pulse animations
- [x] §3 Navigation — sticky, hidden on landing, scroll-aware blur, gold dot active state
- [x] §4 Landing — full-screen hero, three orbs, logo, serif headline, two CTAs
- [x] §5 Browse Recipes — live search, country filter pills, 3-col grid, responsive
- [x] §6 My Fridge — categories, chips, cut tray system, sticky bottom bar, results
- [x] §6.5 Results — match bar with "You have X of Y ingredients" label above bar
- [x] §7 Recipe Detail — breadcrumb, hero panel, two-column body, match banner in sidebar, `✓ have` badges, chef's tips
- [x] §8 Responsive — grid breakpoints at 640px and 1024px

**Type consistency:** `scoreRecipe` returns `{ recipe, have, total, percentage }` — same shape used in RecipeCard props (`matchResult`) and RecipeDetail.

**No placeholders detected.**
