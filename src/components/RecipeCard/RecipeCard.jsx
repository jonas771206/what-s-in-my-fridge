import { Link } from 'react-router-dom'
import styles from './RecipeCard.module.css'

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
