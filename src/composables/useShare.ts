export function useShare() {
  function buildUrl(tab: 'watchlist' | 'ranking', userId: string): string {
    return new URL(`/${tab}?uid=${userId}`, window.location.origin).toString()
  }

  async function copy(tab: 'watchlist' | 'ranking', userId: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(buildUrl(tab, userId))
      return true
    } catch {
      return false
    }
  }

  return { buildUrl, copy }
}
