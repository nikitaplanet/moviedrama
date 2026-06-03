<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { Icon } from '@iconify/vue'
import type { Entry } from '../../types'
import { STATUS_META, CATEGORY_EN, getFlag } from '../../types'
import StarRating from '../atoms/StarRating.vue'
import AddEntryForm from './AddEntryForm.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import ShareEntryDialog from './ShareEntryDialog.vue'
import { useTmdb, type TmdbDetail } from '../../composables/useTmdb'
import { useScrollLock } from '../../composables/useScrollLock'

const props = defineProps<{
  entry: Entry
  rank: number
  isFirst: boolean
  isLast: boolean
  dragging?: boolean
  readonly?: boolean
}>()
const emit = defineEmits<{
  up: []
  down: []
  remove: []
  update: [patch: Omit<Entry, 'id' | 'addedAt'>]
}>()

const showEditSheet = ref(false)
const showConfirm = ref(false)
const showShare = ref(false)
const showPoster = ref(false)
const showDetail = ref(false)
const detail = ref<TmdbDetail | null>(null)
const detailLoading = ref(false)

const { fetchDetail } = useTmdb()

watch(showDetail, async (val) => {
  if (!val || detail.value) return
  const raw = props.entry.tmdbData
  if (!raw?.id) return
  detailLoading.value = true
  try {
    detail.value = await fetchDetail(raw.id as number, (raw.media_type ?? 'movie') as 'movie' | 'tv')
  } finally {
    detailLoading.value = false
  }
})

const anyOverlay = computed(() => showDetail.value || showPoster.value)
useScrollLock(anyOverlay)

const largePosterUrl = computed(() =>
  props.entry.posterUrl?.replace('/w200/', '/w500/') ?? props.entry.posterUrl
)

const formatDate = (iso: string) => dayjs(iso).format('YYYY.MM.DD')

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
  emit('update', data)
  showEditSheet.value = false
}

function handleConfirmDelete() {
  showConfirm.value = false
  emit('remove')
}
</script>

