import type { EntryCategory } from '../types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w200'

const TMDB_LANG_MAP: Record<string, string> = {
  zh: '中文', ja: '日語', ko: '韓語', en: '英語',
  fr: '法語', th: '泰語', es: '西語', it: '義語',
  de: '德語', pt: '葡語', cn: '廣東話',
}

export interface TmdbResult {
  id: number
  mediaType: 'movie' | 'tv'
  title: string
  originalTitle: string
  year?: number
  releaseDate?: string
  overview?: string
  posterUrl?: string
  language: string
  category: EntryCategory
  raw: Record<string, unknown>
}

export interface TmdbDetail {
  directors: string[]
  companies: string[]
  cast: string[]
}

export function useTmdb() {
  async function fetchDetail(id: number, mediaType: 'movie' | 'tv'): Promise<TmdbDetail | null> {
    const token = import.meta.env.VITE_TMDB_TOKEN
    if (!token) return null
    const res = await fetch(
      `${TMDB_BASE}/${mediaType}/${id}?append_to_response=credits&language=zh-TW`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const crew = (data.credits?.crew ?? []) as Array<{ job: string; name: string }>
    const castArr = (data.credits?.cast ?? []) as Array<{ name: string }>
    const companies = (data.production_companies ?? []) as Array<{ name: string }>
    return {
      directors: crew.filter(c => c.job === 'Director').map(c => c.name),
      companies: companies.slice(0, 3).map(c => c.name),
      cast: castArr.slice(0, 5).map(c => c.name),
    }
  }

  async function search(query: string): Promise<TmdbResult[]> {
    const token = import.meta.env.VITE_TMDB_TOKEN
    if (!token || !query.trim()) return []

    const res = await fetch(
      `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&language=zh-TW&include_adult=false`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.results ?? [])
      .filter((r: Record<string, unknown>) => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 8)
      .map((r: Record<string, unknown>) => {
        const dateStr = (r.release_date ?? r.first_air_date ?? '') as string
        const releaseDate = ((r.release_date ?? r.first_air_date ?? '') as string) || undefined
        const language = TMDB_LANG_MAP[(r.original_language as string) ?? ''] ?? ''
        return {
          id:            r.id as number,
          mediaType:     r.media_type as 'movie' | 'tv',
          title:         (r.title ?? r.name ?? '') as string,
          originalTitle: (r.original_title ?? r.original_name ?? '') as string,
          year:          dateStr ? parseInt(dateStr.slice(0, 4)) : undefined,
          releaseDate,
          overview:      (r.overview as string | undefined) || undefined,
          posterUrl:     r.poster_path ? `${TMDB_IMG}${r.poster_path}` : undefined,
          language,
          category:      (
            (r.genre_ids as number[] | undefined)?.includes(16)
              ? '動畫'
              : r.media_type === 'movie' ? '電影' : '影集'
          ) as EntryCategory,
          raw:           r,
        }
      })
  }

  return { search, fetchDetail }
}
