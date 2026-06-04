<template>
	<div class="share">
		<div class="share-head">
			<span class="kicker">Share · 分享</span>
			<h3>複製分享文字</h3>
		</div>
		<div class="flex flex-col gap-4 rounded-[20px] border-s border-[#e5e0d5] bg-[#f4f1e9] p-4 text-xs shadow-sm">
			<div>推薦片單 — TOP {{ entries.length }}</div>
			<div class="leading-6">
				<div v-for="(item, index) in entries">
					<template v-if="index < 9">0</template>{{ index + 1 }} <span class="ml-2 inline-block">{{ item.title }}</span
					><span class="ml-2 inline-block">[{{ item.category }}]</span
					><span v-if="item.rating > 0" class="ml-2 inline-block">{{ '★'.repeat(Math.round(item.rating)) }}</span>
				</div>
			</div>
			<div>FILMVERSE</div>
		</div>

		<button class="mt-5" :class="['copy-btn', copied && 'ok']" @click="doCopy" type="button">
			<Icon :icon="copied ? 'mdi:check' : 'mdi:content-copy'" class="h-4 w-4" />
			{{ copied ? '已複製到剪貼簿' : '複製分享文字' }}
		</button>
	</div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {Icon} from '@iconify/vue';
import type {Entry} from '../../types';

const props = defineProps<{entries: Entry[]}>();

const shareText = computed(() => {
	const lines = props.entries.map((f, i) => {
		const n = String(i + 1).padStart(2, '0');
		const star = f.rating > 0 ? '  ' + '★'.repeat(Math.round(f.rating)) : '';
		const meta = `［${f.category}］${f.language ? `（${f.language}）` : ''}`;
		return `${n}  ${f.title}${meta}${star}`;
	});

	return `推薦片單 — TOP ${props.entries.length}\n────────────\n${lines.join('\n')}\n────────────\nFILMVERSE`;
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
