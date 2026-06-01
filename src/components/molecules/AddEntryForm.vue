<script lang="ts" setup>
import { computed, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import type { Entry, EntryCategory, EntryStatus } from '../../types'
import { CATEGORIES, STATUSES, PRESET_COUNTRIES, getFlag } from '../../types'
import StarRating from '../atoms/StarRating.vue'

const props = withDefaults(
  defineProps<{ defaultStatus?: EntryStatus; entry?: Entry }>(),
  { defaultStatus: '待看' },
)
const emit = defineEmits<{
  add:    [data: Omit<Entry, 'id' | 'addedAt'>]
  update: [data: Omit<Entry, 'id' | 'addedAt'>]
  cancel: []
}>()

const isEdit = computed(() => !!props.entry)

const form = reactive({
  title:    props.entry?.title    ?? '',
  titleEn:  props.entry?.titleEn  ?? '',
  category: (props.entry?.category ?? '電影') as EntryCategory,
  country:  props.entry?.country  ?? '',
  status:   (props.entry?.status  ?? props.defaultStatus) as EntryStatus,
  rating:   props.entry?.rating   ?? 0,
  note:     props.entry?.note     ?? '',
  year:     props.entry?.year     as number | undefined,
})

const maxYear = new Date().getFullYear() + 2

function submit() {
  if (!form.title.trim()) return
  const data: Omit<Entry, 'id' | 'addedAt'> = {
    title:    form.title.trim(),
    titleEn:  form.titleEn.trim() || undefined,
    category: form.category,
    country:  form.country,
    status:   form.status,
    rating:   form.rating,
    note:     form.note.trim(),
    year:     form.year,
  }
  if (isEdit.value) {
    emit('update', data)
  } else {
    emit('add', data)
    form.title   = ''
    form.titleEn = ''
    form.country = ''
    form.status  = props.defaultStatus as EntryStatus
    form.rating  = 0
    form.note    = ''
    form.year    = undefined
  }
}
</script>

<template>
  <div class="sheet-wrap" @click.self="emit('cancel')">
    <div class="sheet">
      <div class="sheet-grab" />

      <div class="flex items-center justify-between mb-4">
        <h3 class="pg-title" style="font-size:20px">{{ isEdit ? '編輯項目' : '新增項目' }}</h3>
        <button type="button" class="text-[var(--ink-faint)] hover:text-[var(--ink)]" @click="emit('cancel')">
          <Icon icon="mdi:close" class="h-5 w-5" />
        </button>
      </div>

      <div class="sheet-scroll">
        <div class="sheet-form">
          <label>
            片名 *
            <input v-model="form.title" placeholder="輸入片名…" autofocus />
          </label>
          <div class="form-2">
            <label>英文 / 拼音
              <input v-model="form.titleEn" placeholder="ENGLISH TITLE" style="text-transform:uppercase" />
            </label>
            <label>年份
              <input v-model.number="form.year" type="number" placeholder="2024" min="1900" :max="maxYear" />
            </label>
          </div>
          <div class="form-2">
            <label>分類
              <select v-model="form.category">
                <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </label>
            <label>狀態
              <select v-model="form.status">
                <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
          </div>
          <div class="form-2">
            <label>國家
              <select v-model="form.country">
                <option value="">— 未指定</option>
                <option v-for="c in PRESET_COUNTRIES" :key="c" :value="c">
                  {{ getFlag(c) }} {{ c }}
                </option>
              </select>
            </label>
            <label>評分
              <StarRating v-model="form.rating" :size="16" class="mt-1.5" />
            </label>
          </div>
          <label>備註
            <textarea v-model="form.note" placeholder="新增備註…" rows="3" />
          </label>

          <button class="big-btn" :disabled="!form.title.trim()" type="button" @click="submit">
            <Icon v-if="!isEdit" icon="mdi:plus" class="inline h-4 w-4 mr-1" />
            <Icon v-else icon="mdi:check" class="inline h-4 w-4 mr-1" />
            {{ isEdit ? '儲存' : '新增' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
