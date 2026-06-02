<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import AppDialog from '../atoms/AppDialog.vue'
import type { Entry } from '../../types'
import { getFlag } from '../../types'
import { useAuth } from '../../composables/useAuth'
import { useEntryShare } from '../../composables/useEntryShare'

const props = defineProps<{ visible: boolean; entry: Entry; source: 'watchlist' | 'ranking' }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const { user, username } = useAuth()
const { createShare, buildShareUrl } = useEntryShare()

const message = ref('')
const shareUrl = ref('')
const copied = ref(false)
const busy = ref(false)
const error = ref('')

async function generate() {
  if (!user.value) return
  busy.value = true
  error.value = ''
  try {
    const id = await createShare(user.value.id, username.value, props.entry, message.value.trim(), props.source)
    shareUrl.value = buildShareUrl(id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '建立失敗，請稍後再試'
  } finally {
    busy.value = false
  }
}

async function copy() {
  await navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1800)
}
</script>

<template>
  <AppDialog :visible="visible" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold" style="color: var(--ink)">分享給朋友</h3>
        <button type="button" @click="emit('update:visible', false)">
          <Icon class="h-5 w-5" icon="mdi:close" style="color: var(--ink-faint)" />
        </button>
      </div>

      <!-- Entry preview -->
      <div class="rounded-xl px-4 py-3" style="background: var(--paper-2); border: 1px solid var(--line)">
        <p class="flex items-center justify-start text-[11px] tracking-wide" style="color: var(--ink-soft)">
          {{ entry.category }}
          <span v-if="entry.country">&nbsp;/ {{ getFlag(entry.country) }} {{ entry.country }}</span>
          <span v-if="entry.year">&nbsp;/ {{ entry.year }}</span>
        </p>
        <p class="mt-2 text-base font-medium leading-snug tracking-wider" style="color: var(--ink)">{{ entry.title }}</p>
        <p v-if="entry.titleEn" class="text-[11px] uppercase tracking-wider" style="color: var(--ink-soft)">{{ entry.titleEn }}</p>
      </div>

      <!-- Message input (before generating) -->
      <template v-if="!shareUrl">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs">附上留言（選填）</label>
          <input
            v-model="message"
            autofocus
            class="field-input h-10 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm"
            maxlength="200"
            placeholder="推薦給你！這部超好看…"
            type="text"
          />
        </div>
        <p v-if="error" class="text-xs" style="color: var(--accent)">{{ error }}</p>
        <div class="flex justify-end gap-4">
          <button class="text-sm font-medium" type="button" @click="emit('update:visible', false)">取消</button>
          <button
            :disabled="busy"
            class="add-btn"
            style="width: auto; padding: 8px 18px; flex: none"
            type="button"
            @click="generate"
          >
            {{ busy ? '建立中…' : '產生連結' }}
          </button>
        </div>
      </template>

      <!-- Share link result (after generating) -->
      <template v-else>
        <div class="flex flex-col gap-2">
          <p class="text-xs" style="color: var(--ink-soft)">連結已產生，複製後傳給朋友：</p>
          <div class="flex items-center gap-2 rounded-xl px-3 py-2.5" style="background: var(--paper-2); border: 1px solid var(--line)">
            <span class="flex-1 truncate text-xs" style="color: var(--ink)">{{ shareUrl }}</span>
            <button class="flex-none text-xs font-semibold" style="color: var(--accent)" type="button" @click="copy">
              {{ copied ? '已複製 ✓' : '複製' }}
            </button>
          </div>
        </div>
        <div class="flex justify-end">
          <button class="chip" style="padding-bottom: 4px" type="button" @click="emit('update:visible', false)">關閉</button>
        </div>
      </template>
    </div>
  </AppDialog>
</template>
