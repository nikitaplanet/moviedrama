import { ref, computed } from 'vue'

const count = ref(0)

export const isLoading = computed(() => count.value > 0)

export async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
  count.value++
  try {
    return await fn()
  } finally {
    count.value--
  }
}
