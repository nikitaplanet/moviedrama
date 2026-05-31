<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button', disabled: false },
)

const cls = computed(() => {
  const base =
    'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer'
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-1.5 text-sm' }
  const variants = {
    primary:
      'bg-stone-800 text-white hover:bg-stone-700 focus-visible:ring-stone-600',
    secondary:
      'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 focus-visible:ring-stone-300',
    ghost:
      'text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:ring-stone-300',
    danger:
      'text-red-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300',
  }
  return `${base} ${sizes[props.size]} ${variants[props.variant]}`
})
</script>

<template>
  <button :class="[cls, disabled && 'pointer-events-none opacity-40']" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>
