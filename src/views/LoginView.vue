<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { signIn, signUp } = useAuth();

const mode = ref<'login' | 'signup'>('login');
const email = ref('');
const password = ref('');
const username = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
	error.value = '';
	busy.value = true;
	try {
		if (mode.value === 'login') {
			const success = await signIn(email.value, password.value);
			if (success) router.push('/');
		} else {
			await signUp(email.value, password.value, username.value.trim());
			error.value = '已寄出驗證信，請確認信箱後再登入';
			mode.value = 'login';
		}
	} catch (e: unknown) {
		error.value = e instanceof Error ? e.message : '發生錯誤，請再試一次';
	} finally {
		busy.value = false;
	}
}

function switchMode(m: 'login' | 'signup') {
	mode.value = m;
	error.value = '';
}
</script>

<template>
	<div class="flex min-h-dvh items-center justify-center px-6" style="background: var(--paper)">
		<div class="w-full max-w-sm">
			<div class="mb-8 text-center">
				<p class="kicker mb-1">FILMVERSE</p>
				<h1 class="pg-title pt-2">{{ mode === 'login' ? '登入' : '註冊' }}</h1>
			</div>

			<form class="card flex flex-col gap-4 p-6" @submit.prevent="submit">
				<div v-if="mode === 'signup'" class="flex flex-col gap-1">
					<label class="field-label">用戶名稱</label>
					<input
						v-model="username"
						class="field-input login-input"
						autocomplete="username"
						placeholder="你的名字或暱稱"
						required
						maxlength="32"
						type="text" />
				</div>

				<div class="flex flex-col gap-1">
					<label class="field-label">Email</label>
					<input v-model="email" class="field-input login-input" autocomplete="email" placeholder="you@example.com" required type="email" />
				</div>

				<div class="flex flex-col gap-1">
					<label class="field-label">密碼</label>
					<input
						v-model="password"
						class="field-input login-input"
						:autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
						placeholder="••••••••"
						required
						type="password" />
				</div>

				<p v-if="error" class="text-sm" :class="error.includes('驗證') ? 'text-green-600' : 'text-red-500'">
					{{ error }}
				</p>

				<button
					:disabled="busy"
					class="mt-4 w-full rounded-md bg-black px-5 py-2 text-center text-sm tracking-wide text-white transition-opacity duration-300 hover:opacity-80"
					type="submit">
					{{ busy ? '請稍候…' : mode === 'login' ? '登入' : '建立帳號' }}
				</button>
			</form>

			<p class="mt-4 text-center text-sm tracking-wide" style="color: var(--muted)">
				<template v-if="mode === 'login'">
					還沒有帳號？
					<button class="font-semibold underline" @click="switchMode('signup')" style="color: var(--accent)">立即註冊</button>
				</template>
				<template v-else>
					已有帳號？
					<button class="font-semibold underline" @click="switchMode('login')" style="color: var(--accent)">返回登入</button>
				</template>
			</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.login-input {
	@apply h-10 rounded-lg border-2 border-gray-300 px-4 py-2;
}
</style>
