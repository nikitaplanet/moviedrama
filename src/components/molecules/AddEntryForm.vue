<script lang="ts" setup>
import {computed, reactive, ref, watch} from 'vue';
import {Icon} from '@iconify/vue';
import type {Entry, EntryCategory, EntryStatus} from '../../types';
import {STATUSES, getFlag} from '../../types';
import {useTmdb, type TmdbResult} from '../../composables/useTmdb';
import StarRating from '../atoms/StarRating.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const props = withDefaults(
	defineProps<{defaultStatus?: EntryStatus; entry?: Entry; existingEntries?: Entry[]}>(),
	{defaultStatus: '待看', existingEntries: () => []},
);
const emit = defineEmits<{
	add: [data: Omit<Entry, 'id' | 'addedAt'>];
	update: [data: Omit<Entry, 'id' | 'addedAt'>];
	cancel: [];
}>();

const isEdit = computed(() => !!props.entry);
const showDuplicateConfirm = ref(false);
let pendingData: Omit<Entry, 'id' | 'addedAt'> | null = null;

const form = reactive({
	title: props.entry?.title ?? '',
	titleEn: props.entry?.titleEn ?? '',
	category: (props.entry?.category ?? '電影') as EntryCategory,
	country: props.entry?.country ?? '',
	status: (props.entry?.status ?? props.defaultStatus) as EntryStatus,
	rating: props.entry?.rating ?? 0,
	note: props.entry?.note ?? '',
	year: props.entry?.year as number | undefined,
	posterUrl: props.entry?.posterUrl ?? ('' as string),
	tmdbData: props.entry?.tmdbData as Record<string, unknown> | undefined,
	releaseDate: props.entry?.releaseDate as string | undefined,
	overview:    props.entry?.overview   as string | undefined,
});

// --- TMDB search ---
const {search: tmdbSearch} = useTmdb();
const tmdbQuery = ref('');
const tmdbResults = ref<TmdbResult[]>([]);
const tmdbLoading = ref(false);
const showResults = ref(false);
let debounceTimer: ReturnType<typeof setTimeout>;

watch(tmdbQuery, (q) => {
	clearTimeout(debounceTimer);
	if (!q.trim()) {
		tmdbResults.value = [];
		showResults.value = false;
		return;
	}
	debounceTimer = setTimeout(async () => {
		tmdbLoading.value = true;
		try {
			tmdbResults.value = await tmdbSearch(q);
			showResults.value = true;
		} finally {
			tmdbLoading.value = false;
		}
	}, 400);
});

function fillFromTmdb(result: TmdbResult) {
	form.title = result.title;
	form.titleEn = result.originalTitle;
	form.year = result.year;
	form.category = result.category;
	form.country = result.country;
	form.posterUrl = result.posterUrl ?? '';
	form.tmdbData = result.raw;
	form.releaseDate = result.releaseDate;
	form.overview    = result.overview;
	if (!isEdit.value && result.releaseDate && result.releaseDate > new Date().toISOString().slice(0, 10)) {
		form.status = '即將上映';
	}
	tmdbQuery.value = '';
	showResults.value = false;
}

function clearMovie() {
	form.title = '';
	form.titleEn = '';
	form.year = undefined;
	form.category = '電影';
	form.country = '';
	form.posterUrl = '';
	form.tmdbData = undefined;
	form.releaseDate = undefined;
	form.overview    = undefined;
}

// --- submit ---
function submit() {
	if (!form.title.trim()) return;
	const data: Omit<Entry, 'id' | 'addedAt'> = {
		title: form.title.trim(),
		titleEn: form.titleEn.trim() || undefined,
		category: form.category,
		country: form.country,
		status: form.status,
		rating: form.rating,
		note: form.note.trim(),
		year: form.year,
		posterUrl: form.posterUrl || undefined,
		tmdbData: form.tmdbData,
		releaseDate: form.releaseDate,
		overview:    form.overview,
	};
	if (isEdit.value) {
		const isDuplicate = props.existingEntries.some(
			(e) => e.title === data.title && e.id !== props.entry!.id,
		);
		if (isDuplicate) {
			pendingData = data;
			showDuplicateConfirm.value = true;
			return;
		}
		emit('update', data);
	} else {
		const isDuplicate = props.existingEntries.some((e) => e.title === data.title);
		if (isDuplicate) {
			pendingData = data;
			showDuplicateConfirm.value = true;
			return;
		}
		doAdd(data);
	}
}

function doAdd(data: Omit<Entry, 'id' | 'addedAt'>) {
	emit('add', data);
	form.title = '';
	form.titleEn = '';
	form.country = '';
	form.status = props.defaultStatus as EntryStatus;
	form.rating = 0;
	form.note = '';
	form.year = undefined;
	form.posterUrl = '';
	form.tmdbData = undefined;
	form.releaseDate = undefined;
	form.overview = undefined;
}

function confirmDuplicate() {
	if (!pendingData) return;
	if (isEdit.value) {
		emit('update', pendingData);
	} else {
		doAdd(pendingData);
	}
	pendingData = null;
}
</script>

