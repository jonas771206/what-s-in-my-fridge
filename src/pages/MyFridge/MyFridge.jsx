import { useState, useRef } from 'react'
import { CATEGORIES, MEAT_CUTS, CUT_LABELS } from '../../data/ingredients'
import { rankRecipes } from '../../utils/matching'
import { recipes } from '../../data/recipes'
import RecipeCard from '../../components/RecipeCard/RecipeCard'
import styles from './MyFridge.module.css'

export default function MyFridge() {
  const [selectedKeys, setSelectedKeys] = useState(new Set())
  const [openCutMeat, setOpenCutMeat] = useState(null)
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
              : 'Recipes you can make'}
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
