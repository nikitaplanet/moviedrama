<script lang="ts" setup>
import {computed, ref} from 'vue';
import {Icon} from '@iconify/vue';
import type {Entry} from '../../types';

const props = defineProps<{entries: Entry[]}>();

const shareText = computed(() => {
	const lines = props.entries.map((f, i) => {
		const n = String(i + 1).padStart(2, '0');
		const star = f.rating > 0 ? '  ' + '★'.repeat(Math.round(f.rating)) : '';
		const meta = `［${f.category}］${f.country ? `（${f.country}）` : ''}`;
		return `${n}  ${f.title}${meta}${star}`;
	});
	return `推薦片單 — TOP ${props.entries.length}\n────────────\n${lines.join('\n')}\n────────────\nThe Reel List`;
});

const copied = ref(false);
async function doCopy() {
	try {
		await navigator.clipboard.writeText(shareText.value);
	} catch {
		/* noop */
	}
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 1800);
}
</script>

<template>
	<div class="share">
		<div class="share-head">
			<span class="kicker">Share · 分享</span>
			<h3>複製分享文字</h3>
		</div>
		<pre class="share-box">{{ shareText }}</pre>
		<button :class="['copy-btn', copied && 'ok']" @click="doCopy" type="button">
			<Icon :icon="copied ? 'mdi:check' : 'mdi:content-copy'" class="h-4 w-4" />
			{{ copied ? '已複製到剪貼簿' : '複製分享文字' }}
		</button>
	</div>
</template>
