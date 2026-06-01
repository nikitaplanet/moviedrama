<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { VueDraggable } from 'vue-draggable-plus'
import { Icon } from '@iconify/vue'
import type { Entry, EntryStatus, FilterState } from '../types'
import { STATUSES } from '../types'
import { useWatchlist } from '../composables/useWatchlist'
import { useShare } from '../composables/useShare'
import { useFilters } from '../composables/useFilters'
import { useAuth } from '../composables/useAuth'
import EntryCard from '../components/molecules/EntryCard.vue'
import AddEntryForm from '../components/molecules/AddEntryForm.vue'
import FilterBar from '../components/molecules/FilterBar.vue'
import SegmentedControl from '../components/molecules/SegmentedControl.vue'
import StatRow from '../components/molecules/StatRow.vue'
import EmptyState from '../components/organisms/EmptyState.vue'
import AppPageHeader from '../components/organisms/AppPageHeader.vue'

const route = useRoute()
const { user } = useAuth()
const { entries, publicEntries, add, remove, update, loadPublic } = useWatchlist()
const { filters, isReadonly, updateFilters } = useFilters()

const uid = computed(() => route.query.uid as string | undefined)

watchEffect(async () => {
  if (uid.value) await loadPublic(uid.value)
  else publicEntries.value = []
})

const activeFilters = computed<FilterState>(() => filters.value)

const sourceEntries = computed<Entry[]>(() =>
  isReadonly.value ? publicEntries.value : entries.value
)

// --- search + sort ---
const search = ref('')
const sort = ref('最新')

// --- status segmented ---
const statusTab = ref<EntryStatus | '全部'>('全部')

// Status counts (before status filter, after other filters)
const preStatusEntries = computed(() =>
  sourceEntries.value.filter((e) => {
    const f = activeFilters.value
    if (f.category && e.category !== f.category) return false
    if (f.country && e.country !== f.country) return false
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      return (
        e.title.toLowerCase().includes(q) ||
        (e.titleEn ?? '').toLowerCase().includes(q) ||
        e.country.includes(q) ||
        e.note.includes(q)
      )
    }
    return true
  })
)

const statusCounts = computed(() => {
  const c: Record<string, number> = {
    全部: preStatusEntries.value.length,
    待看: 0,
    看中: 0,
    看完: 0,
  }
  preStatusEntries.value.forEach((e) => {
    c[e.status]++
  })
  return c
})

const displayEntries = computed(() => {
  let r = preStatusEntries.value.filter(
    (e) => statusTab.value === '全部' || e.status === statusTab.value
  )
  if (sort.value === '最新')
    r = [...r].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  if (sort.value === '評分')
    r = [...r].sort(
      (a, b) => b.rating - a.rating || (b.year ?? 0) - (a.year ?? 0)
    )
  if (sort.value === '名稱')
    r = [...r].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'))
  return r
})

const isFiltered = computed(
  () =>
    !!(
      activeFilters.value.category ||
      activeFilters.value.country ||
      search.value ||
      statusTab.value !== '全部'
    )
)

// Stats (whole library)
const stats = computed(() => ({
  total: sourceEntries.value.length,
  toWatch: sourceEntries.value.filter((e) => e.status === '待看').length,
  done: sourceEntries.value.filter((e) => e.status === '看完').length,
}))

// Category counts for filter chips
const categoryCounts = computed(() => {
  const c: Record<string, number> = { 全部: sourceEntries.value.length }
  sourceEntries.value.forEach((e) => {
    c[e.category] = (c[e.category] ?? 0) + 1
  })
  return c
})

const showAddForm = ref(false)
const urlCopied = ref(false)

function handleAdd(data: Omit<Entry, 'id' | 'addedAt'>) {
  add(data)
  showAddForm.value = false
}

async function copyUrl() {
  if (!user.value) return
  const { copy } = useShare()
  await copy(user.value.id)
  urlCopied.value = true
  setTimeout(() => { urlCopied.value = false }, 2000)
}
</script>

