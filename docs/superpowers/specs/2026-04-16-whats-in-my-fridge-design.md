# What's In My Fridge — Design Spec
**Date:** 2026-04-16  
**Status:** Approved

---

## 1. Brand & Naming

The product is called **"What's In My Fridge"** throughout — logo, nav, page titles, CTA labels, and browser tab. "Your" is never used. The logo file (`Logo.jpeg`) is the canonical wordmark.

---

## 2. Visual Foundation

### 2.1 Colour Palette

| Token | Value | Role |
|---|---|---|
| Background | `#0e0c09` | Warm near-black canvas |
| Surface | `rgba(196,148,50,0.06)` | Card and chip backgrounds |
| Border | `rgba(196,148,50,0.18)` | All structural borders |
| Border subtle | `rgba(196,148,50,0.08–0.10)` | Dividers, nav underline, sidebar rule |
| Gold accent | `#C4943A` | Labels, active states, CTAs, match bars |
| Gold glow | `rgba(196,148,50,0.07)` | Card outer glow (box-shadow) |
| Text primary | `#f5e8c8` | Headings, body copy |
| Text secondary | `rgba(255,220,130,0.50)` | Descriptions, meta rows |
| Text muted | `rgba(255,220,130,0.35)` | Captions, placeholders |

### 2.2 Typography

| Role | Font | Style | Size | Weight |
|---|---|---|---|---|
| Hero headline | Playfair Display | italic | 44px | 400 |
| Page title | Playfair Display | italic | 32px | 400 |
| Recipe card name | Playfair Display | italic | 15px | 400 |
| Recipe detail title | Playfair Display | italic | 36px | 400 |
| Step ghost numbers | Playfair Display | italic | 40px | 400 |
| Body / descriptions | Inter | normal | 13–15px | 300–400 |
| Nav links, buttons | Inter | normal | 13px | 500 |
| Category labels, meta | Inter | normal | 9–11px | 500–600 |
| Badges, chips | Inter | normal | 9–12px | 500 |

**Rule:** Playfair Display (italic) is used only for display moments — hero, page titles, recipe names, step numbers. Inter handles all UI, navigation, body, and utility text.

### 2.3 Depth System

Cards use a three-layer warmth system:
```
background: rgba(196,148,50,0.06)
border: 1px solid rgba(196,148,50,0.18)
box-shadow: 0 0 28px rgba(196,148,50,0.07),
            inset 0 1px 0 rgba(196,148,50,0.10)
```
The `inset 0 1px 0` gives a subtle rim-lit top edge. No traditional elevation shadows.

### 2.4 Border Radius Scale

| Value | Used on |
|---|---|
| `86px` (pill) | CTA buttons, country filter pills |
| `14px` | Recipe cards, result cards |
| `10px` | Cut tray, match banner, search bar, recipe detail panels |
| `6px` | Ingredient chips, difficulty/cuisine badges |

### 2.5 Motion

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring) on card entries and page transitions
- Landing page: three radial gradient orbs pulse with `opacity` and `scale` — 6–9s intervals, staggered delays
- Only `transform` and `opacity` animate — never `width`, `color`, or `transform-all`
- Page transitions: subtle fade + upward slide

---

## 3. Navigation

- **Visibility:** Hidden on Landing page; visible on all other pages
- **Position:** Sticky top bar
- **Scroll state:** `background: rgba(14,12,9,0.85)` + `backdrop-filter: blur(12px)` + bottom border `rgba(196,148,50,0.10)`
- **Left:** `Logo.jpeg` at 32px height — links to Landing
- **Right:** Two links — `Recipes` and `My Fridge` — Inter 500 13px, `rgba(255,220,130,0.45)`
- **Active state:** Link brightens to `#f5e8c8`; a 4px gold dot (`#C4943A`) appears centred below it
- **Mobile:** No hamburger — two links fit at all widths

---

## 4. Landing Page

Full-screen hero. No nav bar.

