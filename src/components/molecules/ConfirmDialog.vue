<script lang="ts" setup>
defineProps<{ title: string; message: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="sheet-wrap" @click.self="emit('cancel')">
    <div
      class="mx-auto w-full max-w-sm rounded-[20px] p-6 flex flex-col gap-4"
      style="background: var(--card)"
    >
      <div>
        <h3 class="text-base font-semibold" style="color: var(--ink)">{{ title }}</h3>
        <p class="mt-1 text-sm" style="color: var(--muted)">{{ message }}</p>
      </div>
      <div class="flex gap-2 justify-end">
        <button
          type="button"
          class="chip"
          style="font-size: 13px"
          @click="emit('cancel')"
        >
          取消
        </button>
        <button
          type="button"
          class="rounded-[20px] px-4 py-2 text-sm font-medium text-white"
          style="background: var(--accent)"
          @click="emit('confirm')"
        >
          刪除
        </button>
      </div>
    </div>
  </div>
</template>
