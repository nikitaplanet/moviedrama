<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Entry } from '../../types'
import { STATUS_META, CATEGORY_EN, getFlag } from '../../types'
import StarRating from '../atoms/StarRating.vue'
import AddEntryForm from './AddEntryForm.vue'

const props = withDefaults(
  defineProps<{ entry: Entry; rank?: number; readonly?: boolean; dragging?: boolean }>(),
  { readonly: false, dragging: false },
)
const emit = defineEmits<{
  remove: [id: string]
  update: [id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>]
}>()

const showEditSheet = ref(false)

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
  emit('update', props.entry.id, data)
  showEditSheet.value = false
}

const flag = (c: string) => getFlag(c)
</script>

<template>
  <article :class="['ticket', dragging && 'ticket-lift']">
    <div class="body">
      <!-- Top row: category · country -->
      <div class="toprow">
        <span class="catpill">
          {{ entry.category }}<span class="ce">{{ CATEGORY_EN[entry.category] }}</span>
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
          <button type="button" class="rk-arrow" title="編輯" @click="showEditSheet = true">
            <Icon icon="mdi:pencil-outline" class="h-3.5 w-3.5" />
          </button>
          <button type="button" class="rk-del" title="刪除" @click="emit('remove', entry.id)">
            <Icon icon="mdi:delete-outline" class="h-3.5 w-3.5" />
          </button>
          <span class="drag-handle rk-handle" style="grid-column:auto;width:26px;height:24px;" title="拖曳排序">
            <Icon icon="mdi:drag-vertical" class="h-4 w-4" />
          </span>
        </span>
      </div>

      <!-- Note -->
      <p v-if="entry.note" class="note">{{ entry.note }}</p>
    </div>
  </article>

  <Teleport to="body">
    <AddEntryForm
      v-if="showEditSheet"
      :entry="entry"
      @update="handleUpdate"
      @cancel="showEditSheet = false"
    />
  </Teleport>
</template>
