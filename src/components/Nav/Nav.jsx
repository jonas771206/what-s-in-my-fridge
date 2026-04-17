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
