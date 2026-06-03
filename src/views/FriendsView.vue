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
const {user, fetchUsername, fetchRecentProfiles} = useAuth();
const {friends, add, remove, parseUid} = useFriends();

const showAddForm = ref(false);
const urlInput = ref('');
const addError = ref('');
const adding = ref(false);
const suggestions = ref<Array<{id: string; username: string}>>([]);

async function openAdd() {
	urlInput.value = '';
	addError.value = '';
	showAddForm.value = true;
	suggestions.value = await fetchRecentProfiles(
		user.value?.id ?? '',
		friends.value.map((f) => f.friendUid),
	);
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

async function quickAdd(s: {id: string; username: string}) {
	await add(s.id, s.username);
	suggestions.value = suggestions.value.filter((u) => u.id !== s.id);
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
				<!-- Recent users suggestions -->
<!--				<div v-if="suggestions.length" class="mb-3">-->
<!--					<p class="mb-2 font-sans text-[9px] tracking-[.14em]" style="color: var(&#45;&#45;ink-faint)">最近加入的用戶</p>-->
<!--					<div class="flex flex-col gap-1.5">-->
<!--						<div-->
<!--							v-for="s in suggestions"-->
<!--							:key="s.id"-->
<!--							class="flex items-center justify-between rounded-lg px-3 py-2"-->
<!--							style="background: var(&#45;&#45;paper-2)">-->
<!--							<span class="flex items-center gap-1.5 text-sm" style="color: var(&#45;&#45;ink)">-->
<!--								<Icon class="h-3.5 w-3.5 flex-none" icon="mdi:account-circle-outline" style="color: var(&#45;&#45;ink-faint)" />-->
<!--								{{ s.username }}-->
<!--							</span>-->
<!--							<button class="flex items-center gap-1" type="button" @click="quickAdd(s)">-->
<!--								<Icon class="h-3.5 w-3.5" icon="mdi:account-plus-outline" />-->
<!--								<span class="font-sans text-[10px]">加入</span>-->
<!--							</button>-->
<!--						</div>-->
<!--					</div>-->
<!--					<div class="my-3" style="height: 1px; background: var(&#45;&#45;line)" />-->
<!--				</div>-->

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
			<article v-for="friend in friends" :key="friend.id" class="ticket px-4 flex justify-between">
				<!-- Top row: name · date -->
				<div>
					<button class="flex items-center gap-1.5 transition-opacity hover:opacity-70" type="button" @click="viewRanking(friend.friendUid)">
						<Icon class="h-3.5 w-3.5 flex-none" icon="mdi:account-circle-outline" style="color: var(--ink-faint)" />
						<span class="text-[15px] font-medium tracking-[.01em]" style="color: var(--ink)">{{ friend.friendName }}</span>
					</button>
					<span class="ensub">{{ dayjs(friend.createdAt).format('YYYY.MM.DD') }} 加為好友</span>
				</div>

				<!-- Actions row -->
				<div class="flex items-center gap-4">
					<button class="flex items-center gap-1" @click="viewWatchlist(friend.friendUid)" type="button">
						<Icon class="h-3.5 w-3.5" icon="mdi:format-list-bulleted" />
						<span class="font-sans text-[10px] tracking-wide">片單</span>
					</button>
					<button class="flex items-center gap-1" @click="viewRanking(friend.friendUid)" type="button">
						<Icon class="h-3.5 w-3.5" icon="mdi:trophy-outline" />
						<span class="font-sans text-[10px] tracking-wide">排行</span>
					</button>
					<button class="ml-auto" @click="remove(friend.id)" type="button">
						<Icon class="h-3.5 w-3.5" icon="mdi:delete-outline" />
					</button>
				</div>
			</article>
		</div>
	</div>
</template>
