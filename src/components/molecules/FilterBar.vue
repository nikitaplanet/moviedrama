<script lang="ts" setup>
import {computed} from 'vue';
import {Icon} from '@iconify/vue';
import type {EntryCategory, FilterState} from '../../types';
import {CATEGORIES, PRESET_COUNTRIES} from '../../types';

const props = defineProps<{
	filters: FilterState;
	counts?: Record<string, number>;
	disabled?: boolean;
	showSearch?: boolean;
	search?: string;
	showSort?: boolean;
	sort?: string;
}>();
const emit = defineEmits<{
	'update:filters': [f: FilterState];
	'update:search': [s: string];
	'update:sort': [s: string];
}>();

const SORT_OPTIONS = ['預設', '最新', '評分', '名稱'];
const hasActive = computed(() => !!(props.filters.category || props.filters.country));

function setCategory(c: EntryCategory | '') {
	if (!props.disabled) emit('update:filters', {...props.filters, category: c});
}
function setCountry(e: Event) {
	if (!props.disabled) emit('update:filters', {...props.filters, country: (e.target as HTMLSelectElement).value});
}
function setSort(e: Event) {
	emit('update:sort', (e.target as HTMLSelectElement).value);
}
</script>

<template>
	<!-- Search field -->
	<div v-if="showSearch" class="field mb-3">
		<Icon :size="17" icon="mdi:magnify" />
		<input :value="search" @input="emit('update:search', ($event.target as HTMLInputElement).value)" placeholder="搜尋片名、國家、備註…" />
		<button v-if="search" @click="emit('update:search', '')" style="color: var(--ink-faint)" type="button">
			<Icon class="h-4 w-4" icon="mdi:close" />
		</button>
	</div>

	<!-- Category chips -->
	<div class="chiprow mt-6 mb-4">
		<button :class="['chip', !filters.category && 'on']" @click="setCategory('')" type="button">
			全部<span class="cc">{{ counts?.['全部'] ?? '' }}</span>
		</button>
		<button v-for="cat in CATEGORIES" :key="cat" :class="['chip', filters.category === cat && 'on']" @click="setCategory(cat)" type="button">
			{{ cat }}<span class="cc">{{ counts?.[cat] ?? '' }}</span>
		</button>
	</div>

	<!-- Country + Sort dropdowns -->
	<div class="mt-2.5 grid grid-cols-2 gap-2.5">
		<div class="field sel">
			<span class="flex-none font-sans text-[10px] tracking-[.14em] text-ink-faint">地區</span>
			<select :disabled="disabled" :value="filters.country" @change="setCountry">
				<option value="">所有國家</option>
				<option v-for="c in PRESET_COUNTRIES" :key="c" :value="c">{{ c }}</option>
			</select>
		</div>
		<div v-if="showSort" class="field sel">
			<span class="flex-none font-sans text-[10px] tracking-[.14em] text-ink-faint">排序</span>
			<select :value="sort" @change="setSort">
				<option v-for="s in SORT_OPTIONS" :key="s" :value="s">{{ s }}</option>
			</select>
		</div>
	</div>

	<!-- Clear filters -->
	<button
		v-if="hasActive && !disabled"
		class="chip mt-1"
		@click="emit('update:filters', {category: '', country: '', status: filters.status})"
		style="font-size: 11px; color: var(--accent); margin-top: 20px"
		type="button">
		<Icon class="mr-0.5 h-3 w-3" icon="mdi:close" />清除篩選
	</button>
</template>
