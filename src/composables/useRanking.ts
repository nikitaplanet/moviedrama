import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { Entry } from '../types'

const entries = ref<Entry[]>([])
const loading = ref(false)

function toEntry(row: Record<string, unknown>): Entry {
  return {
    id:        row.id         as string,
    title:     row.title      as string,
    titleEn:   row.title_en   as string | undefined,
    category:  row.category   as Entry['category'],
    country:   row.country    as string,
    status:    row.status     as Entry['status'],
    rating:    row.rating     as number,
    note:      row.note       as string,
    year:      row.year       as number | undefined,
    addedAt:   row.added_at   as string,
  }
}

export function useRanking() {
  async function load() {
    loading.value = true
    const { data } = await supabase
      .from('ranking_entries')
      .select('*')
      .order('rank_order', { ascending: true })
    entries.value = (data ?? []).map(toEntry)
    loading.value = false
  }

  async function add(data: Omit<Entry, 'id' | 'addedAt'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const nextOrder = entries.value.length
    const { data: row, error } = await supabase
      .from('ranking_entries')
      .insert({
        user_id:    user.id,
        title:      data.title,
        title_en:   data.titleEn ?? null,
        category:   data.category,
        country:    data.country,
        status:     data.status,
        rating:     data.rating,
        note:       data.note,
        year:       data.year ?? null,
        rank_order: nextOrder,
      })
      .select()
      .single()
    if (!error && row) entries.value.push(toEntry(row))
  }

  async function remove(id: string) {
    await supabase.from('ranking_entries').delete().eq('id', id)
    entries.value = entries.value.filter(e => e.id !== id)
    await syncOrder()
  }

  async function update(id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>) {
    const payload: Record<string, unknown> = {}
    if (patch.title    !== undefined) payload.title    = patch.title
    if (patch.titleEn  !== undefined) payload.title_en = patch.titleEn ?? null
    if (patch.category !== undefined) payload.category = patch.category
    if (patch.country  !== undefined) payload.country  = patch.country
    if (patch.status   !== undefined) payload.status   = patch.status
    if (patch.rating   !== undefined) payload.rating   = patch.rating
    if (patch.note     !== undefined) payload.note     = patch.note
    if (patch.year     !== undefined) payload.year     = patch.year ?? null

    await supabase.from('ranking_entries').update(payload).eq('id', id)
    const i = entries.value.findIndex(e => e.id === id)
    if (i !== -1) entries.value[i] = { ...entries.value[i], ...patch }
  }

  async function syncOrder() {
    const updates = entries.value.map((e, i) =>
      supabase.from('ranking_entries').update({ rank_order: i }).eq('id', e.id)
    )
    await Promise.all(updates)
  }

  return { entries, loading, load, add, remove, update, syncOrder }
}
