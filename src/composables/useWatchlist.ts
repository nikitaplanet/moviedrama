import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { withLoading } from '../lib/loading'
import type { Entry } from '../types'

const entries = ref<Entry[]>([])
const publicEntries = ref<Entry[]>([])

function toEntry(row: Record<string, unknown>): Entry {
  return {
    id:            row.id             as string,
    title:         row.title          as string,
    titleEn:       row.title_en       as string | undefined,
    category:      row.category       as Entry['category'],
    country:       row.country        as string,
    status:        row.status         as Entry['status'],
    rating:        row.rating         as number,
    note:          row.note           as string,
    year:          row.year           as number | undefined,
    addedAt:       row.added_at       as string,
    recommendedBy:   row.recommended_by   as string | undefined,
    recommendedNote: row.recommended_note as string | undefined,
  }
}

export function useWatchlist() {
  async function load() {
    await withLoading(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('watchlist_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      entries.value = (data ?? []).map(toEntry)
    })
  }

  async function loadPublic(uid: string) {
    await withLoading(async () => {
      const { data } = await supabase
        .from('watchlist_entries')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true })
      publicEntries.value = (data ?? []).map(toEntry)
    })
  }

  async function add(data: Omit<Entry, 'id' | 'addedAt'>) {
    await withLoading(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: row, error } = await supabase
        .from('watchlist_entries')
        .insert({
          user_id:        user.id,
          title:          data.title,
          title_en:       data.titleEn ?? null,
          category:       data.category,
          country:        data.country,
          status:         data.status,
          rating:         data.rating,
          note:           data.note,
          year:           data.year ?? null,
          recommended_by:   data.recommendedBy   ?? null,
          recommended_note: data.recommendedNote ?? null,
        })
        .select()
        .single()
      if (!error && row) entries.value.unshift(toEntry(row))
    })
  }

  async function remove(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
    await withLoading(async () => { await supabase.from('watchlist_entries').delete().eq('id', id) })
  }

  async function update(id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>) {
    const i = entries.value.findIndex(e => e.id === id)
    if (i !== -1) entries.value[i] = { ...entries.value[i], ...patch }
    const payload: Record<string, unknown> = {}
    if (patch.title    !== undefined) payload.title    = patch.title
    if (patch.titleEn  !== undefined) payload.title_en = patch.titleEn ?? null
    if (patch.category !== undefined) payload.category = patch.category
    if (patch.country  !== undefined) payload.country  = patch.country
    if (patch.status   !== undefined) payload.status   = patch.status
    if (patch.rating   !== undefined) payload.rating   = patch.rating
    if (patch.note     !== undefined) payload.note     = patch.note
    if (patch.year     !== undefined) payload.year     = patch.year ?? null
    await withLoading(async () => { await supabase.from('watchlist_entries').update(payload).eq('id', id) })
  }

  return { entries, publicEntries, load, loadPublic, add, remove, update }
}
