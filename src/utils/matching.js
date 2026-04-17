export function scoreRecipe(recipe, selectedKeys) {
  const have = recipe.ingredients.filter(ing => selectedKeys.includes(ing.key)).length
  const total = recipe.ingredients.length
  const percentage = total === 0 ? 0 : Math.round((have / total) * 100)
  return { recipe, have, total, percentage }
}

export function rankRecipes(recipes, selectedKeys) {
  if (selectedKeys.length === 0) return []
  return recipes
    .map(recipe => scoreRecipe(recipe, selectedKeys))
    .filter(result => result.have > 0)
    .sort((a, b) => b.percentage - a.percentage)
}
