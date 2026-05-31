<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { VueDraggable } from 'vue-draggable-plus'
import { Icon } from '@iconify/vue'
import type { Entry, FilterState, ShareData } from '../types'
import { useRanking } from '../composables/useRanking'
import { useShare } from '../composables/useShare'
import { useFilters } from '../composables/useFilters'
import RankRow from '../components/molecules/RankRow.vue'
import AddEntryForm from '../components/molecules/AddEntryForm.vue'
import FilterBar from '../components/molecules/FilterBar.vue'
import SharePanel from '../components/molecules/SharePanel.vue'
import EmptyState from '../components/organisms/EmptyState.vue'
import AppPageHeader from '../components/organisms/AppPageHeader.vue'

const route = useRoute()
const { decode } = useShare()
const { entries, add, remove } = useRanking()
const { filters, isReadonly, updateFilters } = useFilters()

const sharedData = computed<ShareData | null>(() =>
  isReadonly.value ? decode(route.query.data as string) : null
)

const activeFilters = computed<FilterState>(() =>
  isReadonly.value
    ? (sharedData.value?.filters ?? { category: '', country: '', status: '' })
    : filters.value
)

const sourceEntries = computed<Entry[]>(() =>
  isReadonly.value ? (sharedData.value?.entries ?? []) : entries.value
)

const isFiltered = computed(
  () => !!(activeFilters.value.category || activeFilters.value.country)
)

const displayEntries = computed(() =>
  sourceEntries.value.filter((e) => {
    const f = activeFilters.value
    if (f.category && e.category !== f.category) return false
    if (f.country && e.country !== f.country) return false
    return true
  })
)

const categoryCounts = computed(() => {
  const c: Record<string, number> = { 全部: sourceEntries.value.length }
  sourceEntries.value.forEach((e) => {
    c[e.category] = (c[e.category] ?? 0) + 1
  })
  return c
})

const showAddForm = ref(false)
const urlCopied = ref(false)

const shareData = computed<ShareData>(() => ({
  tab: 'ranking',
  entries: entries.value,
  filters: filters.value,
}))

function handleAdd(data: Omit<Entry, 'id' | 'addedAt'>) {
  add(data)
  showAddForm.value = false
}

async function copyUrl() {
  const { copy } = useShare()
  await copy(shareData.value)
  urlCopied.value = true
  setTimeout(() => {
    urlCopied.value = false
  }, 2000)
}

function move(entry: Entry, dir: number) {
  const i = entries.value.findIndex((e) => e.id === entry.id)
  const j = i + dir
  if (j < 0 || j >= entries.value.length) return
  const next = entries.value.slice()
  ;[next[i], next[j]] = [next[j], next[i]]
  entries.value = next
}

function trueRank(entry: Entry) {
  return sourceEntries.value.findIndex((e) => e.id === entry.id) + 1
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
    <Icon icon="mdi:eye-outline" class="mr-1 inline h-4 w-4" />
    這是分享的唯讀排行
  </div>

  <!-- Page header -->
  <AppPageHeader
    kicker="My Ranking · 年度排行"
    title="Top Picks"
    title-cn="排行"
  >
    <p class="pg-sub">拖曳或用箭頭調整名次，前三名授予獎牌</p>
  </AppPageHeader>

  <!-- Add + Share toolbar -->
  <div v-if="!isReadonly" class="mb-3 mt-4 flex items-center justify-between gap-3">
    <button
      class="add-btn"
      style="width: auto; padding: 10px 20px; flex: none"
      type="button"
      @click="showAddForm = true"
    >
      <Icon icon="mdi:plus" class="h-4 w-4" />
      新增 / 加入排行
    </button>
    <button
      class="chip"
      style="font-size: 12px; padding-bottom: 4px"
      type="button"
      @click="copyUrl"
    >
      <Icon
        :icon="urlCopied ? 'mdi:check' : 'mdi:share-variant-outline'"
        class="mr-0.5 h-3.5 w-3.5"
      />
      {{ urlCopied ? '已複製' : '分享連結' }}
    </button>
  </div>

  <!-- Category filter chips -->
  <div class="mt-1">
    <FilterBar
      :filters="activeFilters"
      :counts="categoryCounts"
      :disabled="isReadonly"
      :show-search="false"
      :show-sort="false"
      @update:filters="updateFilters"
    />
  </div>

  <!-- Filtered hint -->
  <p
    v-if="isFiltered && !isReadonly"
    class="text-ink-faint mt-2 font-sans text-[10px] tracking-[.12em]"
  >
    篩選中，拖曳排序已暫停
  </p>

  <!-- Empty state -->
  <EmptyState
    v-if="displayEntries.length === 0"
    message="這個分類還沒有上榜影片"
    hint="新增影片或調整篩選"
  />

  <!-- Draggable rank list -->
  <VueDraggable
    v-else-if="!isFiltered && !isReadonly"
    v-model="entries"
    :animation="200"
    handle=".drag-handle"
    class="rk-list mt-4"
  >
    <RankRow
      v-for="(entry, idx) in entries"
      :key="entry.id"
      :entry="entry"
      :rank="idx + 1"
      :is-first="idx === 0"
      :is-last="idx === entries.length - 1"
      @up="move(entry, -1)"
      @down="move(entry, 1)"
      @remove="remove(entry.id)"
    />
  </VueDraggable>

  <!-- Static list (filtered / readonly) -->
  <div v-else class="rk-list mt-4">
    <RankRow
      v-for="(entry, idx) in displayEntries"
      :key="entry.id"
      :entry="entry"
      :rank="trueRank(entry)"
      :is-first="idx === 0"
      :is-last="idx === displayEntries.length - 1"
      :readonly="isReadonly"
      @up="move(entry, -1)"
      @down="move(entry, 1)"
      @remove="remove(entry.id)"
    />
  </div>

  <!-- Share panel (text-based) -->
  <SharePanel v-if="sourceEntries.length > 0" :entries="sourceEntries" />

  <!-- Add form sheet -->
  <Teleport to="body">
    <AddEntryForm
      v-if="showAddForm && !isReadonly"
      default-status="看完"
      @add="handleAdd"
      @cancel="showAddForm = false"
    />
  </Teleport>
</template>
