<script lang="ts" setup>
import { onMounted, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  options: string[]
  counts?: Record<string, number>
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const segRef = ref<HTMLElement | null>(null)
const glider = ref({ left: 0, width: 0, opacity: 0 })

function updateGlider() {
  const el = segRef.value
  if (!el) return
  const idx = props.options.indexOf(props.modelValue)
  const btn = el.querySelectorAll('button')[idx]
  if (btn) {
    glider.value = { left: btn.offsetLeft, width: btn.offsetWidth, opacity: 1 }
  }
}

onMounted(() => nextTick(updateGlider))
watch(() => props.modelValue, () => nextTick(updateGlider))
</script>

<template>
  <div class="seg" ref="segRef">
    <div
      class="glider"
      :style="{
        transform: `translateX(${glider.left}px)`,
        width: glider.width + 'px',
        opacity: glider.opacity,
      }"
    />
    <button
      v-for="opt in options"
      :key="opt"
      :class="opt === modelValue ? 'on' : ''"
      type="button"
      @click="emit('update:modelValue', opt)"
    >
      <span>{{ opt }}</span>
      <span v-if="counts" class="sc">{{ counts[opt] ?? 0 }}</span>
    </button>
  </div>
</template>
