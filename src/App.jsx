import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from './components/Nav/Nav'
import Landing from './pages/Landing/Landing'
import BrowseRecipes from './pages/BrowseRecipes/BrowseRecipes'
import MyFridge from './pages/MyFridge/MyFridge'
import RecipeDetail from './pages/RecipeDetail/RecipeDetail'
import { apiFetchAuth } from './lib/api'

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const { isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return
    getToken().then(token => apiFetchAuth('/api/auth/sync', token, { method: 'POST' })).catch(() => {})
  }, [isSignedIn])

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
