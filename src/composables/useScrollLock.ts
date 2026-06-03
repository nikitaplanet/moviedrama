import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

function getMain(): HTMLElement | null {
  return document.querySelector('main')
}

function lock() {
  const el = getMain()
  if (el) el.style.overflow = 'hidden'
}

function unlock() {
  const el = getMain()
  if (el) el.style.overflow = ''
}

export function useScrollLock(active: Ref<boolean>) {
  watch(active, (val) => { val ? lock() : unlock() })
  onUnmounted(() => { if (active.value) unlock() })
}
