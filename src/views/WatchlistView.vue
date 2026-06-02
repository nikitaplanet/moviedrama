<script lang="ts" setup>
import {computed, nextTick, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {VueDraggable} from 'vue-draggable-plus';
import {Icon} from '@iconify/vue';
import type {Entry, EntryStatus, FilterState} from '../types';
import {STATUSES} from '../types';
import {useWatchlist} from '../composables/useWatchlist';
import {useShare} from '../composables/useShare';
import {useFilters} from '../composables/useFilters';
import {useAuth} from '../composables/useAuth';
import EntryCard from '../components/molecules/EntryCard.vue';
import AddEntryForm from '../components/molecules/AddEntryForm.vue';
import FilterBar from '../components/molecules/FilterBar.vue';
import SegmentedControl from '../components/molecules/SegmentedControl.vue';
import StatRow from '../components/molecules/StatRow.vue';
import EmptyState from '../components/organisms/EmptyState.vue';
import AppPageHeader from '../components/organisms/AppPageHeader.vue';
import Pagination from '../components/atoms/Pagination.vue';

const route = useRoute();
const router = useRouter();
const {user, username, fetchUsername} = useAuth();
const {entries, publicEntries, add, remove, update, loadPublic, syncOrder} = useWatchlist();
const {filters, isReadonly, updateFilters} = useFilters();

const uid = computed(() => route.query.uid as string | undefined);
const ownerUsername = ref('');

watch(
	uid,
	async (newUid) => {
		if (newUid) {
			[, ownerUsername.value] = await Promise.all([loadPublic(newUid), fetchUsername(newUid)]);
		} else {
			publicEntries.value = [];
			ownerUsername.value = '';
		}
	},
	{immediate: true},
);

const activeFilters = computed<FilterState>(() => filters.value);

const sourceEntries = computed<Entry[]>(() => (isReadonly.value ? publicEntries.value : entries.value));

// --- search + sort ---
const search = ref('');
const sort = ref('預設');

// --- status segmented (synced to route.query.tab) ---
const statusTab = computed<EntryStatus | '全部'>({
	get: () => (route.query.tab as EntryStatus | undefined) ?? '全部',
	set: (val) =>
		router.replace({
			query: {...route.query, tab: val === '全部' ? undefined : val},
		}),
});

// Status counts (before status filter, after other filters)
const preStatusEntries = computed(() =>
	sourceEntries.value.filter((e) => {
		const f = activeFilters.value;
		if (f.category && e.category !== f.category) return false;
		if (f.country && e.country !== f.country) return false;
		if (search.value.trim()) {
			const q = search.value.trim().toLowerCase();
			return e.title.toLowerCase().includes(q) || (e.titleEn ?? '').toLowerCase().includes(q) || e.country.includes(q) || e.note.includes(q);
		}
		return true;
	}),
);

const statusCounts = computed(() => {
	const c: Record<string, number> = {
		全部: preStatusEntries.value.length,
		待看: 0,
		看中: 0,
		看完: 0,
	};
	preStatusEntries.value.forEach((e) => {
		c[e.status]++;
	});
	return c;
});

const displayEntries = computed(() => {
	let r = preStatusEntries.value.filter((e) => statusTab.value === '全部' || e.status === statusTab.value);
	if (sort.value === '最新') r = [...r].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
	if (sort.value === '評分') r = [...r].sort((a, b) => b.rating - a.rating || (b.year ?? 0) - (a.year ?? 0));
	if (sort.value === '名稱') r = [...r].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'));
	return r;
});

const isFiltered = computed(() => !!(activeFilters.value.category || activeFilters.value.country || search.value || statusTab.value !== '全部'));
const canDrag = computed(() => !isFiltered.value && !isReadonly.value && sort.value === '預設');

// Stats (whole library)
const stats = computed(() => ({
	total: sourceEntries.value.length,
	toWatch: sourceEntries.value.filter((e) => e.status === '待看').length,
	done: sourceEntries.value.filter((e) => e.status === '看完').length,
}));

// Category counts for filter chips
const categoryCounts = computed(() => {
	const c: Record<string, number> = {全部: sourceEntries.value.length};
	sourceEntries.value.forEach((e) => {
		c[e.category] = (c[e.category] ?? 0) + 1;
	});
	return c;
});

// --- pagination ---
const PAGE_SIZE = 20;
const currentPage = ref(1);
const pageStart = computed(() => (currentPage.value - 1) * PAGE_SIZE);
const totalPages = computed(() =>
	Math.ceil((canDrag.value ? entries.value.length : displayEntries.value.length) / PAGE_SIZE),
);
const pagedDragEntries = computed({
	get: () => entries.value.slice(pageStart.value, pageStart.value + PAGE_SIZE),
	set: (reordered) => {
		const full = [...entries.value];
		full.splice(pageStart.value, reordered.length, ...reordered);
		entries.value = full;
	},
});
const pagedEntries = computed(() => displayEntries.value.slice(pageStart.value, pageStart.value + PAGE_SIZE));

watch([statusTab, search, sort, () => activeFilters.value.category, () => activeFilters.value.country], () => {
	currentPage.value = 1;
});

const showAddForm = ref(false);
const urlCopied = ref(false);
const searchOpen = ref(false);
const searchInputEl = ref<HTMLInputElement | null>(null);

async function openSearch() {
	searchOpen.value = true;
	await nextTick();
	searchInputEl.value?.focus();
}

function closeSearch() {
	search.value = '';
	searchOpen.value = false;
}

function handleAdd(data: Omit<Entry, 'id' | 'addedAt'>) {
	add(data);
	showAddForm.value = false;
}

async function copyUrl() {
	if (!user.value) return;
	const {copy} = useShare();
	await copy(user.value.id);
	urlCopied.value = true;
	setTimeout(() => {
		urlCopied.value = false;
	}, 2000);
}
</script>

<template>
	<!-- Readonly banner -->
	<div v-if="isReadonly" class="mb-4 flex flex-col gap-2">
		<div
			class="rounded-md px-4 py-2 text-center text-sm"
			style="background: rgba(176, 71, 60, 0.08); color: var(--accent); border: 1px solid rgba(176, 71, 60, 0.2)">
			<Icon class="mr-1 inline h-4 w-4" icon="mdi:eye-outline" />
			{{ ownerUsername ? `這是「${ownerUsername}」的片單（唯讀）` : '這是分享的唯讀片單' }}
		</div>
		<button v-if="user" class="chip self-start text-xs" type="button" @click="router.push('/watchlist')">
			<Icon class="mr-1 h-3.5 w-3.5" icon="mdi:arrow-left" />
			返回我的片單
		</button>
	</div>

	<!-- Page header -->
	<AppPageHeader
		title="The Reel List"
		title-cn="片單"
		:kicker="isReadonly ? (ownerUsername ? `${ownerUsername} 的放映室` : '分享片單') : username ? `${username} 的放映室` : '私人放映室'">
		<p class="pg-sub">蒐藏 {{ stats.total }} 部 · 已看完 {{ stats.done }} 部 · 還有 {{ stats.toWatch }} 部待看</p>
	</AppPageHeader>

	<!-- Stat row -->
	<StatRow :done="stats.done" :to-watch="stats.toWatch" :total="stats.total" />

	<!-- Add + Search + Share toolbar -->
	<div v-if="!isReadonly" class="my-4 flex items-center justify-between gap-3">
		<button class="add-btn" @click="showAddForm = true" style="width: auto; padding: 10px 20px; flex: none" type="button">
			<Icon class="h-4 w-4" icon="mdi:plus" />
			新增影片
		</button>

		<div class="flex items-center gap-5">
			<!-- Search: collapsed icon ↔ expanded input -->
			<Transition name="fade" mode="out-in">
				<button
					v-if="!searchOpen"
					key="icon"
					type="button"
					class="chip flex items-center"
					style="padding-bottom: 4px"
					@click="openSearch"
				>
					<Icon icon="mdi:magnify" class="h-4 w-4" />
				</button>
				<div
					v-else
					key="input"
					class="field"
					style="height: 34px; padding: 0 12px; gap: 7px; min-width: 168px"
				>
					<Icon icon="mdi:magnify" class="h-[15px] w-[15px] flex-none" style="color: var(--ink-faint)" />
					<input
						ref="searchInputEl"
						:value="search"
						placeholder="搜尋片名、備註…"
						@input="search = ($event.target as HTMLInputElement).value"
					/>
					<button type="button" style="color: var(--ink-faint)" @click="closeSearch">
						<Icon icon="mdi:close" class="h-4 w-4" />
					</button>
				</div>
			</Transition>

			<!-- Share -->
			<button class="chip" @click="copyUrl" style="font-size: 12px; padding-bottom: 4px" type="button">
				<Icon :icon="urlCopied ? 'mdi:check' : 'mdi:share-variant-outline'" class="mr-0.5 h-3.5 w-3.5" />
				{{ urlCopied ? '已複製' : '分享連結' }}
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="mt-3">
		<FilterBar
			:counts="categoryCounts"
			:disabled="isReadonly"
			:filters="activeFilters"
			:search="search"
			:show-search="isReadonly"
			:show-sort="true"
			:sort="sort"
			@update:filters="updateFilters"
			@update:search="search = $event"
			@update:sort="sort = $event" />
	</div>

	<!-- Status segmented tabs -->
	<div class="mt-3">
		<SegmentedControl v-model="statusTab" :counts="statusCounts" :options="['全部', ...STATUSES]" />
	</div>

	<!-- Results bar -->
	<div class="resbar">─── {{ displayEntries.length }} 部結果 ───</div>

	<!-- Hint when drag is suspended -->
	<p v-if="!canDrag && !isReadonly" class="mb-2 font-sans text-[10px] tracking-[.12em] text-ink-faint">
		{{ isFiltered ? '篩選中，拖曳排序已暫停' : '排序中，拖曳排序已暫停' }}
	</p>

	<Transition mode="out-in" name="fade">
		<div :key="`${statusTab}-${activeFilters.category}-${activeFilters.country}-${sort}`">
			<!-- Empty state -->
			<EmptyState v-if="displayEntries.length === 0" hint="調整篩選或清除搜尋" message="沒有符合的影片" />

			<!-- Draggable list (only when sort=最新 and no filters) -->
			<VueDraggable v-else-if="canDrag" v-model="pagedDragEntries" :animation="200" class="flex flex-col" handle=".drag-handle" @end="syncOrder">
				<EntryCard v-for="(entry, idx) in pagedDragEntries" :entry="entry" :key="entry.id" :rank="pageStart + idx + 1" @remove="remove" @update="update" />
			</VueDraggable>

			<!-- Static list (sorted / filtered / readonly) -->
			<div v-else class="flex flex-col">
				<EntryCard
					v-for="(entry, idx) in pagedEntries"
					:entry="entry"
					:key="entry.id"
					:rank="pageStart + idx + 1"
					:readonly="isReadonly"
					:sortable="false"
					@remove="remove"
					@update="update" />
			</div>

			<!-- Pagination -->
			<Pagination
				v-if="totalPages > 1"
				:page="currentPage"
				:total="totalPages"
				@update:page="currentPage = $event"
			/>
		</div>
	</Transition>

	<!-- Add form sheet -->
	<Teleport to="body">
		<Transition name="sheet">
			<AddEntryForm v-if="showAddForm && !isReadonly" @add="handleAdd" @cancel="showAddForm = false" default-status="待看" />
		</Transition>
	</Teleport>
</template>
