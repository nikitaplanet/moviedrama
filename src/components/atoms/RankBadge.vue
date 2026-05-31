<script lang="ts" setup>
defineProps<{ rank: number }>()
</script>

<template>
  <div v-if="rank <= 3" :class="['medal', rank === 1 ? 'g' : rank === 2 ? 's' : 'b']">
    <span>{{ rank }}</span>
  </div>
  <div v-else class="ranknum">
    {{ String(rank).padStart(2, '0') }}
  </div>
</template>
