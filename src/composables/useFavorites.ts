import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'toolbox:favorites'

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

const favorites = ref<string[]>(readStored())

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
})

export function useFavorites() {
  function isFavorite(id: string) {
    return favorites.value.includes(id)
  }

  function toggleFavorite(id: string) {
    favorites.value = isFavorite(id)
      ? favorites.value.filter((item) => item !== id)
      : [...favorites.value, id]
  }

  return { favorites, isFavorite, toggleFavorite }
}
