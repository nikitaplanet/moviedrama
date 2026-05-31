<script lang="ts" setup>
import { Icon } from '@iconify/vue'
defineProps<{ rank: number }>()
</script>

<template>
  <div v-if="rank <= 3" :class="['medal', rank === 1 ? 'g' : rank === 2 ? 's' : 'b']">
    <Icon v-if="rank === 1" icon="mdi:crown" class="h-[18px] w-[18px]" />
    <span v-else>{{ rank }}</span>
  </div>
  <div v-else class="ranknum">
    {{ String(rank).padStart(2, '0') }}
  </div>
</template>
