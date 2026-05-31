<script lang="ts" setup>
const model = defineModel<string>({ required: true })
defineProps<{ label?: string; placeholder?: string; rows?: number }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-stone-500">{{ label }}</label>
    <textarea
      v-model="model"
      :placeholder="placeholder"
      :rows="rows ?? 2"
      class="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300"
    />
  </div>
</template>