**Background:** `#0e0c09` with three slow-breathing radial gradient orbs:
- Orb 1: `rgba(196,148,50,0.09)`, 380px, top-centre, 7s pulse
- Orb 2: `rgba(196,148,50,0.06)`, 220px, bottom-left, 9s pulse, 2s delay
- Orb 3: `rgba(196,148,50,0.05)`, 180px, bottom-right, 8s pulse, 4s delay
- All orbs use `filter: blur(80px)` and animate only `opacity` and `scale`

**Centre stack (vertically centred, text-align centre):**
1. `Logo.jpeg` — 200px wide
2. Italic serif headline — *"Discover recipes from what you have."* — 44px Playfair Display, `#f5e8c8`
3. Subtagline — *"25 global recipes. No login. Just cook."* — 15px Inter 300, `rgba(255,220,130,0.50)`
4. Two pill CTAs — gap 12px:
   - **Browse Recipes** — border `rgba(196,148,50,0.55)`, bg `rgba(196,148,50,0.07)`, text `#C4943A`
   - **Open My Fridge** — border `rgba(255,255,255,0.14)`, bg transparent, text `rgba(255,220,130,0.55)`
   - Both: `border-radius: 86px`, `padding: 10px 26px`, Inter 500 13px

---

## 5. Browse Recipes Page

**Page title:** "All Recipes" — 32px Playfair Display italic  
**Subtitle:** "25 dishes across 14 countries" — Inter 400 13px, muted

### 5.1 Search Bar
Full-width input below the title. Background `rgba(196,148,50,0.04)`, border `rgba(196,148,50,0.18)`, radius `10px`. Filters recipe names live as the user types.

### 5.2 Country Filter Pills
Wrap layout, gap 8px, below the search bar. Pills: border `rgba(196,148,50,0.18)`, radius `86px`, 11px Inter 500.
- Default (All): "All" pill is gold-active; others are muted
- Active country: border `rgba(196,148,50,0.55)`, bg `rgba(196,148,50,0.10)`, text `#C4943A`
- Countries (alphabetical): All · 🇨🇳 China · 🇫🇷 France · 🇬🇷 Greece · 🇮🇳 India · 🇮🇹 Italy · 🇯🇵 Japan · 🇲🇦 Morocco · 🇲🇽 Mexico · 🇹🇭 Thailand · 🇺🇸 USA

### 5.3 Recipe Cards (grid)
- Layout: 3-column → 2-column (tablet) → 1-column (mobile)
- Gap: 14px
- Each card uses the warm-glow card style (see §2.3)
- Card anatomy (top to bottom):
  1. Flag emoji (20px) + difficulty badge (pill, gold) — space-between
  2. Recipe name — 15px Playfair Display italic, `#f5e8c8`
  3. Description — 10px Inter 400, secondary text, 2 lines max
  4. Meta row — prep time + cuisine, 9px Inter, muted

---

## 6. My Fridge Page

**Page title:** "My Fridge" — 32px Playfair Display italic  
**Subtitle:** "Select what you have — we'll find matching recipes."

### 6.1 Ingredient Categories
Four sections, each with a category label (10px Inter 600, uppercase, letter-spacing 1.5px, gold muted) and a bottom divider `rgba(196,148,50,0.08)`:
1. Meat & Protein
2. Vegetables
3. Fruits
4. Pantry & Dairy

### 6.2 Ingredient Chips
- Default: border `rgba(196,148,50,0.18)`, radius `6px`, 12px Inter 500, text `rgba(255,220,130,0.55)`
- Selected: border `rgba(196,148,50,0.60)`, bg `rgba(196,148,50,0.12)`, text `#C4943A`, subtle glow
- Hover: border and text brighten slightly (opacity transition 0.15s)

### 6.3 Meat Cut System
Six meats (Chicken, Beef, Pork, Lamb, Salmon, Turkey) show a `▾` indicator. Clicking one opens a **cut tray** below the entire chip row — all meat chips remain visible. The cut tray:
- Background `rgba(196,148,50,0.03)`, border `rgba(196,148,50,0.12)`, radius `10px`
- Cut label: `"{Meat name} — select a cut"` (dynamic, e.g. "Chicken — select a cut") in 9px Inter 600 uppercase
- Cut chips: smaller variant (11px, radius `6px`, same selected style)
- Only one meat's cut tray is open at a time

