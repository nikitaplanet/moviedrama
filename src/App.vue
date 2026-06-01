<script lang="ts" setup>
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from './composables/useAuth'
import { useWatchlist } from './composables/useWatchlist'
import { useRanking } from './composables/useRanking'
import { isLoading } from './lib/loading'
import AppNav from './components/organisms/AppNav.vue'

const router = useRouter()
const route = useRoute()
const { user, loading: authLoading, signOut } = useAuth()
const { load: loadWatchlist } = useWatchlist()
const { load: loadRanking } = useRanking()

watch(user, async (u) => {
  if (u) {
    await Promise.all([loadWatchlist(), loadRanking()])
  } else if (!authLoading.value) {
    router.replace({ name: 'login' })
  }
}, { immediate: true })

const isReadonly = () => !!(route.query.uid)

async function handleSignOut() {
  await signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <!-- Auth loading splash -->
  <div v-if="authLoading" class="flex min-h-dvh items-center justify-center" style="background: var(--paper)">
    <Icon icon="mdi:loading" class="h-8 w-8 animate-spin" style="color: var(--accent)" />
  </div>

  <div v-else class="min-h-dvh flex flex-col font-sans" style="background: var(--paper)">
    <!-- Sign-out button (top-right, authenticated + not readonly) -->
    <button
      v-if="user && !isReadonly()"
      class="fixed right-4 top-4 z-40 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
      style="background: var(--card); color: var(--muted); border: 1px solid var(--line)"
      title="登出"
      @click="handleSignOut"
    >
      <Icon icon="mdi:logout" class="h-3.5 w-3.5" />
      登出
    </button>

    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-xl px-[22px] pb-24 pt-4 md:pb-10">
        <RouterView />
      </div>
    </main>

    <AppNav v-if="user" />

    <!-- Global API loading overlay -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(249,246,241,0.72); backdrop-filter: blur(2px)"
      >
        <Icon icon="mdi:loading" class="h-8 w-8 animate-spin" style="color: var(--accent)" />
      </div>
    </Transition>
  </div>
</template>
