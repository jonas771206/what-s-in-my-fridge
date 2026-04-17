import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav/Nav'
import Landing from './pages/Landing/Landing'
import BrowseRecipes from './pages/BrowseRecipes/BrowseRecipes'
import MyFridge from './pages/MyFridge/MyFridge'
import RecipeDetail from './pages/RecipeDetail/RecipeDetail'

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

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
