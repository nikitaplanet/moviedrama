<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Icon} from '@iconify/vue';
import dayjs from 'dayjs';
import {useFriends} from '../composables/useFriends';
import {useAuth} from '../composables/useAuth';
import AppPageHeader from '../components/organisms/AppPageHeader.vue';
import EmptyState from '../components/organisms/EmptyState.vue';

const router = useRouter();
const {fetchUsername} = useAuth();
const {friends, add, remove, parseUid} = useFriends();

const showAddForm = ref(false);
const urlInput = ref('');
const addError = ref('');
const adding = ref(false);

function openAdd() {
	urlInput.value = '';
	addError.value = '';
	showAddForm.value = true;
}

function cancelAdd() {
	showAddForm.value = false;
	addError.value = '';
}

async function submitAdd() {
	addError.value = '';
	const uid = parseUid(urlInput.value);
	if (!uid) {
		addError.value = '請貼上分享連結或有效的 UID';
		return;
	}
	if (friends.value.some((f) => f.friendUid === uid)) {
		addError.value = '已加過這位好友了';
		return;
	}
	adding.value = true;
	try {
		const name = await fetchUsername(uid);
		if (!name) {
			addError.value = '找不到這位用戶，請確認連結是否正確';
			return;
		}
		await add(uid, name);
		showAddForm.value = false;
	} finally {
		adding.value = false;
	}
}

function viewWatchlist(friendUid: string) {
	router.push({path: '/watchlist', query: {uid: friendUid}});
}

function viewRanking(friendUid: string) {
	router.push({path: '/ranking', query: {uid: friendUid}});
}
</script>

<template>
	<div>
		<AppPageHeader title="Friends" title-cn="好友" kicker="FILMVERSE · 好友片單" />

		<!-- Toolbar -->
		<div class="mb-4 mt-2 flex items-center justify-between">
			<button class="add-btn" @click="openAdd" style="width: auto; padding: 10px 20px; flex: none" type="button">
				<Icon class="h-4 w-4" icon="mdi:account-plus-outline" />
				新增好友
			</button>
		</div>

		<!-- Add form -->
		<Transition name="fade">
			<div v-if="showAddForm" class="mb-4 rounded-xl p-4" style="background: var(--card); border: 1px solid var(--line)">
				<p class="mb-3 font-sans text-xs tracking-widest" style="color: var(--ink-faint)">貼上對方的分享連結或 UID</p>
				<div class="field mb-2">
					<Icon class="h-4 w-4 flex-none" icon="mdi:link-variant" style="color: var(--ink-faint)" />
					<input v-model="urlInput" @keydown.enter="submitAdd" @keydown.esc="cancelAdd" placeholder="https://… 或 UUID" />
				</div>
				<p v-if="addError" class="mb-2 font-sans text-xs" style="color: var(--accent)">{{ addError }}</p>
				<div class="flex gap-2">
					<button :disabled="adding" class="add-btn" @click="submitAdd" style="flex: 1; padding: 8px 0" type="button">
						<Icon v-if="adding" class="h-4 w-4 animate-spin" icon="mdi:loading" />
						<span>{{ adding ? '查詢中…' : '新增' }}</span>
					</button>
					<button class="chip" @click="cancelAdd" style="flex: none; padding: 8px 16px" type="button">取消</button>
				</div>
			</div>
		</Transition>

		<!-- Friend list -->
		<EmptyState v-if="friends.length === 0" hint="貼上對方的分享連結來新增好友" message="還沒有好友" />

		<div v-else class="flex flex-col">
			<article v-for="friend in friends" :key="friend.id" class="ticket">
				<div class="body" style="padding-left: 18px">
					<!-- Top row: name · date -->
					<div class="toprow">
						<span class="flex items-center gap-1.5">
							<Icon class="h-3.5 w-3.5 flex-none" icon="mdi:account-circle-outline" style="color: var(--ink-faint)" />
							<span class="text-[15px] font-medium tracking-[.01em]" style="color: var(--ink)">{{ friend.friendName }}</span>
						</span>
						<span class="ensub">{{ dayjs(friend.createdAt).format('YYYY.MM.DD') }}</span>
					</div>

					<!-- Actions row -->
					<div class="midrow">
						<button class="rk-arrow flex items-center gap-1" @click="viewWatchlist(friend.friendUid)" type="button">
							<Icon class="h-3.5 w-3.5" icon="mdi:format-list-bulleted" />
							<span class="font-sans text-[10px] tracking-wide">片單</span>
						</button>
						<button class="rk-arrow flex items-center gap-1" @click="viewRanking(friend.friendUid)" type="button">
							<Icon class="h-3.5 w-3.5" icon="mdi:trophy-outline" />
							<span class="font-sans text-[10px] tracking-wide">排行</span>
						</button>
						<button class="rk-del ml-auto" @click="remove(friend.id)" type="button">
							<Icon class="h-3.5 w-3.5" icon="mdi:delete-outline" />
						</button>
					</div>
				</div>
			</article>
		</div>
	</div>
</template>
