<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Entry } from '../../types'
import { CATEGORY_EN, getFlag } from '../../types'
import StarRating from '../atoms/StarRating.vue'
import RankBadge from '../atoms/RankBadge.vue'
import AddEntryForm from './AddEntryForm.vue'

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

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
  emit('update', data)
  showEditSheet.value = false
}
</script>

<template>
  <div :class="['rankrow', dragging && 'lift']" :data-pid="entry.id">
    <span v-if="!readonly" class="drag-handle rk-handle" title="拖曳排序">
      <Icon icon="mdi:drag-vertical" class="h-4 w-4" />
    </span>

    <RankBadge :rank="rank" />

    <div class="rk-body">
      <div class="rk-top">
        <h4>{{ entry.title }}</h4>
        <span v-if="entry.country" class="rk-flag">{{
          getFlag(entry.country)
        }}</span>
      </div>
      <div class="rk-meta">
        <span class="catpill"
          >{{ entry.category
          }}<span class="ce">{{ CATEGORY_EN[entry.category] }}</span></span
        >
        <StarRating :model-value="entry.rating" readonly :size="12" />
        <span v-if="entry.rating === 0" class="unrated">未評分</span>
        <span v-if="entry.titleEn" class="rk-en">{{ entry.titleEn }}</span>
      </div>
    </div>

    <div v-if="!readonly" class="rk-ctrl">
      <button
        class="rk-arrow"
        :disabled="isFirst"
        type="button"
        title="上移"
        @click="emit('up')"
      >
        <Icon icon="mdi:arrow-up" class="h-3.5 w-3.5" />
      </button>
      <button
        class="rk-arrow"
        :disabled="isLast"
        type="button"
        title="下移"
        @click="emit('down')"
      >
        <Icon icon="mdi:arrow-down" class="h-3.5 w-3.5" />
      </button>
      <button
        class="rk-arrow"
        type="button"
        title="編輯"
        @click="showEditSheet = true"
      >
        <Icon icon="mdi:pencil-outline" class="h-3.5 w-3.5" />
      </button>
      <button class="rk-del" type="button" title="移除" @click="emit('remove')">
        <Icon icon="mdi:close" class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  <Teleport to="body">
    <AddEntryForm
      v-if="showEditSheet"
      :entry="props.entry"
      @update="handleUpdate"
      @cancel="showEditSheet = false"
    />
  </Teleport>
</template>
