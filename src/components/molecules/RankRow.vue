<script lang="ts" setup>
import {ref} from 'vue';
import {Icon} from '@iconify/vue';
import type {Entry} from '../../types';
import {CATEGORY_EN, getFlag} from '../../types';
import StarRating from '../atoms/StarRating.vue';
import RankBadge from '../atoms/RankBadge.vue';
import AddEntryForm from './AddEntryForm.vue';

const props = defineProps<{
	entry: Entry;
	rank: number;
	isFirst: boolean;
	isLast: boolean;
	dragging?: boolean;
	readonly?: boolean;
}>();
const emit = defineEmits<{
	up: [];
	down: [];
	remove: [];
	update: [patch: Omit<Entry, 'id' | 'addedAt'>];
}>();

const showEditSheet = ref(false);

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
	emit('update', data);
	showEditSheet.value = false;
}
</script>

<template>
	<div :data-pid="entry.id" :class="['rankrow', dragging && 'lift']">
		<span v-if="!readonly" title="拖曳排序" class="drag-handle rk-handle">
			<Icon class="h-4 w-4" icon="nimbus:drag-dots" />
		</span>

		<RankBadge :rank="rank" />

		<div class="rk-body">
			<div class="rk-top">
				<h4>{{ entry.title }}</h4>
				<span v-if="entry.country" class="rk-flag">{{ getFlag(entry.country) }}</span>
			</div>
			<div class="rk-meta">
				<span class="catpill"
					>{{ entry.category }}<span class="ce">{{ CATEGORY_EN[entry.category] }}</span></span
				>
				<StarRating :model-value="entry.rating" :size="12" readonly />
				<span v-if="entry.rating === 0" class="unrated">未評分</span>
				<span v-if="entry.titleEn" class="rk-en">{{ entry.titleEn }}</span>
			</div>
		</div>

		<div v-if="!readonly" class="rk-ctrl">
			<button title="上移" :disabled="isFirst" class="rk-arrow" @click="emit('up')" type="button">
				<Icon class="h-3.5 w-3.5" icon="mdi:arrow-up" />
			</button>
			<button title="下移" :disabled="isLast" class="rk-arrow" @click="emit('down')" type="button">
				<Icon class="h-3.5 w-3.5" icon="mdi:arrow-down" />
			</button>
			<button title="編輯" class="rk-arrow" @click="showEditSheet = true" type="button">
				<Icon class="h-3.5 w-3.5" icon="mdi:pencil-outline" />
			</button>
			<button title="移除" class="rk-del" @click="emit('remove')" type="button">
				<Icon class="h-3.5 w-3.5" icon="mdi:close" />
			</button>
		</div>
	</div>

	<Teleport to="body">
		<Transition name="sheet">
			<AddEntryForm v-if="showEditSheet" :entry="props.entry" @cancel="showEditSheet = false" @update="handleUpdate" />
		</Transition>
	</Teleport>
</template>