<template>
	<div class="sheet-wrap" @click.self="emit('cancel')">
		<div class="sheet">
			<div class="sheet-grab" />

			<div class="mb-4 flex items-center justify-between">
				<h3 class="m-0 text-xl font-medium leading-none tracking-[.02em] text-ink">{{ isEdit ? '編輯項目' : '新增項目' }}</h3>
				<button class="text-ink-faint transition-colors hover:text-ink" @click="emit('cancel')" type="button">
					<Icon class="h-5 w-5" icon="mdi:close" />
				</button>
			</div>

			<div class="sheet-scroll">
				<div class="sheet-form">
					<!-- TMDB search -->
					<div class="relative mb-3">
						<label
							>{{ form.title ? '重新搜尋' : '搜尋影劇' }} <span class="font-sans text-[9px] tracking-widest opacity-50">TMDB</span>
							<div class="mt-1 flex items-center gap-2 pb-1.5">
								<Icon class="h-4 w-4 flex-none" style="color:var(--ink-faint)" icon="mdi:magnify" />
								<input
									v-model="tmdbQuery"
									@focus="showResults = tmdbResults.length > 0"
									autocomplete="off"
									placeholder="輸入片名搜尋…"
									class="w-full border-0 bg-transparent text-sm outline-none"
									style="color:var(--ink)" />
								<Icon v-if="tmdbLoading" class="h-4 w-4 flex-none animate-spin" style="color:var(--ink-faint)" icon="mdi:loading" />
								<button v-else-if="tmdbQuery" style="color:var(--ink-faint)" @click="tmdbQuery = ''" type="button">
									<Icon class="h-4 w-4" icon="mdi:close" />
								</button>
							</div>
						</label>

						<!-- Results dropdown -->
						<div
							v-if="showResults && tmdbResults.length > 0"
							class="absolute left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto overflow-x-hidden rounded-xl border border-line bg-card shadow-[0_6px_24px_rgba(0,0,0,0.12)]">
							<button
								v-for="r in tmdbResults"
								:key="r.id"
								class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-black/5"
								@click="fillFromTmdb(r)"
								type="button">
								<img v-if="r.posterUrl" :alt="r.title" :data-src="r.posterUrl" class="lazyload h-14 w-10 flex-none rounded object-cover" />
								<div v-else class="flex h-14 w-10 flex-none items-center justify-center rounded bg-line">
									<Icon class="h-5 w-5 text-ink-faint" icon="mdi:image-off-outline" />
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-ink">{{ r.title }}</p>
									<p class="truncate text-xs text-ink-faint">{{ r.originalTitle }}</p>
									<p class="font-sans text-[10px] tracking-wide text-ink-faint">
										{{ r.category }} · {{ r.year ?? '—' }} {{ r.country ? `· ${r.country}` : '' }}
									</p>
								</div>
							</button>
						</div>
					</div>

					<!-- Movie info display card -->
					<div v-if="form.title" class="mb-4 flex items-start gap-3 rounded-xl border border-line bg-paper-2 p-3">
						<img v-if="form.posterUrl" :alt="form.title" :data-src="form.posterUrl" class="lazyload h-20 w-14 flex-none rounded object-cover" />
						<div v-else class="flex h-20 w-14 flex-none items-center justify-center rounded bg-line">
							<Icon class="h-6 w-6 text-ink-faint" icon="mdi:image-off-outline" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-base font-medium leading-snug text-ink">{{ form.title }}</p>
							<p v-if="form.titleEn" class="mt-0.5 font-sans text-[10px] uppercase tracking-[.18em] text-ink-faint">
								{{ form.titleEn }}
							</p>
							<div class="mt-2 flex flex-wrap items-center gap-1.5">
								<span class="info-chip">{{ form.category }}</span>
								<span v-if="form.year" class="info-chip">{{ form.year }}</span>
								<span class="info-chip">{{ form.country ? `${getFlag(form.country)} ${form.country}` : '未指定' }}</span>
								<span v-if="form.releaseDate" class="info-chip">
									<Icon class="inline h-2.5 w-2.5 mr-0.5" icon="mdi:calendar-outline" />{{ form.releaseDate }}
								</span>
							</div>
							<p v-if="form.overview" class="mt-2 text-[11px] leading-relaxed line-clamp-3" style="color:var(--ink-soft)">{{ form.overview }}</p>
							<button class="mt-2 font-sans text-[10px] tracking-wide text-ink-faint" @click="clearMovie" type="button">
								清除重選
							</button>
						</div>
					</div>

					<!-- Fallback title input (no TMDB result selected) -->
					<label v-if="!form.title">
						片名 *
						<input v-model="form.title" autofocus placeholder="輸入片名…" />
					</label>

					<!-- Release date display -->
					<div v-if="form.releaseDate" class="flex items-center gap-2 rounded-lg px-3 py-2" style="background:var(--paper-2); border:1px solid var(--line)">
						<Icon class="h-3.5 w-3.5 flex-none" style="color:#7B5EA7" icon="mdi:calendar-clock" />
						<span class="font-sans text-[11px]" style="color:var(--ink-soft)">上映日期</span>
						<span class="font-sans text-[11px] font-medium" style="color:var(--ink)">{{ form.releaseDate }}</span>
					</div>

					<!-- Status -->
					<label
						>狀態
						<select v-model="form.status">
							<option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
						</select>
					</label>

					<!-- Rating -->
					<label
						>評分
						<StarRating v-model="form.rating" :size="16" class="mt-1.5" />
					</label>

					<!-- Note -->
					<label
						>備註
						<textarea v-model="form.note" placeholder="新增備註…" rows="3" />
					</label>

					<button :disabled="!form.title.trim()" class="big-btn" @click="submit" type="button">
						<Icon v-if="!isEdit" class="mr-1 inline h-4 w-4" icon="mdi:plus" />
						<Icon v-else class="mr-1 inline h-4 w-4" icon="mdi:check" />
						{{ isEdit ? '儲存' : '新增' }}
					</button>
				</div>
			</div>
		</div>
	</div>

	<ConfirmDialog
		v-model:visible="showDuplicateConfirm"
		title="重複片名"
		:message="`《${form.title.trim()}》已在片單中，確定要再次新增嗎？`"
		@confirm="confirmDuplicate" />
</template>
