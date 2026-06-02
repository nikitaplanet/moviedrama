<script lang="ts" setup>
import AppDialog from '../atoms/AppDialog.vue';

defineProps<{visible: boolean; title: string; message: string}>();
const emit = defineEmits<{'update:visible': [v: boolean]; confirm: []}>();
</script>

<template>
	<AppDialog :visible="visible" @update:visible="emit('update:visible', $event)">
		<div class="flex flex-col gap-4">
			<div>
				<h3 class="text-xl font-semibold" style="color: var(--ink)">{{ title }}</h3>
				<p class="mt-4 text-sm" style="color: var(--ink-soft)">{{ message }}</p>
			</div>
			<div class="flex items-center justify-end gap-4">
				<button class="text-[13px] transition duration-300 hover:opacity-70" @click="emit('update:visible', false)" type="button">
					取消
				</button>
				<button
					class="rounded-[20px] px-4 py-2 text-sm font-medium text-white"
					@click="emit('confirm')"
					style="background: var(--accent)"
					type="button">
					刪除
				</button>
			</div>
		</div>
	</AppDialog>
</template>
