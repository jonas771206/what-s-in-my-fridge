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
