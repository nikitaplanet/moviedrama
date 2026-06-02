<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();

function go(path: string, keepUid = true) {
	const uid = route.query.uid as string | undefined;
	router.push({path, query: keepUid && uid ? {uid} : undefined});
}
</script>

<template>
	<nav class="tabbar sticky bottom-0 z-40 w-full md:hidden">
		<button :class="route.path === '/watchlist' ? 'on' : ''" @click="go('/watchlist')" type="button">
			<span class="tn">片單</span>
			<span class="te">The List</span>
		</button>
		<button :class="route.path === '/ranking' ? 'on' : ''" @click="go('/ranking')" type="button">
			<span class="tn">排行</span>
			<span class="te">Ranking</span>
		</button>
		<button v-if="!route.query.uid" :class="route.path === '/friends' ? 'on' : ''" @click="go('/friends', false)" type="button">
			<span class="tn">好友</span>
			<span class="te">Friends</span>
		</button>
	</nav>
</template>
