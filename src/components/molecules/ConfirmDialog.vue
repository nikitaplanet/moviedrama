<script lang="ts" setup>
defineProps<{title: string; message: string}>();
const emit = defineEmits<{confirm: []; cancel: []}>();
</script>

<template>
	<div class="sheet-wrap" @click.self="emit('cancel')">
		<div class="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-[20px] p-6" style="background: var(--card)">
			<div>
				<h3 class="text-xl font-semibold" style="color: var(--ink)">{{ title }}</h3>
				<p class="mt-4 text-sm" style="color: var(--muted)">{{ message }}</p>
			</div>
			<div class="flex items-center justify-end gap-4">
				<button class="text-[13px] hover:opacity-70 transition duration-300" @click="emit('cancel')" type="button">取消</button>
				<button
					class="rounded-[20px] px-4 py-2 text-sm font-medium text-white"
					@click="emit('confirm')"
					style="background: var(--accent)"
					type="button">
					刪除
				</button>
			</div>
		</div>
	</div>
</template>
