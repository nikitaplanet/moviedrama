<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Entry, EntryCategory, EntryStatus } from '../../types'
import { CATEGORIES, STATUSES, STATUS_META, CATEGORY_EN, PRESET_COUNTRIES, getFlag } from '../../types'
import StarRating from '../atoms/StarRating.vue'

const props = withDefaults(
  defineProps<{ entry: Entry; rank?: number; readonly?: boolean; dragging?: boolean }>(),
  { readonly: false, dragging: false },
)
const emit = defineEmits<{
  remove: [id: string]
  update: [id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>]
}>()

const isEditing = ref(false)
const form = reactive({
  title:    '',
  titleEn:  '',
  category: '電影' as EntryCategory,
  country:  '',
  status:   '待看' as EntryStatus,
  rating:   0,
  note:     '',
  year:     undefined as number | undefined,
})

function startEdit() {
  Object.assign(form, {
    title:    props.entry.title,
    titleEn:  props.entry.titleEn ?? '',
    category: props.entry.category,
    country:  props.entry.country,
    status:   props.entry.status,
    rating:   props.entry.rating,
    note:     props.entry.note,
    year:     props.entry.year,
  })
  isEditing.value = true
}

function save() {
  if (!form.title.trim()) return
  emit('update', props.entry.id, {
    title:    form.title.trim(),
    titleEn:  form.titleEn.trim() || undefined,
    category: form.category,
    country:  form.country,
    status:   form.status,
    rating:   form.rating,
    note:     form.note.trim(),
    year:     form.year,
  })
  isEditing.value = false
}

const maxYear = new Date().getFullYear() + 2
const flag = (c: string) => getFlag(c)
</script>

<template>
  <!-- Edit mode -->
  <div v-if="isEditing" class="sheet-form rounded-lg border p-4 mb-3" style="border-color:var(--accent); background:var(--card);">
    <div class="flex items-center justify-between mb-4">
      <span class="kicker">編輯</span>
      <button type="button" class="text-ink-faint hover:text-ink transition-colors" @click="isEditing = false">
        <Icon icon="mdi:close" class="h-4 w-4" />
      </button>
    </div>

    <div class="form-2 mb-4">
      <label class="col-span-2" style="grid-column: 1/-1">
        片名 *
        <input v-model="form.title" placeholder="輸入片名…" />
      </label>
    </div>
    <div class="form-2 mb-4">
      <label>英文名稱
        <input v-model="form.titleEn" placeholder="ENGLISH TITLE" style="text-transform: uppercase" />
      </label>
      <label>年份
        <input v-model.number="form.year" type="number" placeholder="2024" min="1900" :max="maxYear" />
      </label>
    </div>
    <div class="form-2 mb-4">
      <label>分類
        <select v-model="form.category">
          <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label>觀看狀態
        <select v-model="form.status">
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
    </div>
    <div class="form-2 mb-4">
      <label>國家
        <input v-model="form.country" list="edit-country-dl" placeholder="預設" />
        <datalist id="edit-country-dl">
          <option v-for="c in PRESET_COUNTRIES" :key="c" :value="c" />
        </datalist>
      </label>
      <label>評分
        <StarRating v-model="form.rating" :size="16" class="mt-1" />
      </label>
    </div>
    <label class="mb-4">備註
      <textarea v-model="form.note" placeholder="新增備註…" rows="2" />
    </label>

    <div class="flex justify-end gap-2 mt-2">
      <button type="button" class="chip" @click="isEditing = false">取消</button>
      <button type="button" class="big-btn" style="width:auto;padding:10px 24px;" :disabled="!form.title.trim()" @click="save">儲存</button>
    </div>
  </div>

  <!-- Display mode -->
  <article v-else :class="['ticket', dragging && 'ticket-lift']">
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

      <!-- Mid row: stars · status · edit/delete -->
      <div class="midrow">
        <StarRating :model-value="entry.rating" readonly :size="14" />
        <span v-if="entry.rating === 0" class="unrated">尚未評分</span>
        <span class="statuschip">
          <i :style="{ background: STATUS_META[entry.status].dot }" />
          {{ entry.status }}
        </span>

        <!-- Actions (only in edit mode) -->
        <span v-if="!readonly" class="ml-auto flex gap-1">
          <button type="button" class="rk-arrow" title="編輯" @click="startEdit">
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
</template>
