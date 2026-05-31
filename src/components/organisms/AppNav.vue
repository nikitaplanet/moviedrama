<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
</script>

<template>
  <nav class="tabbar sticky bottom-0 z-40 w-full md:hidden">
    <button
      :class="route.path === '/watchlist' ? 'on' : ''"
      type="button"
      @click="router.push('/watchlist')"
    >
      <span class="tn">片單</span>
      <span class="te">The List</span>
    </button>
    <button
      :class="route.path === '/ranking' ? 'on' : ''"
      type="button"
      @click="router.push('/ranking')"
    >
      <span class="tn">排行</span>
      <span class="te">Ranking</span>
    </button>
  </nav>
</template>
