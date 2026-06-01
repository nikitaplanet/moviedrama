<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function go(path: string) {
  const uid = route.query.uid as string | undefined
  router.push({ path, query: uid ? { uid } : undefined })
}
</script>

<template>
  <nav class="tabbar sticky bottom-0 z-40 w-full md:hidden">
    <button
      :class="route.path === '/watchlist' ? 'on' : ''"
      type="button"
      @click="go('/watchlist')"
    >
      <span class="tn">片單</span>
      <span class="te">The List</span>
    </button>
    <button
      :class="route.path === '/ranking' ? 'on' : ''"
      type="button"
      @click="go('/ranking')"
    >
      <span class="tn">排行</span>
      <span class="te">Ranking</span>
    </button>
  </nav>
</template>
