<script lang="ts" setup>
const props = withDefaults(
  defineProps<{ modelValue: number; readonly?: boolean; size?: number }>(),
  { readonly: false, size: 14 },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const pct = (v: number) => (Math.max(0, Math.min(5, v)) / 5) * 100

function select(n: number) {
  if (props.readonly) return
  emit('update:modelValue', n === props.modelValue ? 0 : n)
}
</script>

<template>
  <span
    v-if="readonly"
    class="stars"
    :style="{ fontSize: size + 'px' }"
    role="img"
    :aria-label="`${modelValue} 顆星`"
  >
    <span class="bg">★★★★★</span>
    <span class="fg" :style="{ width: pct(modelValue) + '%' }">★★★★★</span>
  </span>

  <span v-else class="inline-flex items-center gap-0.5">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="cursor-pointer transition-transform hover:scale-125"
      :style="{ fontSize: (size + 2) + 'px', fontFamily: '\'Times New Roman\', serif', color: n <= modelValue ? 'var(--accent)' : 'var(--line-2)' }"
      @click="select(n)"
    >★</button>
    <span v-if="modelValue === 0" class="unrated ml-1">未評</span>
  </span>
</template>