<template>
  <article :class="['ticket', dragging && 'ticket-lift']">
    <!-- Drag handle -->
    <span v-if="!readonly" class="drag-handle ticket-drag" title="拖曳排序">
      <Icon icon="nimbus:drag-dots" class="h-4 w-4" />
    </span>

    <!-- Poster image -->
    <img
      v-if="entry.posterUrl"
      :alt="entry.title"
      :src="entry.posterUrl"
      class="aspect-movieCover w-20 flex-none cursor-pointer self-center rounded object-cover"
      @click="showPoster = true" />

    <!-- Body -->
    <div
      class="body"
      :style="
        (readonly && !entry.posterUrl)
          ? 'padding-left: 20px'
          : entry.posterUrl
          ? 'padding-left: 12px'
          : 'padding-left: 14px'
      "
    >
      <!-- Small rank indicator -->
      <p class="rank-mini-label">
        <span
          :style="{
            color: rank === 1 ? 'var(--accent)' : rank === 2 ? 'var(--ink)' : rank === 3 ? 'var(--ink-soft)' : 'var(--ink-faint)'
          }"
        >
          <Icon v-if="rank === 1" icon="mdi:crown" class="inline h-[11px] w-[11px] mr-0.5" />{{ String(rank).padStart(2, '0') }}
        </span>
      </p>

      <!-- Top row: category · country -->
      <div class="toprow">
        <span class="catpill">
          {{ entry.category }}<span class="ce">{{ CATEGORY_EN[entry.category] }}</span>
        </span>
        <span class="ctry">
          <span class="fl">{{ getFlag(entry.country) }}</span>
          {{ entry.country || '— —' }}
        </span>
      </div>

      <!-- Title -->
      <h3 :class="entry.overview ? 'cursor-pointer transition-opacity hover:opacity-70' : ''" @click="entry.overview && (showDetail = true)">{{ entry.title }}</h3>
      <div v-if="entry.titleEn || entry.year" class="ensub">
        {{ [entry.titleEn, entry.year].filter(Boolean).join(' · ') }}
      </div>

      <!-- Mid row: stars · status · actions -->
      <div class="midrow">
        <StarRating :model-value="entry.rating" readonly :size="14" />
        <span v-if="entry.rating === 0" class="unrated">尚未評分</span>
        <span class="statuschip">
          <i :style="{ background: STATUS_META[entry.status].dot }" />
          {{ entry.status }}
        </span>
        <span v-if="!readonly" class="ml-auto flex gap-1">
          <button type="button" class="rk-arrow" title="分享給朋友" @click="showShare = true">
            <Icon icon="mdi:share-variant-outline" class="h-3.5 w-3.5" />
          </button>
          <button type="button" class="rk-arrow" title="編輯" @click="showEditSheet = true">
            <Icon icon="mdi:pencil-outline" class="h-3.5 w-3.5" />
          </button>
          <button type="button" class="rk-del" title="刪除" @click="showConfirm = true">
            <Icon icon="mdi:delete-outline" class="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      <!-- Note -->
      <p v-if="entry.note" class="note">{{ entry.note }}</p>
    </div>
  </article>

  <!-- Poster lightbox -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showPoster"
        class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
        style="background: rgba(0,0,0,0.55)"
        @click="showPoster = false">
        <img
          :src="largePosterUrl ?? entry.posterUrl"
          :alt="entry.title"
          class="poster-zoom max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          @click.stop />
      </div>
    </Transition>
  </Teleport>

  <!-- Detail overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showDetail"
        class="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-md sm:items-center"
        @click.self="showDetail = false"
        style="background: rgba(0, 0, 0, 0.6)">
        <div
          class="relative flex w-full max-w-[540px] flex-col overflow-hidden rounded-t-2xl sm:h-[480px] sm:flex-row sm:rounded-2xl"
          @click.stop
          style="background: var(--card); max-height: 90vh">
          <button
            class="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full"
            @click="showDetail = false"
            style="background: rgba(0, 0, 0, 0.35)"
            type="button">
            <Icon class="h-4 w-4 text-white" icon="mdi:close" />
          </button>
          <!-- Poster: top on mobile, left column on desktop -->
          <img
            v-if="largePosterUrl ?? entry.posterUrl"
            :alt="entry.title"
            :src="largePosterUrl ?? entry.posterUrl"
            class="h-52 w-full flex-none object-cover object-top sm:h-full sm:w-auto sm:aspect-movieCover" />
          <!-- Info: below poster on mobile, right column on desktop -->
          <div class="min-h-0 flex-1 overflow-y-auto p-5">
            <h2 class="text-xl font-semibold leading-snug" style="color: var(--ink)">{{ entry.title }}</h2>
            <p v-if="entry.titleEn" class="mt-0.5 font-sans text-[11px] uppercase tracking-[.18em]" style="color: var(--ink-faint)">
              {{ entry.titleEn }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span class="info-chip">{{ entry.category }}</span>
              <span v-if="entry.country" class="info-chip">{{ getFlag(entry.country) }} {{ entry.country }}</span>
              <span v-if="entry.releaseDate" class="info-chip">{{ formatDate(entry.releaseDate) }}</span>
            </div>
            <p class="mt-4 text-sm leading-relaxed" style="color: var(--ink-soft)">{{ entry.overview }}</p>
            <div v-if="detailLoading" class="mt-4 flex items-center gap-1.5" style="color: var(--ink-faint)">
              <Icon class="h-3.5 w-3.5 animate-spin" icon="mdi:loading" />
              <span class="font-sans text-[11px]">載入中…</span>
            </div>
            <template v-else-if="detail">
              <div v-if="detail.directors.length" class="mt-4 flex gap-2">
                <span class="flex-none font-sans text-[11px] font-medium" style="color: var(--ink-faint)">導演</span>
                <span class="text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ detail.directors.join('、') }}</span>
              </div>
              <div v-if="detail.cast.length" class="mt-2 flex gap-2">
                <span class="flex-none font-sans text-[11px] font-medium" style="color: var(--ink-faint)">主演</span>
                <span class="text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ detail.cast.join('、') }}</span>
              </div>
              <div v-if="detail.companies.length" class="mt-2 flex gap-2">
                <span class="flex-none font-sans text-[11px] font-medium" style="color: var(--ink-faint)">製作</span>
                <span class="text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ detail.companies.join('、') }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="sheet">
      <AddEntryForm
        v-if="showEditSheet"
        :entry="props.entry"
        @update="handleUpdate"
        @cancel="showEditSheet = false"
      />
    </Transition>
  </Teleport>

  <ConfirmDialog
    v-model:visible="showConfirm"
    title="確認刪除"
    :message="`確定要從排行移除《${entry.title}》嗎？`"
    @confirm="handleConfirmDelete"
  />
  <ShareEntryDialog
    v-model:visible="showShare"
    :entry="props.entry"
    source="ranking"
  />
</template>
