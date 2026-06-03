<script lang="ts" setup>
import {ref, computed, watch} from 'vue';
import dayjs from 'dayjs';
import {Icon} from '@iconify/vue';
import type {Entry} from '../../types';
import {STATUS_META, CATEGORY_EN, getFlag} from '../../types';
import StarRating from '../atoms/StarRating.vue';
import AddEntryForm from './AddEntryForm.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import ShareEntryDialog from './ShareEntryDialog.vue';
import {useTmdb, type TmdbDetail} from '../../composables/useTmdb';
import {useScrollLock} from '../../composables/useScrollLock';
import {useWatchlist} from '../../composables/useWatchlist';

const props = withDefaults(
	defineProps<{
		entry: Entry;
		rank?: number;
		readonly?: boolean;
		dragging?: boolean;
		sortable?: boolean;
		addable?: boolean;
	}>(),
	{readonly: false, dragging: false, sortable: true, addable: false},
);
const emit = defineEmits<{
	remove: [id: string];
	update: [id: string, patch: Partial<Omit<Entry, 'id' | 'addedAt'>>];
	'import-entry': [entry: Entry];
}>();

const showEditSheet = ref(false);
const showConfirm = ref(false);
const showShare = ref(false);
const showImportConfirm = ref(false);
const imported = ref(false);
const showPoster = ref(false);
const showDetail = ref(false);

const {entries: myEntries} = useWatchlist();
const alreadyInList = computed(() =>
	props.addable && myEntries.value.some((e) => e.title === props.entry.title),
);
const detail = ref<TmdbDetail | null>(null);
const detailLoading = ref(false);

const {fetchDetail} = useTmdb();

watch(showDetail, async (val) => {
	if (!val || detail.value) return;
	const raw = props.entry.tmdbData;
	if (!raw?.id) return;
	detailLoading.value = true;
	try {
		detail.value = await fetchDetail(raw.id as number, (raw.media_type ?? 'movie') as 'movie' | 'tv');
	} finally {
		detailLoading.value = false;
	}
});

const anyOverlay = computed(() => showDetail.value || showPoster.value);
useScrollLock(anyOverlay);

const largePosterUrl = computed(() => props.entry.posterUrl?.replace('/w200/', '/w500/') ?? props.entry.posterUrl);

function handleImportClick() {
	if (alreadyInList.value) return;
	showImportConfirm.value = true;
}

function confirmImport() {
	showImportConfirm.value = false;
	emit('import-entry', props.entry);
	imported.value = true;
	setTimeout(() => {
		imported.value = false;
	}, 2000);
}

function handleUpdate(data: Omit<Entry, 'id' | 'addedAt'>) {
	emit('update', props.entry.id, data);
	showEditSheet.value = false;
}

function handleConfirmDelete() {
	showConfirm.value = false;
	emit('remove', props.entry.id);
}

const flag = (c: string) => getFlag(c);

const formatDate = (iso: string) => dayjs(iso).format('YYYY.MM.DD');
</script>

