import { supabase } from '../lib/supabase'
import type { Entry } from '../types'

export interface EntryShare {
  id: string
  from_user_id: string
  from_username: string
  entry_data: Omit<Entry, 'id' | 'addedAt'>
  message: string
  source: string
  created_at: string
}

export function useEntryShare() {
  async function createShare(
    fromUserId: string,
    fromUsername: string,
    entry: Entry,
    message: string,
    source: 'watchlist' | 'ranking',
  ): Promise<string> {
    const { data, error } = await supabase
      .from('entry_shares')
      .insert({
        from_user_id: fromUserId,
        from_username: fromUsername,
        entry_data: {
          title: entry.title,
          titleEn: entry.titleEn,
          category: entry.category,
          country: entry.country,
          year: entry.year,
          rating: entry.rating,
          note: entry.note,
          status: entry.status,
        },
        message,
        source,
      })
      .select('id')
      .single()
    if (error) throw error
    return (data as { id: string }).id
  }

  async function fetchShare(id: string): Promise<EntryShare | null> {
    const { data } = await supabase
      .from('entry_shares')
      .select('*')
      .eq('id', id)
      .single()
    return data as EntryShare | null
  }

  function buildShareUrl(id: string): string {
    return new URL(`/share/${id}`, window.location.origin).toString()
  }

  return { createShare, fetchShare, buildShareUrl }
}
