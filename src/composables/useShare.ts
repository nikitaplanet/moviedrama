import type { ShareData } from '../types'

export function useShare() {
  function encode(data: ShareData): string {
    return btoa(encodeURIComponent(JSON.stringify(data)))
  }

  function decode(encoded: string): ShareData | null {
    try {
      return JSON.parse(decodeURIComponent(atob(encoded))) as ShareData
    } catch {
      return null
    }
  }

  function buildUrl(data: ShareData): string {
    const url = new URL(`/${data.tab}`, window.location.origin)
    url.searchParams.set('data', encode(data))
    return url.toString()
  }

  async function copy(data: ShareData): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(buildUrl(data))
      return true
    } catch {
      return false
    }
  }

  return { encode, decode, buildUrl, copy }
}
