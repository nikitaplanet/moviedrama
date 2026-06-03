import type { EntryCategory } from '../types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w200'

const COUNTRY_MAP: Record<string, string> = {
  TW: '台灣', JP: '日本', KR: '韓國', US: '美國',
  GB: '英國', CN: '中國', FR: '法國', TH: '泰國', HK: '香港',
}

// Fallback when origin_country is absent (movies often don't include it)
const LANG_MAP: Record<string, string> = {
  ja: '日本', ko: '韓國', th: '泰國', fr: '法國',
  zh: '中國', en: '美國',
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
  country: string
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
        const originCountries = (r.origin_country as string[] | undefined) ?? []
        const country =
          COUNTRY_MAP[originCountries[0]] ??
          LANG_MAP[(r.original_language as string) ?? ''] ??
          ''
        return {
          id:            r.id as number,
          mediaType:     r.media_type as 'movie' | 'tv',
          title:         (r.title ?? r.name ?? '') as string,
          originalTitle: (r.original_title ?? r.original_name ?? '') as string,
          year:          dateStr ? parseInt(dateStr.slice(0, 4)) : undefined,
          releaseDate,
          overview:      (r.overview as string | undefined) || undefined,
          posterUrl:     r.poster_path ? `${TMDB_IMG}${r.poster_path}` : undefined,
          country,
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
