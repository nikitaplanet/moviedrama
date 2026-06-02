<script lang="ts" setup>
import {ref} from 'vue';
import dayjs from 'dayjs';
import {Icon} from '@iconify/vue';
import type {Entry} from '../../types';
import {STATUS_META, CATEGORY_EN, getFlag} from '../../types';
import StarRating from '../atoms/StarRating.vue';
import AddEntryForm from './AddEntryForm.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import ShareEntryDialog from './ShareEntryDialog.vue';

const props = withDefaults(
	defineProps<{
		entry: Entry;
		rank?: number;
		readonly?: boolean;
		dragging?: boolean;
		sortable?: boolean;
	}>(),
	{readonly: false, dragging: false, sortable: true},
);
const emit = defineEmits<{
	remove: [id: string];
	update: [id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>];
}>();

const showEditSheet = ref(false);
const showConfirm = ref(false);
const showShare = ref(false);

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
	emit('update', props.entry.id, data);
	showEditSheet.value = false;
}

function handleConfirmDelete() {
	showConfirm.value = false;
	emit('remove', props.entry.id);
}

const flag = (c: string) => getFlag(c)

const formatDate = (iso: string) => dayjs(iso).format('YYYY.MM.DD');
</script>

<template>
	<article :class="['ticket', dragging && 'ticket-lift']">
		<span v-if="!readonly && sortable" title="拖曳排序" class="drag-handle ticket-drag">
			<Icon class="h-4 w-4" icon="nimbus:drag-dots" />
		</span>
		<div :style="(readonly || !sortable) ? 'padding-left: 20px' : ''" class="body">
			<!-- Top row: category · country -->
			<div class="toprow">
				<span class="catpill">
					{{ entry.category }}<span class="ce">{{ CATEGORY_EN[entry.category] }}</span>
				</span>
				<span class="ctry">
					<span class="fl">{{ flag(entry.country) }}</span>
					{{ entry.country || '— —' }}
				</span>
			</div>

			<!-- Title -->
			<h3>{{ entry.title }}</h3>
			<div v-if="entry.titleEn || entry.year" class="ensub mt-2">
				{{ [entry.titleEn, entry.year].filter(Boolean).join(' · ') }}
			</div>

			<!-- Mid row: stars · status · actions -->
			<div class="midrow">
				<StarRating :model-value="entry.rating" :size="14" readonly />
				<span v-if="entry.rating === 0" class="unrated">尚未評分</span>
				<span class="statuschip">
					<i :style="{background: STATUS_META[entry.status].dot}" />
					{{ entry.status }}
				</span>

				<span v-if="!readonly" class="ml-auto flex gap-1">
					<button title="分享給朋友" class="rk-arrow" @click="showShare = true" type="button">
						<Icon class="h-3.5 w-3.5" icon="mdi:share-variant-outline" />
					</button>
					<button title="編輯" class="rk-arrow" @click="showEditSheet = true" type="button">
						<Icon class="h-3.5 w-3.5" icon="mdi:pencil-outline" />
					</button>
					<button title="刪除" class="rk-del" @click="showConfirm = true" type="button">
						<Icon class="h-3.5 w-3.5" icon="mdi:delete-outline" />
					</button>
				</span>
			</div>

			<!-- Note -->
			<p v-if="entry.note" class="note">{{ entry.note }}</p>

			<!-- Recommended by -->
			<div v-if="entry.recommendedBy" class="note mt-1" style="color: var(--accent); opacity: 0.85">
				<p class="flex items-center gap-1">
					<Icon class="inline h-3 w-3 flex-none" icon="mdi:account-heart-outline" />
					{{ entry.recommendedBy }} 推薦
				</p>
				<p v-if="entry.recommendedNote" class="mt-0.5 pl-4 italic">"{{ entry.recommendedNote }}"</p>
			</div>

			<!-- Added date -->
			<p class="mt-1 text-right font-sans text-[10px] tracking-[.08em]" style="color: var(--ink-faint); opacity: 0.6">
				{{ formatDate(entry.addedAt) }}
			</p>
		</div>
	</article>

	<Teleport to="body">
		<Transition name="sheet">
			<AddEntryForm v-if="showEditSheet" :entry="entry" @cancel="showEditSheet = false" @update="handleUpdate" />
		</Transition>
	</Teleport>

	<ConfirmDialog
		v-model:visible="showConfirm"
		title="確認刪除"
		:message="`確定要刪除《${entry.title}》嗎？此操作無法復原。`"
		@confirm="handleConfirmDelete" />
	<ShareEntryDialog v-model:visible="showShare" :entry="entry" source="watchlist" />
</template>
