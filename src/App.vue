<script lang="ts" setup>
import AppNav from './components/organisms/AppNav.vue'
</script>

<template>
  <div class="min-h-dvh flex flex-col font-sans" style="background: var(--paper)">
    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-xl px-[22px] pb-24 pt-4 md:pb-10">
        <RouterView />
      </div>
    </main>
    <AppNav />
  </div>
</template>
