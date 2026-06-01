<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{ modelValue: number; readonly?: boolean; size?: number }>(),
  { readonly: false, size: 14 },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const hoverValue = ref(0)
const display = computed(() => hoverValue.value || props.modelValue)

function fill(n: number, val: number): '0%' | '50%' | '100%' {
  if (val >= n) return '100%'
  if (val >= n - 0.5) return '50%'
  return '0%'
}

function select(val: number) {
  emit('update:modelValue', val === props.modelValue ? 0 : val)
}
</script>

<template>
  <span
    class="inline-flex items-center"
    style="gap: 1px"
    :role="readonly ? 'img' : 'slider'"
    :aria-valuenow="modelValue"
    @mouseleave="!readonly && (hoverValue = 0)"
  >
    <span
      v-for="n in 5"
      :key="n"
      class="relative inline-block leading-none"
      :style="{ fontSize: (readonly ? size : size + 2) + 'px' }"
    >
      <!-- Gray background star -->
      <span style="color: var(--line-2)">★</span>
      <!-- Accent overlay, width = 0% / 50% / 100% -->
      <span
        class="absolute left-0 top-0 overflow-hidden"
        :style="{ color: 'var(--accent)', width: fill(n, readonly ? modelValue : display) }"
      >★</span>

      <!-- Hit zones (interactive only) -->
      <template v-if="!readonly">
        <span
          class="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
          @mousemove="hoverValue = n - 0.5"
          @click="select(n - 0.5)"
        />
        <span
          class="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
          @mousemove="hoverValue = n"
          @click="select(n)"
        />
      </template>
    </span>

    <span v-if="!readonly && display === 0" class="unrated ml-1" style="font-size: 12px">未評</span>
  </span>
</template>