<template>
	<article :class="['ticket', dragging && 'ticket-lift']">
		<span v-if="!readonly && sortable" title="拖曳排序" class="drag-handle ticket-drag">
			<Icon class="h-4 w-4" icon="nimbus:drag-dots" />
		</span>
		<img
			v-if="entry.posterUrl"
			:alt="entry.title"
			:src="entry.posterUrl"
			:class="['aspect-movieCover w-32 flex-none cursor-pointer self-center rounded-md object-cover', (readonly || !sortable) && 'ml-5']"
			@click="showPoster = true" />
		<div :style="(readonly || !sortable) && !entry.posterUrl ? 'padding-left: 20px' : entry.posterUrl ? 'padding-left: 12px' : ''" class="body">
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
			<h3 :class="entry.overview ? 'cursor-pointer transition-opacity hover:opacity-70' : ''" @click="entry.overview && (showDetail = true)">
				{{ entry.title }}
			</h3>
			<div v-if="entry.titleEn || entry.releaseDate" class="ensub mt-2 leading-4">
				{{ [entry.titleEn, entry.releaseDate ? formatDate(entry.releaseDate) : null].filter(Boolean).join(' · ') }}
			</div>
			<!-- Overview preview -->
			<p v-if="entry.overview" class="mt-2 line-clamp-3 text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ entry.overview }}</p>

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

			<!-- Add to watchlist button (addable mode) — own row, right-aligned, above note -->
			<div v-if="addable" class="flex justify-end pr-[18px]">
				<button
					:disabled="alreadyInList || imported"
					:title="alreadyInList ? '已在片單中' : imported ? '已加入' : '加入我的片單'"
					class="rk-arrow !w-auto px-2 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
					@click="handleImportClick"
					type="button">
					<Icon :icon="alreadyInList || imported ? 'mdi:check' : 'mdi:playlist-plus'" class="h-3.5 w-3.5" />
					<span class="font-sans text-[10px] tracking-wide">{{ alreadyInList ? '已在片單' : imported ? '已加入' : '加入片單' }}</span>
				</button>
			</div>

			<!-- Coming-soon tag -->
			<div v-if="entry.status === '即將上映'" class="mt-1 flex items-center justify-end">
				<span
					class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[9px] font-semibold tracking-[.12em]"
					style="background: rgba(123, 94, 167, 0.12); color: #7b5ea7; border: 1px solid rgba(123, 94, 167, 0.25)">
					<Icon class="h-2.5 w-2.5" icon="mdi:clock-outline" />
					即將上映
				</span>
			</div>
		</div>

		<!-- Note footer — full width below poster+info -->
		<div v-if="entry.note || entry.recommendedBy" class="ticket-footer">
			<p v-if="entry.note" class="note">{{ entry.note }}</p>
			<div v-if="entry.recommendedBy" :class="['note', entry.note && 'mt-2']" style="color: var(--accent); opacity: 0.85">
				<p class="flex items-center gap-1">
					<Icon class="inline h-3 w-3 flex-none" icon="mdi:account-heart-outline" />
					{{ entry.recommendedBy }} 推薦
				</p>
				<p v-if="entry.recommendedNote" class="mt-0.5 pl-4 italic">"{{ entry.recommendedNote }}"</p>
			</div>
		</div>
	</article>

	<Teleport to="body">
		<Transition name="fade">
			<div
				v-if="showPoster"
				class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
				@click="showPoster = false"
				style="background: rgba(0, 0, 0, 0.55)">
				<img
					:alt="entry.title"
					:src="largePosterUrl ?? entry.posterUrl"
					class="poster-zoom max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
					@click.stop />
			</div>
		</Transition>
	</Teleport>

	<!-- Detail overlay -->
	<Teleport to="body">
		<Transition name="fade">
			<div
				v-if="showDetail"
				class="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-md sm:items-center"
				@click.self="showDetail = false"
				style="background: rgba(0, 0, 0, 0.6)">
				<div
					class="relative flex w-full max-w-[800px] flex-col overflow-hidden rounded-t-2xl sm:h-[480px] sm:flex-row sm:rounded-2xl"
					@click.stop
					style="background: var(--card); max-height: 90vh">
					<!-- Close -->
					<button
						class="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full"
						@click="showDetail = false"
						style="background: rgba(0, 0, 0, 0.35)"
						type="button">
						<Icon class="h-4 w-4 text-white" icon="mdi:close" />
					</button>
					<!-- Poster: top on mobile, left column on desktop -->
					<img
						v-if="largePosterUrl ?? entry.posterUrl"
						:alt="entry.title"
						:src="largePosterUrl ?? entry.posterUrl"
						class="h-52 w-full flex-none object-cover object-top sm:aspect-movieCover sm:h-full sm:w-auto" />
					<!-- Info: below poster on mobile, right column on desktop -->
					<div class="min-h-0 flex-1 overflow-y-auto p-5">
						<h2 class="text-xl font-semibold leading-snug" style="color: var(--ink)">{{ entry.title }}</h2>
						<p v-if="entry.titleEn" class="mt-0.5 font-sans text-[11px] uppercase tracking-[.18em]" style="color: var(--ink-faint)">
							{{ entry.titleEn }}
						</p>
						<div class="mt-2 flex flex-wrap gap-1.5">
							<span class="info-chip">{{ entry.category }}</span>
							<span v-if="entry.country" class="info-chip">{{ getFlag(entry.country) }} {{ entry.country }}</span>
							<span v-if="entry.releaseDate" class="info-chip">{{ formatDate(entry.releaseDate) }}</span>
						</div>
						<p class="mt-4 text-sm leading-relaxed" style="color: var(--ink-soft)">{{ entry.overview }}</p>

						<!-- Detail: director / companies / cast -->
						<div v-if="detailLoading" class="mt-4 flex items-center gap-1.5" style="color: var(--ink-faint)">
							<Icon class="h-3.5 w-3.5 animate-spin" icon="mdi:loading" />
							<span class="font-sans text-[11px]">載入中…</span>
						</div>
						<template v-else-if="detail">
							<div v-if="detail.directors.length" class="mt-4 flex gap-2">
								<span class="flex-none font-sans text-[11px] font-medium" style="color: var(--ink-faint)">導演</span>
								<span class="text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ detail.directors.join('、') }}</span>
							</div>
							<div v-if="detail.cast.length" class="mt-2 flex gap-2">
								<span class="flex-none font-sans text-[11px] font-medium" style="color: var(--ink-faint)">主演</span>
								<span class="text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ detail.cast.join('、') }}</span>
							</div>
							<div v-if="detail.companies.length" class="mt-2 flex gap-2">
								<span class="flex-none font-sans text-[11px] font-medium" style="color: var(--ink-faint)">製作</span>
								<span class="text-[12px] leading-relaxed" style="color: var(--ink-soft)">{{ detail.companies.join('、') }}</span>
							</div>
						</template>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>

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
	<ConfirmDialog
		v-model:visible="showImportConfirm"
		title="加入片單"
		:message="`確定要將《${entry.title}》加入我的片單嗎？`"
		@confirm="confirmImport" />
	<ShareEntryDialog v-model:visible="showShare" :entry="entry" source="watchlist" />
</template>
