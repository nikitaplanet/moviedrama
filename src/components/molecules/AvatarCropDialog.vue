<script lang="ts" setup>
import {ref} from 'vue';
import {Icon} from '@iconify/vue';
import {Cropper, CircleStencil} from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

defineProps<{file: File | null}>();
const emit = defineEmits<{
	confirm: [blob: Blob];
	cancel: [];
}>();

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);
const objectUrl = ref('');

function onFileLoad(file: File | null) {
	if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
	objectUrl.value = file ? URL.createObjectURL(file) : '';
}

defineExpose({onFileLoad});

function confirm() {
	const result = cropperRef.value?.getResult();
	if (!result?.canvas) return;
	result.canvas.toBlob((blob) => {
		if (blob) emit('confirm', blob);
	}, 'image/jpeg', 0.92);
}
</script>

<template>
	<Transition name="fade">
		<div
			v-if="file"
			class="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-md"
			style="background: rgba(0,0,0,0.6)">
			<div
				class="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl"
				style="background: var(--card)">
				<!-- Header -->
				<div class="flex items-center justify-between px-5 py-4" style="border-bottom: 1px solid var(--line)">
					<span class="text-sm font-medium" style="color: var(--ink)">裁切大頭照</span>
					<button @click="emit('cancel')" type="button">
						<Icon class="h-4 w-4" style="color: var(--ink-faint)" icon="mdi:close" />
					</button>
				</div>

				<!-- Cropper -->
				<div class="avatar-cropper-wrap h-72 w-full">
					<Cropper
						ref="cropperRef"
						:src="objectUrl"
						:stencil-component="CircleStencil"
						:stencil-props="{aspectRatio: 1}"
						:background-class-name="'avatar-cropper-bg'"
						class="h-full w-full" />
				</div>

				<!-- Actions -->
				<div class="flex gap-2 px-5 py-4">
					<button class="chip flex-1 py-2" @click="emit('cancel')" type="button">取消</button>
					<button class="add-btn flex-1 py-2" @click="confirm" type="button">
						<Icon class="h-4 w-4" icon="mdi:check" />
						確認裁切
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style>
/* Make the background image fully visible (no dark fill outside stencil from background layer) */
.avatar-cropper-bg {
	background: #111;
}

/* The draggable image area: grab cursor */
.avatar-cropper-wrap .vue-advanced-cropper__background,
.avatar-cropper-wrap .vue-advanced-cropper__image-wrapper {
	cursor: grab;
}
.avatar-cropper-wrap .vue-advanced-cropper__image-wrapper:active {
	cursor: grabbing;
}

/* Reduce the dark overlay outside the circle so image is visible */
.avatar-cropper-wrap .vue-advanced-cropper__foreground {
	background: rgba(0, 0, 0, 0.45);
}
</style>