<template>
  <!-- Readonly banner -->
  <div
    v-if="isReadonly"
    class="mb-4 rounded-md px-4 py-2 text-center text-sm"
    style="
      background: rgba(176, 71, 60, 0.08);
      color: var(--accent);
      border: 1px solid rgba(176, 71, 60, 0.2);
    "
  >
    <Icon class="mr-1 inline h-4 w-4" icon="mdi:eye-outline" />
    這是分享的唯讀片單
  </div>

  <!-- Page header -->
  <AppPageHeader
    title="The Reel List"
    title-cn="片單"
    kicker="Personal Cinema · 私人放映室"
  >
    <p class="pg-sub">
      蒐藏 {{ stats.total }} 部 · 已看完 {{ stats.done }} 部 · 還有
      {{ stats.toWatch }} 部待看
    </p>
  </AppPageHeader>

  <!-- Stat row -->
  <StatRow :done="stats.done" :to-watch="stats.toWatch" :total="stats.total" />

  <!-- Add + Share toolbar -->
  <div
    v-if="!isReadonly"
    class="mb-3 mt-4 flex items-center justify-between gap-3"
  >
    <button
      class="add-btn"
      @click="showAddForm = true"
      style="width: auto; padding: 10px 20px; flex: none"
      type="button"
    >
      <Icon class="h-4 w-4" icon="mdi:plus" />
      新增影片
    </button>
    <button
      class="chip"
      @click="copyUrl"
      style="font-size: 12px; padding-bottom: 4px"
      type="button"
    >
      <Icon
        :icon="urlCopied ? 'mdi:check' : 'mdi:share-variant-outline'"
        class="mr-0.5 h-3.5 w-3.5"
      />
      {{ urlCopied ? '已複製' : '分享連結' }}
    </button>
  </div>

  <!-- Filters -->
  <div class="mt-3">
    <FilterBar
      :counts="categoryCounts"
      :disabled="isReadonly"
      :filters="activeFilters"
      :search="search"
      :show-search="true"
      :show-sort="true"
      :sort="sort"
      @update:filters="updateFilters"
      @update:search="search = $event"
      @update:sort="sort = $event"
    />
  </div>

  <!-- Status segmented tabs -->
  <div class="mt-3">
    <SegmentedControl
      v-model="statusTab"
      :counts="statusCounts"
      :options="['全部', ...STATUSES]"
    />
  </div>

  <!-- Results bar -->
  <div class="resbar">─── {{ displayEntries.length }} 部結果 ───</div>

  <!-- Hint when filtered -->
  <p
    v-if="isFiltered && !isReadonly"
    class="text-ink-faint mb-2 font-sans text-[10px] tracking-[.12em]"
  >
    篩選中，拖曳排序已暫停
  </p>

  <!-- Empty state -->
  <EmptyState
    v-if="displayEntries.length === 0"
    hint="調整篩選或清除搜尋"
    message="沒有符合的影片"
  />

  <!-- Draggable list -->
  <VueDraggable
    v-else-if="!isFiltered && !isReadonly"
    v-model="entries"
    :animation="200"
    class="flex flex-col"
    handle=".drag-handle"
  >
    <EntryCard
      v-for="(entry, idx) in entries"
      :entry="entry"
      :key="entry.id"
      :rank="idx + 1"
      @remove="remove"
      @update="update"
    />
  </VueDraggable>

  <!-- Static list (filtered / readonly) -->
  <div v-else class="flex flex-col">
    <EntryCard
      v-for="(entry, idx) in displayEntries"
      :entry="entry"
      :key="entry.id"
      :rank="idx + 1"
      :readonly="isReadonly"
      @remove="remove"
      @update="update"
    />
  </div>

  <!-- Add form sheet -->
  <Teleport to="body">
    <AddEntryForm
      v-if="showAddForm && !isReadonly"
      @add="handleAdd"
      @cancel="showAddForm = false"
      default-status="待看"
    />
  </Teleport>
</template>
