<script lang="ts" setup>
import {ref} from 'vue';
import AppDialog from '../atoms/AppDialog.vue';

const props = defineProps<{visible: boolean; current: string}>();
const emit = defineEmits<{'update:visible': [v: boolean]; confirm: [name: string]}>();

const value = ref(props.current);

function submit() {
	const trimmed = value.value.trim();
	if (!trimmed) return;
	emit('confirm', trimmed);
}
</script>

<template>
	<AppDialog :visible="visible" @update:visible="emit('update:visible', $event)">
		<div class="flex flex-col gap-4">
			<h3 class="text-xl font-semibold" style="color: var(--ink)">編輯名稱</h3>
			<input
				v-model="value"
				class="field-input h-10 rounded-lg border-2 border-gray-300 px-4 py-2"
				@keydown.enter="submit"
				@keydown.esc="emit('update:visible', false)"
				autofocus
				maxlength="32"
				placeholder="你的名字或暱稱"
				type="text" />
			<div class="flex items-center justify-end gap-4">
				<button class="chip" @click="emit('update:visible', false)" type="button">取消</button>
				<button class="add-btn" @click="submit" style="width: auto; padding: 8px 18px; flex: none" type="button">儲存</button>
			</div>
		</div>
	</AppDialog>
</template>
