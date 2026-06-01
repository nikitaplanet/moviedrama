export function useShare() {
  function buildUrl(userId: string): string {
    return new URL(`/watchlist?uid=${userId}`, window.location.origin).toString()
  }

  async function copy(userId: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(buildUrl(userId))
      return true
    } catch {
      return false
    }
  }

  return { buildUrl, copy }
}
