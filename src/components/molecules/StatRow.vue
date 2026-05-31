<script lang="ts" setup>
defineProps<{
  total: number
  toWatch: number
  done: number
}>()
</script>

<template>
  <div class="statrow">
    <div class="stat">
      <div class="sv">{{ total }}</div>
      <div class="sl">總數</div>
      <div class="se">TOTAL</div>
    </div>
    <div class="stat">
      <div class="sv">{{ toWatch }}</div>
      <div class="sl">待看</div>
      <div class="se">QUEUE</div>
    </div>
    <div class="stat">
      <div class="sv acc">{{ done }}</div>
      <div class="sl">看完</div>
      <div class="se">SEEN</div>
    </div>
  </div>
</template>
