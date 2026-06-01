<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Entry } from '../../types'
import { STATUS_META, CATEGORY_EN, getFlag } from '../../types'
import StarRating from '../atoms/StarRating.vue'
import AddEntryForm from './AddEntryForm.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import ShareEntryDialog from './ShareEntryDialog.vue'

const props = withDefaults(
  defineProps<{
    entry: Entry
    rank?: number
    readonly?: boolean
    dragging?: boolean
  }>(),
  { readonly: false, dragging: false }
)
const emit = defineEmits<{
  remove: [id: string]
  update: [id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>]
}>()

const showEditSheet = ref(false)
const showConfirm = ref(false)
const showShare = ref(false)

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
  emit('update', props.entry.id, data)
  showEditSheet.value = false
}

function handleConfirmDelete() {
  showConfirm.value = false
  emit('remove', props.entry.id)
}

const flag = (c: string) => getFlag(c)
</script>

<template>
  <article :class="['ticket', dragging && 'ticket-lift']">
    <span v-if="!readonly" class="drag-handle ticket-drag" title="拖曳排序">
      <Icon icon="nimbus:drag-dots" class="h-4 w-4" />
    </span>
    <div class="body" :style="readonly ? 'padding-left: 18px' : ''">
      <!-- Top row: category · country -->
      <div class="toprow">
        <span class="catpill">
          {{ entry.category
          }}<span class="ce">{{ CATEGORY_EN[entry.category] }}</span>
        </span>
        <span class="ctry">
          <span class="fl">{{ flag(entry.country) }}</span>
          {{ entry.country || '— —' }}
        </span>
      </div>

      <!-- Title -->
      <h3>{{ entry.title }}</h3>
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

      <!-- Recommended by -->
      <div v-if="entry.recommendedBy" class="note mt-1" style="color: var(--accent); opacity: 0.85">
        <p class="flex items-center gap-1">
          <Icon icon="mdi:account-heart-outline" class="inline h-3 w-3 flex-none" />
          {{ entry.recommendedBy }} 推薦
        </p>
        <p v-if="entry.recommendedNote" class="mt-0.5 pl-4 italic">"{{ entry.recommendedNote }}"</p>
      </div>
    </div>
  </article>

  <Teleport to="body">
    <Transition name="sheet">
      <AddEntryForm
        v-if="showEditSheet"
        :entry="entry"
        @update="handleUpdate"
        @cancel="showEditSheet = false"
      />
    </Transition>
    <Transition name="sheet">
      <ConfirmDialog
        v-if="showConfirm"
        title="確認刪除"
        :message="`確定要刪除《${entry.title}》嗎？此操作無法復原。`"
        @confirm="handleConfirmDelete"
        @cancel="showConfirm = false"
      />
    </Transition>
    <Transition name="sheet">
      <ShareEntryDialog
        v-if="showShare"
        :entry="entry"
        source="watchlist"
        @cancel="showShare = false"
      />
    </Transition>
  </Teleport>
</template>
