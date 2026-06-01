<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from './composables/useAuth'
import { useWatchlist } from './composables/useWatchlist'
import { useRanking } from './composables/useRanking'
import { isLoading } from './lib/loading'
import AppNav from './components/organisms/AppNav.vue'
import EditUsernameDialog from './components/molecules/EditUsernameDialog.vue'

const router = useRouter()
const route = useRoute()
const { user, loading: authLoading, username, signOut, updateUsername } = useAuth()
const { load: loadWatchlist } = useWatchlist()
const { load: loadRanking } = useRanking()

watch(user, async (u) => {
  if (u) {
    await Promise.all([loadWatchlist(), loadRanking()])
  } else if (!authLoading.value && !route.query.uid) {
    router.replace({ name: 'login' })
  }
}, { immediate: true })

const isReadonly = () => !!(route.query.uid)
const showDropdown = ref(false)
const showEditUsername = ref(false)

function openEditUsername() {
  showDropdown.value = false
  showEditUsername.value = true
}

async function handleUpdateUsername(name: string) {
  await updateUsername(name)
  showEditUsername.value = false
}

async function handleSignOut() {
  showDropdown.value = false
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
    <!-- User menu (top-right) -->
    <div v-if="user && !isReadonly()" class="fixed right-4 top-4 z-50">
      <!-- Trigger button -->
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
        style="background: var(--card); color: var(--ink); border: 1px solid var(--line)"
        @click="showDropdown = !showDropdown"
      >
        <Icon icon="mdi:account-circle-outline" class="h-3.5 w-3.5" />
        <span v-if="username">{{ username }}</span>
        <Icon
          icon="mdi:chevron-down"
          class="h-3 w-3 transition-transform duration-200"
          :style="showDropdown ? 'transform: rotate(180deg)' : ''"
        />
      </button>

      <!-- Dropdown -->
      <Transition name="fade">
        <div
          v-if="showDropdown"
          class="absolute right-0 top-full mt-1.5 w-36 overflow-hidden rounded-xl"
          style="background: var(--card); border: 1px solid var(--line); box-shadow: 0 4px 20px rgba(0,0,0,0.10)"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 px-4 py-2.5 text-xs transition-colors hover:bg-black/5"
            style="color: var(--ink)"
            @click="openEditUsername"
          >
            <Icon icon="mdi:pencil-outline" class="h-3.5 w-3.5" />
            編輯名稱
          </button>
          <div style="height: 1px; background: var(--line)" />
          <button
            type="button"
            class="flex w-full items-center gap-2 px-4 py-2.5 text-xs transition-colors hover:bg-black/5"
            style="color: var(--muted)"
            @click="handleSignOut"
          >
            <Icon icon="mdi:logout" class="h-3.5 w-3.5" />
            登出
          </button>
        </div>
      </Transition>
    </div>

    <!-- Click-outside overlay to close dropdown -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    />

    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-xl px-[22px] pb-24 pt-4 md:pb-10">
        <RouterView />
      </div>
    </main>

    <AppNav v-if="user" />

    <!-- Edit username dialog -->
    <Teleport to="body">
      <Transition name="sheet">
        <EditUsernameDialog
          v-if="showEditUsername"
          :current="username"
          @confirm="handleUpdateUsername"
          @cancel="showEditUsername = false"
        />
      </Transition>
    </Teleport>

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
