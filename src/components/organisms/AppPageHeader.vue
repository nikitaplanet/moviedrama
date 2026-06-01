<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';

defineProps<{
	kicker: string;
	title: string;
	titleCn: string;
}>();

const route = useRoute();
const router = useRouter();

function go(path: string) {
	const uid = route.query.uid as string | undefined;
	router.push({path, query: uid ? {uid} : undefined});
}
</script>

<template>
	<div class="pg-head">
		<div class="pg-kick">
			<span class="kicker">{{ kicker }}</span>
		</div>
		<div class="pg-title-row">
			<h1 class="pg-title">{{ title }}</h1>
			<span class="pg-cn">{{ titleCn }}</span>
		</div>
		<slot />
		<nav class="desk-nav mt-6 hidden md:flex">
			<button :class="route.path === '/watchlist' ? 'on' : ''" @click="go('/watchlist')" type="button">
				<span class="tn">片單</span>
				<span class="te">The List</span>
			</button>
			<button :class="route.path === '/ranking' ? 'on' : ''" @click="go('/ranking')" type="button">
				<span class="tn">排行</span>
				<span class="te">Ranking</span>
			</button>
		</nav>
	</div>
</template>
