<script lang="ts" setup>
defineProps<{ message: string; hint?: string }>()
</script>

<template>
  <div class="empty">
    <div class="empty-ic">◦</div>
    <p>{{ message }}</p>
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>
