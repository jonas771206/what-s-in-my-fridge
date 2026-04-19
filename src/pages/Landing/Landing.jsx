import { useNavigate } from 'react-router-dom'
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react'
import styles from './Landing.module.css'
import logo from '/Logo.png'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.topRight}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className={styles.signInBtn}>Sign in</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
      <div className={styles.orb + ' ' + styles.orb1} />
      <div className={styles.orb + ' ' + styles.orb2} />
      <div className={styles.orb + ' ' + styles.orb3} />

      <div className={styles.hero}>
        <img src={logo} alt="What's In My Fridge" className={styles.logo} />
        <h1 className={styles.title}>Discover recipes<br />from what you have.</h1>
        <p className={styles.subtitle}>Global recipes from your fridge. No login. Just cook.</p>
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
