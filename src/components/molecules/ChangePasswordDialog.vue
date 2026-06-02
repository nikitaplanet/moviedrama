<script lang="ts" setup>
import {ref} from 'vue';
import AppDialog from '../atoms/AppDialog.vue';

const props = defineProps<{visible: boolean; apiError?: string}>();
const emit = defineEmits<{'update:visible': [v: boolean]; confirm: [password: string]}>();

const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');

function reset() {
	newPassword.value = '';
	confirmPassword.value = '';
	error.value = '';
}

function submit() {
	error.value = '';
	if (newPassword.value.length < 6) {
		error.value = '密碼至少需要 6 個字元';
		return;
	}
	if (newPassword.value !== confirmPassword.value) {
		error.value = '兩次輸入的密碼不一致';
		return;
	}
	emit('confirm', newPassword.value);
	reset();
}

function cancel() {
	reset();
	emit('update:visible', false);
}
</script>

<template>
	<AppDialog :visible="visible" @update:visible="cancel">
		<div class="flex flex-col gap-4">
			<h3 class="text-xl font-semibold" style="color: var(--ink)">更改密碼</h3>
			<input
				v-model="newPassword"
				class="field-input h-10 rounded-lg border-2 border-gray-300 px-4 py-2"
				placeholder="新密碼（至少 6 碼）"
				type="password"
				autofocus
				@keydown.esc="cancel" />
			<input
				v-model="confirmPassword"
				class="field-input h-10 rounded-lg border-2 border-gray-300 px-4 py-2"
				placeholder="確認新密碼"
				type="password"
				@keydown.enter="submit"
				@keydown.esc="cancel" />
			<p v-if="error || props.apiError" class="text-xs" style="color: var(--accent)">{{ error || props.apiError }}</p>
			<div class="flex items-center justify-end gap-4">
				<button class="chip" type="button" @click="cancel">取消</button>
				<button class="add-btn" style="width: auto; padding: 8px 18px; flex: none" type="button" @click="submit">儲存</button>
			</div>
		</div>
	</AppDialog>
</template>