### 6.4 Sticky Bottom Bar
Always visible, pinned to viewport bottom:
- Background `rgba(14,12,9,0.92)` + `backdrop-filter: blur(12px)`
- Top border `rgba(196,148,50,0.10)`
- Left: `{n} ingredients selected` — Inter 13px, count in `#C4943A`
- Right: **Find Recipes →** pill button (gold border, gold text, `86px` radius)

### 6.5 Results (below the fold, smooth-scrolled to)
- Section title: "Recipes you can make" — 22px Playfair Display italic
- Same 3-column grid as Browse Recipes
- Each card adds the match indicator:
  - `"You have {n} of {total} ingredients"` — 10px Inter, `rgba(255,220,130,0.55)`, bold count in `#C4943A`
  - Progress bar below: 3px height, bg `rgba(196,148,50,0.12)`, fill `linear-gradient(90deg, #C4943A, #e8b84b)`
- Cards sorted by match percentage descending

---

## 7. Recipe Detail Page

### 7.1 Navigation & Breadcrumb
Nav bar visible. Below nav: breadcrumb — `← My Fridge` or `← Recipes` depending on entry point, in 11px Inter, gold link.

### 7.2 Hero Panel
Background `rgba(196,148,50,0.02)`, bottom border `rgba(196,148,50,0.08)`. Contains:
- Flag emoji (36px) + country/cuisine label (11px Inter 600, uppercase, gold muted) — inline
- Recipe title — 36px Playfair Display italic, `#f5e8c8`
- Description — 13px Inter 300, secondary, max-width 560px
- Meta row: Prep time · Difficulty · Servings · Cuisine — each a label + value pair

### 7.3 Two-Column Body
Grid: `240px sidebar | 1fr instructions`. Starts immediately below the hero panel. Both columns flush at the top.

**Left — Sidebar:**
1. Match banner (only shown when coming from My Fridge flow):
   - `"You have {n} of {total} ingredients"` sentence above a 3px progress bar
   - Background `rgba(196,148,50,0.06)`, border `rgba(196,148,50,0.18)`, radius `10px`
   - Width constrained to sidebar (240px) — not full-width
2. "Ingredients" section label
3. Ingredient rows: name left, amount + optional `✓ have` badge right
   - `✓ have` badge: gold text, `rgba(196,148,50,0.10)` bg, `rgba(196,148,50,0.25)` border, radius `4px`
   - Rows separated by `rgba(196,148,50,0.06)` bottom border

**Right — Instructions:**
- "Instructions" section label flush with sidebar top
- Steps use a flex row: ghost number left + step body right
- Ghost number: 40px Playfair Display italic, `rgba(196,148,50,0.45)` — visible but decorative
- Step text: 13px Inter 400, `rgba(255,220,130,0.70)`, line-height 1.65
- Chef's tip callouts: 11px Inter italic, `rgba(255,220,130,0.38)`, 2px gold left-border, 6px top margin

**Mobile:** Both columns stack — match banner → ingredients → instructions.

---

## 8. Responsive Behaviour

| Breakpoint | Recipe grid | Body cols |
|---|---|---|
| Mobile (`< 640px`) | 1 column | Stacked (sidebar on top) |
| Tablet (`640px – 1024px`) | 2 columns | Stacked |
| Desktop (`> 1024px`) | 3 columns | `240px + 1fr` two-column |

---

## 9. What This Design Replaces

The previous `DESIGN.md` (Resend-inspired: pure black `#000000`, three custom fonts — Domaine Display, ABC Favorit, Commit Mono — frost blue borders) is superseded entirely by this spec. The new system uses a warm amber palette derived from the logo's gold colour, Inter + Playfair Display only, and no custom/paid font dependencies.
