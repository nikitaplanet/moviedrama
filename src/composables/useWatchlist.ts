import { ref, watch } from 'vue'
import type { Entry } from '../types'

const STORAGE_KEY = 'moviedrama:watchlist'

function load(): Entry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Entry[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(e => e && typeof e.id === 'string' && typeof e.title === 'string')
  } catch {
    return []
  }
}

const entries = ref<Entry[]>(load())

watch(entries, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })

export function useWatchlist() {
  function add(data: Omit<Entry, 'id' | 'addedAt'>) {
    entries.value.push({ ...data, id: crypto.randomUUID(), addedAt: new Date().toISOString() })
  }
  function remove(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
  }
  function update(id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>) {
    const i = entries.value.findIndex(e => e.id === id)
    if (i !== -1) entries.value[i] = { ...entries.value[i], ...patch }
  }
  return { entries, add, remove, update }
}
