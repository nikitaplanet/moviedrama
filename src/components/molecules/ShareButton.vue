<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { ShareData } from '../../types'
import { useShare } from '../../composables/useShare'
import AppButton from '../atoms/AppButton.vue'

const props = defineProps<{ data: ShareData }>()
const { copy } = useShare()
const copied = ref(false)

async function handle() {
  const ok = await copy(props.data)
  if (ok) {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <AppButton variant="secondary" size="sm" @click="handle">
    <Icon :icon="copied ? 'mdi:check' : 'mdi:share-variant-outline'" class="h-4 w-4" />
    {{ copied ? '已複製！' : '分享' }}
  </AppButton>
</template>
