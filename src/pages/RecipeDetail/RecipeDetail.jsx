import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { scoreRecipe } from '../../utils/matching'
import styles from './RecipeDetail.module.css'

export default function RecipeDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`/api/recipes/${id}`)
      .then(setRecipe)
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false))
  }, [id])

  const fromFridge = location.state?.fromFridge ?? false
  const selected = location.state?.selected ?? []

  if (loading) return <div className={styles.page}><p style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading…</p></div>
  if (!recipe) return <div className={styles.page}><p style={{ color: 'var(--text-secondary)', padding: 32 }}>Recipe not found.</p></div>

  const matchResult = fromFridge ? scoreRecipe(recipe, selected) : null

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.breadcrumb}>
        <Link to={fromFridge ? '/fridge' : '/recipes'}>
          ← {fromFridge ? 'My Fridge' : 'Recipes'}
        </Link>
        <span style={{ opacity: 0.4 }}>/</span>
        <span>{recipe.name}</span>
      </div>

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

      <div className={styles.body}>
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
