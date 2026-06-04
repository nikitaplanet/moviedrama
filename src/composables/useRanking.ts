import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { withLoading } from '../lib/loading'
import type { Entry } from '../types'

const entries = ref<Entry[]>([])
const publicEntries = ref<Entry[]>([])

const LEGACY_LANG: Record<string, string> = {
  '台灣': '中文', '中國': '中文', '日本': '日語', '韓國': '韓語',
  '美國': '英語', '英國': '英語', '法國': '法語', '泰國': '泰語', '香港': '廣東話',
}

function toEntry(row: Record<string, unknown>): Entry {
  const raw = row.country as string
  return {
    id:        row.id         as string,
    title:     row.title      as string,
    titleEn:   row.title_en   as string | undefined,
    category:  row.category   as Entry['category'],
    language:  LEGACY_LANG[raw] ?? raw,
    status:    row.status     as Entry['status'],
    rating:    row.rating     as number,
    note:      row.note       as string,
    year:      row.year       as number | undefined,
    addedAt:   row.added_at   as string,
    posterUrl: row.poster_url as string | undefined,
    tmdbData:  row.tmdb_data  as Record<string, unknown> | undefined,
    overview:  row.overview   as string | undefined,
  }
}

export function useRanking() {
  async function load() {
    await withLoading(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const { data } = await supabase
        .from('ranking_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('rank_order', { ascending: true })
      entries.value = (data ?? []).map(toEntry)
    })
  }

  async function loadPublic(uid: string) {
    await withLoading(async () => {
      const { data } = await supabase
        .from('ranking_entries')
        .select('*')
        .eq('user_id', uid)
        .order('rank_order', { ascending: true })
      publicEntries.value = (data ?? []).map(toEntry)
    })
  }

  async function add(data: Omit<Entry, 'id' | 'addedAt'>) {
    let inserted = false
    await withLoading(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const { data: row, error } = await supabase
        .from('ranking_entries')
        .insert({
          user_id:    user.id,
          title:      data.title,
          title_en:   data.titleEn ?? null,
          category:   data.category,
          country:    data.language,
          status:     data.status,
          rating:     data.rating,
          note:       data.note,
          year:       data.year ?? null,
          poster_url: data.posterUrl ?? null,
          tmdb_data:  data.tmdbData  ?? null,
          overview:   data.overview  ?? null,
          rank_order: 0,
        })
        .select()
        .single()
      if (!error && row) {
        entries.value.unshift(toEntry(row))
        inserted = true
      }
    })
    if (inserted) await syncOrder()
  }

  async function remove(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
    await withLoading(async () => { await supabase.from('ranking_entries').delete().eq('id', id) })
    await syncOrder()
  }

  async function update(id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>) {
    const i = entries.value.findIndex(e => e.id === id)
    if (i !== -1) entries.value[i] = { ...entries.value[i], ...patch }
    const payload: Record<string, unknown> = {}
    if (patch.title    !== undefined) payload.title    = patch.title
    if (patch.titleEn  !== undefined) payload.title_en = patch.titleEn ?? null
    if (patch.category !== undefined) payload.category = patch.category
    if (patch.language !== undefined) payload.country  = patch.language
    if (patch.status   !== undefined) payload.status   = patch.status
    if (patch.rating   !== undefined) payload.rating   = patch.rating
    if (patch.note     !== undefined) payload.note     = patch.note
    if (patch.year      !== undefined) payload.year       = patch.year ?? null
    if (patch.posterUrl !== undefined) payload.poster_url = patch.posterUrl ?? null
    if (patch.tmdbData  !== undefined) payload.tmdb_data  = patch.tmdbData  ?? null
    if (patch.overview  !== undefined) payload.overview   = patch.overview  ?? null
    await withLoading(async () => { await supabase.from('ranking_entries').update(payload).eq('id', id) })
  }

  async function syncOrder() {
    await withLoading(async () => {
      await supabase.rpc('update_ranking_order', {
        ids:    entries.value.map(e => e.id),
        orders: entries.value.map((_, i) => i),
      })
    })
  }

  return { entries, publicEntries, load, loadPublic, add, remove, update, syncOrder }
}
