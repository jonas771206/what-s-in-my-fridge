import { useState, useMemo, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import RecipeCard from '../../components/RecipeCard/RecipeCard'
import styles from './BrowseRecipes.module.css'

const COUNTRIES = ['All', 'China', 'France', 'Greece', 'India', 'Italy', 'Japan', 'Morocco', 'Mexico', 'Thailand', 'USA']

const FLAG = { China:'🇨🇳', France:'🇫🇷', Greece:'🇬🇷', India:'🇮🇳', Italy:'🇮🇹', Japan:'🇯🇵', Morocco:'🇲🇦', Mexico:'🇲🇽', Thailand:'🇹🇭', USA:'🇺🇸' }

export default function BrowseRecipes() {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/recipes')
      .then(setRecipes)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
      const matchesCountry = country === 'All' || r.country === country
      return matchesSearch && matchesCountry
    })
  }, [recipes, search, country])

  if (loading) return <div className={styles.page}><p style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading…</p></div>

  return (
    <div className={`${styles.page} page-enter`}>
      <h1 className={styles.title}>All Recipes</h1>
      <p className={styles.subtitle}>{recipes.length} dishes across {COUNTRIES.length - 1} countries</p>

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
