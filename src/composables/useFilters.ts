import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { EntryCategory, EntryStatus, FilterState } from '../types'

export function useFilters() {
  const route  = useRoute()
  const router = useRouter()

  const filters = computed<FilterState>(() => ({
    category: (route.query.category as EntryCategory | '') || '',
    country:  (route.query.country  as string)             || '',
    status:   (route.query.status   as EntryStatus | '')   || '',
  }))

  const isReadonly = computed(() => !!route.query.uid)

  function updateFilters(next: Partial<FilterState>) {
    router.replace({
      query: {
        ...route.query,
        category: (next.category ?? filters.value.category) || undefined,
        country:  (next.country  ?? filters.value.country)  || undefined,
        status:   (next.status   ?? filters.value.status)   || undefined,
      },
    })
  }

  function clearFilters() {
    const { uid } = route.query
    router.replace({ query: uid ? { uid } : {} })
  }

  return { filters, isReadonly, updateFilters, clearFilters }
}
