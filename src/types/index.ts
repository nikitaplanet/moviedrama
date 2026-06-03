export type EntryCategory = '電影' | '影集' | '動畫' | '紀錄片'
export type EntryStatus  = '待看' | '看中' | '看完' | '即將上映'
export type TabName      = 'watchlist' | 'ranking'

export const CATEGORIES: EntryCategory[] = ['電影', '影集', '動畫', '紀錄片']
export const STATUSES: EntryStatus[]     = ['待看', '看中', '看完', '即將上映']

export const CATEGORY_EN: Record<EntryCategory, string> = {
  '電影': 'FILM', '影集': 'SERIES', '動畫': 'ANIME', '紀錄片': 'DOC',
}

export const STATUS_META: Record<EntryStatus, { dot: string; en: string }> = {
  '待看':   { dot: '#6E7E8A', en: 'TO WATCH'    },
  '看中':   { dot: '#C08A2E', en: 'WATCHING'    },
  '看完':   { dot: '#3E7A56', en: 'WATCHED'     },
  '即將上映': { dot: '#7B5EA7', en: 'COMING SOON' },
}

export const PRESET_COUNTRIES = [
  '台灣', '日本', '韓國', '美國', '英國', '中國', '法國', '泰國', '香港',
] as const

export const COUNTRY_FLAG: Record<string, string> = {
  '台灣': '🇹🇼', '日本': '🇯🇵', '韓國': '🇰🇷', '美國': '🇺🇸',
  '英國': '🇬🇧', '中國': '🇨🇳', '法國': '🇫🇷', '泰國': '🇹🇭', '香港': '🇭🇰',
}
export const getFlag = (country: string): string => COUNTRY_FLAG[country] ?? '🎬'

export interface Entry {
  id: string
  title: string
  titleEn?: string
  category: EntryCategory
  country: string
  status: EntryStatus
  rating: number
  note: string
  year?: number
  addedAt: string
  posterUrl?: string
  recommendedBy?: string
  recommendedNote?: string
  tmdbData?: Record<string, unknown>
  releaseDate?: string
  overview?: string
}

export interface FilterState {
  category: EntryCategory | ''
  country: string
  status: EntryStatus | ''
}

export interface ShareData {
  tab: TabName
  entries: Entry[]
  filters: FilterState
}
