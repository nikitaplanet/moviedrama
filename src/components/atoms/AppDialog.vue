<script lang="ts" setup>
import Dialog from 'primevue/dialog';

defineProps<{visible: boolean}>();
defineEmits<{'update:visible': [v: boolean]}>();
</script>

<template>
	<Dialog
		:closable="false"
		:draggable="false"
		:pt="{
			mask: {class: 'pv-overlay'},
			root: {class: 'pv-dialog'},
			header: {style: 'display:none'},
			content: {class: 'pv-dialog__body'},
			footer: {style: 'display:none'},
			transition: {name: 'pv-dialog'},
		}"
		:visible="visible"
		@update:visible="$emit('update:visible', $event)"
		append-to="body"
		dismissable-mask
		modal>
		<slot />
	</Dialog>
</template>
