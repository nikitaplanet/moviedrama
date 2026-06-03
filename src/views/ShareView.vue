<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Icon} from '@iconify/vue';
import dayjs from 'dayjs';
import {useEntryShare} from '../composables/useEntryShare';
import {useAuth} from '../composables/useAuth';
import {useWatchlist} from '../composables/useWatchlist';
import type {EntryShare} from '../composables/useEntryShare';
import {getFlag, STATUS_META} from '../types';

const formatDate = (iso: string) => dayjs(iso).format('YYYY.MM.DD');

const route = useRoute();
const router = useRouter();
const {fetchShare} = useEntryShare();
const {user, loading: authLoading} = useAuth();
const {add} = useWatchlist();

const share = ref<EntryShare | null>(null);
const loading = ref(true);
const notFound = ref(false);
const added = ref(false);

onMounted(async () => {
	try {
		const data = await fetchShare(route.params.token as string);
		if (!data) notFound.value = true;
		else share.value = data;
	} finally {
		loading.value = false;
	}
});

function handleAdd() {
	if (!user.value || !share.value) return;
	const e = share.value.entry_data;
	add({
		title: e.title,
		titleEn: e.titleEn,
		category: e.category,
		country: e.country ?? '',
		year: e.year,
		rating: 0,
		note: e.note ?? '',
		status: '待看',
		recommendedBy: share.value.from_username || undefined,
		recommendedNote: share.value.message || undefined,
	});
	added.value = true;
}
</script>

<template>
	<div class="flex min-h-dvh flex-col items-center justify-center px-6 py-12" style="background: var(--paper)">
		<!-- Loading -->
		<div v-if="loading || authLoading" class="flex flex-col items-center gap-3">
			<Icon class="h-8 w-8 animate-spin" icon="mdi:loading" style="color: var(--accent)" />
		</div>

		<!-- Not found -->
		<div v-else-if="notFound" class="text-center">
			<p class="text-2xl">🎬</p>
			<p class="mt-2 font-medium" style="color: var(--ink)">找不到這個分享連結</p>
			<p class="mt-1 text-sm" style="color: var(--muted)">連結可能已失效或輸入有誤</p>
			<button class="chip mt-6" @click="router.push('/')" style="padding-bottom: 4px">回到首頁</button>
		</div>

		<!-- Share content -->
		<div v-else-if="share" class="w-full max-w-sm">
			<!-- Sender info -->
			<div class="mb-6 text-center">
				<p class="kicker mb-1">FILMVERSE</p>
				<div class="mt-3 flex items-center justify-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
						style="background: var(--card); border: 1px solid var(--line); color: var(--ink)">
						<Icon class="h-4 w-4" icon="mdi:account-circle-outline" />
						{{ share.from_username || '某位用戶' }}
					</span>
					<span class="text-sm" style="color: var(--muted)">推薦了一部{{ share.source === 'ranking' ? '排行影片' : '影片' }}</span>
				</div>
			</div>

			<!-- Message -->
			<div
				v-if="share.message"
				class="mb-4 rounded-2xl px-5 py-4"
				style="background: rgba(176, 71, 60, 0.06); border: 1px solid rgba(176, 71, 60, 0.15)">
				<p class="mb-1.5 text-[11px] tracking-widest" style="color: var(--accent)">留言</p>
				<p class="text-sm leading-relaxed" style="color: var(--ink)">"{{ share.message }}"</p>
			</div>

			<!-- Entry card -->
			<div class="ticket">
				<img
					v-if="share.entry_data.posterUrl"
					:alt="share.entry_data.title"
					:data-src="share.entry_data.posterUrl"
					class="lazyload ml-3 w-20 flex-none self-center rounded object-cover" />
				<div :style="share.entry_data.posterUrl ? 'padding-left:12px' : 'padding-left:18px'" class="body">
					<div class="toprow">
						<span class="catpill">{{ share.entry_data.category }}</span>
						<span class="ctry">
							<span class="fl">{{ getFlag(share.entry_data.country ?? '') }}</span>
							{{ share.entry_data.country || '— —' }}
						</span>
					</div>
					<h3>{{ share.entry_data.title }}</h3>
					<div v-if="share.entry_data.titleEn || share.entry_data.releaseDate" class="ensub">
						{{
							[share.entry_data.titleEn, share.entry_data.releaseDate ? formatDate(share.entry_data.releaseDate) : null]
								.filter(Boolean)
								.join(' · ')
						}}
					</div>
					<div class="midrow">
						<span class="statuschip">
							<i :style="{background: STATUS_META[share.entry_data.status].dot}" />
							{{ share.entry_data.status }}
						</span>
					</div>
					<p v-if="share.entry_data.note" class="note">{{ share.entry_data.note }}</p>
					<div v-if="share.entry_data.status === '即將上映'" class="mt-1 flex items-center justify-end">
						<span
							class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[9px] font-semibold tracking-[.12em]"
							style="background: rgba(123, 94, 167, 0.12); color: #7b5ea7; border: 1px solid rgba(123, 94, 167, 0.25)">
							<Icon class="h-2.5 w-2.5" icon="mdi:clock-outline" />
							即將上映
						</span>
					</div>
				</div>
			</div>

			<!-- Action -->
			<div class="mt-6">
				<!-- Added success -->
				<div v-if="added" class="flex flex-col items-center gap-2 text-center">
					<span class="text-2xl">✅</span>
					<p class="font-medium" style="color: var(--ink)">已加入你的待看清單！</p>
					<button
						class="mt-2 text-sm font-medium tracking-wider underline underline-offset-2"
						@click="router.push('/watchlist')"
						style="padding-bottom: 4px">
						前往片單查看
					</button>
				</div>

				<!-- Logged in: add button -->
				<button v-else-if="user" class="add-btn w-full" @click="handleAdd" type="button">
					<Icon class="mr-1 inline h-4 w-4" icon="mdi:bookmark-plus-outline" />
					加入我的待看清單
				</button>

				<!-- Not logged in -->
				<div v-else class="flex flex-col items-center gap-3 text-center">
					<p class="text-sm" style="color: var(--muted)">登入後即可加入你的待看清單</p>
					<button
						class="add-btn"
						@click="router.push({name: 'login', query: {redirect: route.fullPath}})"
						style="width: auto; padding: 10px 24px"
						type="button">
						登入 / 註冊
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
