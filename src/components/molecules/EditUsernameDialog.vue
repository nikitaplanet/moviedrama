<script lang="ts" setup>
import {ref} from 'vue';

const props = defineProps<{current: string}>();
const emit = defineEmits<{confirm: [name: string]; cancel: []}>();

const value = ref(props.current);

function submit() {
	const trimmed = value.value.trim();
	if (!trimmed) return;
	emit('confirm', trimmed);
}
</script>

<template>
	<div class="sheet-wrap" @click.self="emit('cancel')">
		<div class="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-[20px] p-6" style="background: var(--card)">
			<h3 class="text-xl font-semibold" style="color: var(--ink)">編輯名稱</h3>
			<input
				v-model="value"
				class="field-input h-10 rounded-lg border-2 border-gray-300 px-4 py-2"
				@keydown.enter="submit"
				@keydown.esc="emit('cancel')"
				autofocus
				maxlength="32"
				placeholder="你的名字或暱稱"
				type="text" />
			<div class="flex justify-end items-center gap-4">
				<button class="chip" @click="emit('cancel')" type="button">取消</button>
				<button class="add-btn" @click="submit" style="width: auto; padding: 8px 18px; flex: none" type="button">儲存</button>
			</div>
		</div>
	</div>
</template>
