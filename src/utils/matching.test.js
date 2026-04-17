import { describe, it, expect } from 'vitest'
import { scoreRecipe, rankRecipes } from './matching'

const mockRecipe = {
  id: 'test',
  name: 'Test Recipe',
  ingredients: [
    { name: 'Chicken breast', key: 'chicken-breast' },
    { name: 'Garlic', key: 'garlic' },
    { name: 'Cream', key: 'cream' },
  ],
}

describe('scoreRecipe', () => {
  it('returns 0 have when no ingredients selected', () => {
    const result = scoreRecipe(mockRecipe, [])
    expect(result.have).toBe(0)
    expect(result.total).toBe(3)
    expect(result.percentage).toBe(0)
  })

  it('counts only exact key matches', () => {
    const result = scoreRecipe(mockRecipe, ['chicken-breast', 'garlic'])
    expect(result.have).toBe(2)
    expect(result.percentage).toBe(67)
  })

  it('does not match parent meat when cut is required', () => {
    // Recipe needs 'chicken-breast'; selecting 'chicken-thigh' should not match
    const result = scoreRecipe(mockRecipe, ['chicken-thigh'])
    expect(result.have).toBe(0)
  })

  it('returns 100% when all ingredients present', () => {
    const result = scoreRecipe(mockRecipe, ['chicken-breast', 'garlic', 'cream'])
    expect(result.percentage).toBe(100)
    expect(result.have).toBe(3)
  })

  it('attaches the recipe to the result', () => {
    const result = scoreRecipe(mockRecipe, ['garlic'])
    expect(result.recipe).toBe(mockRecipe)
  })
})

describe('rankRecipes', () => {
  const recipes = [
    { id: 'a', name: 'A', ingredients: [{ key: 'garlic' }, { key: 'onion' }] },
    { id: 'b', name: 'B', ingredients: [{ key: 'garlic' }, { key: 'cream' }, { key: 'butter' }] },
    { id: 'c', name: 'C', ingredients: [{ key: 'pasta' }] },
  ]

  it('excludes recipes with 0 matching ingredients', () => {
    const result = rankRecipes(recipes, ['garlic'])
    const ids = result.map(r => r.recipe.id)
    expect(ids).not.toContain('c')
  })

  it('sorts by percentage descending', () => {
    const result = rankRecipes(recipes, ['garlic', 'onion'])
    expect(result[0].recipe.id).toBe('a') // 2/2 = 100%
    expect(result[1].recipe.id).toBe('b') // 1/3 = 33%
  })

  it('returns empty array when nothing selected', () => {
    const result = rankRecipes(recipes, [])
    expect(result).toHaveLength(0)
  })
})
