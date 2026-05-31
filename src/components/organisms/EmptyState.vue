<script lang="ts" setup>
defineProps<{ message: string; hint?: string }>()
</script>

<template>
  <div class="empty">
    <p>{{ message }}</p>
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>
