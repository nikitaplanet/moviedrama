<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { signIn, signUp } = useAuth()

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    if (mode.value === 'login') {
      await signIn(email.value, password.value)
    } else {
      await signUp(email.value, password.value)
      error.value = '已寄出驗證信，請確認信箱後再登入'
      mode.value = 'login'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '發生錯誤，請再試一次'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center px-6" style="background: var(--paper)">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <p class="kicker mb-1">私人放映室</p>
        <h1 class="pg-title">{{ mode === 'login' ? '登入' : '註冊' }}</h1>
      </div>

      <form class="card flex flex-col gap-4 p-6" @submit.prevent="submit">
        <div class="flex flex-col gap-1">
          <label class="field-label">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="field-input"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="field-label">密碼</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="field-input"
          />
        </div>

        <p v-if="error" class="text-sm" :class="error.includes('驗證') ? 'text-green-600' : 'text-red-500'">
          {{ error }}
        </p>

        <button type="submit" class="btn-primary mt-1" :disabled="busy">
          {{ busy ? '請稍候…' : mode === 'login' ? '登入' : '建立帳號' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm" style="color: var(--muted)">
        <template v-if="mode === 'login'">
          還沒有帳號？
          <button class="underline" style="color: var(--accent)" @click="mode = 'signup'">立即註冊</button>
        </template>
        <template v-else>
          已有帳號？
          <button class="underline" style="color: var(--accent)" @click="mode = 'login'">返回登入</button>
        </template>
      </p>
    </div>
  </div>
</template>
