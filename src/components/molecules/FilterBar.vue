<script lang="ts" setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { EntryCategory, FilterState } from '../../types'
import { CATEGORIES, PRESET_COUNTRIES } from '../../types'

const props = defineProps<{
  filters: FilterState
  counts?: Record<string, number>
  disabled?: boolean
  showSearch?: boolean
  search?: string
  showSort?: boolean
  sort?: string
}>()
const emit = defineEmits<{
  'update:filters': [f: FilterState]
  'update:search':  [s: string]
  'update:sort':    [s: string]
}>()

const SORT_OPTIONS = ['最新', '評分', '名稱']
const hasActive = computed(() => !!(props.filters.category || props.filters.country))

function setCategory(c: EntryCategory | '') {
  if (!props.disabled) emit('update:filters', { ...props.filters, category: c })
}
function setCountry(e: Event) {
  if (!props.disabled) emit('update:filters', { ...props.filters, country: (e.target as HTMLSelectElement).value })
}
function setSort(e: Event) {
  emit('update:sort', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <!-- Search field -->
  <div v-if="showSearch" class="field mb-3">
    <Icon icon="mdi:magnify" :size="17" />
    <input
      :value="search"
      placeholder="搜尋片名、國家、備注…"
      @input="emit('update:search', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="search"
      type="button"
      style="color:var(--ink-faint)"
      @click="emit('update:search', '')"
    >
      <Icon icon="mdi:close" class="h-4 w-4" />
    </button>
  </div>

  <!-- Category chips -->
  <div class="chiprow">
    <button
      :class="['chip', !filters.category && 'on']"
      type="button"
      @click="setCategory('')"
    >
      全部<span class="cc">{{ counts?.['全部'] ?? '' }}</span>
    </button>
    <button
      v-for="cat in CATEGORIES"
      :key="cat"
      :class="['chip', filters.category === cat && 'on']"
      type="button"
      @click="setCategory(cat)"
    >
      {{ cat }}<span class="cc">{{ counts?.[cat] ?? '' }}</span>
    </button>
  </div>

  <!-- Country + Sort dropdowns -->
  <div class="grid grid-cols-2 gap-2.5 mt-2.5">
    <div class="field sel">
      <span class="font-sans text-[10px] text-ink-faint tracking-[.14em] flex-none">地區</span>
      <select :value="filters.country" :disabled="disabled" @change="setCountry">
        <option value="">所有國家</option>
        <option v-for="c in PRESET_COUNTRIES" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>
    <div v-if="showSort" class="field sel">
      <span class="font-sans text-[10px] text-ink-faint tracking-[.14em] flex-none">排序</span>
      <select :value="sort" @change="setSort">
        <option v-for="s in SORT_OPTIONS" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>
  </div>

  <!-- Clear filters -->
  <button
    v-if="hasActive && !disabled"
    type="button"
    class="chip mt-1"
    style="font-size:11px;color:var(--ink-faint)"
    @click="emit('update:filters', { category: '', country: '', status: filters.status })"
  >
    <Icon icon="mdi:close" class="h-3 w-3 mr-0.5" />清除篩選
  </button>
</template>
