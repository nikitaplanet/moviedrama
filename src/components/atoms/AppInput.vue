<script lang="ts" setup>
const model = defineModel<string>({ required: true })
defineProps<{ label?: string; placeholder?: string; list?: string }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-stone-500">{{ label }}</label>
    <input
      v-model="model"
      :list="list"
      :placeholder="placeholder"
      class="w-full rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300"
    />
  </div>
</template>
