<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{ page: number; total: number }>()
const emit = defineEmits<{ 'update:page': [p: number] }>()

const pages = computed<(number | '…')[]>(() => {
  const t = props.total
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const p = props.page
  const set = new Set(
    [1, 2, p - 1, p, p + 1, t - 1, t].filter((n) => n >= 1 && n <= t)
  )
  const arr = [...set].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  arr.forEach((n, i) => {
    if (i > 0 && n - arr[i - 1] > 1) result.push('…')
    result.push(n)
  })
  return result
})
</script>

<template>
  <div class="mt-6 flex items-center justify-center gap-1 font-sans text-xs">
    <button
      type="button"
      class="rounded-lg px-2 py-1 transition-colors"
      :disabled="page === 1"
      :style="page === 1 ? 'color:var(--ink-faint);cursor:default' : 'color:var(--ink)'"
      @click="emit('update:page', page - 1)"
    >‹</button>

    <template v-for="p in pages" :key="p">
      <span v-if="p === '…'" class="px-1" style="color:var(--ink-faint)">…</span>
      <button
        v-else
        type="button"
        class="h-7 min-w-[28px] rounded-lg px-1.5 transition-colors"
        :class="p !== page && 'hover:bg-black/5'"
        :style="p === page
          ? 'background:var(--accent);color:#fff;font-weight:600'
          : 'color:var(--ink)'"
        @click="emit('update:page', p as number)"
      >{{ p }}</button>
    </template>

    <button
      type="button"
      class="rounded-lg px-2 py-1 transition-colors"
      :disabled="page === total"
      :style="page === total ? 'color:var(--ink-faint);cursor:default' : 'color:var(--ink)'"
      @click="emit('update:page', page + 1)"
    >›</button>
  </div>
</template>
