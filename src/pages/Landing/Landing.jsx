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
