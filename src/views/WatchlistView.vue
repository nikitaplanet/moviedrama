<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { VueDraggable } from "vue-draggable-plus";
import { Icon } from "@iconify/vue";
import type { Entry, EntryStatus, FilterState, ShareData } from "../types";
import { STATUSES } from "../types";
import { useWatchlist } from "../composables/useWatchlist";
import { useShare } from "../composables/useShare";
import { useFilters } from "../composables/useFilters";
import EntryCard from "../components/molecules/EntryCard.vue";
import AddEntryForm from "../components/molecules/AddEntryForm.vue";
import FilterBar from "../components/molecules/FilterBar.vue";
import SegmentedControl from "../components/molecules/SegmentedControl.vue";
import StatRow from "../components/molecules/StatRow.vue";
import EmptyState from "../components/organisms/EmptyState.vue";
import AppPageHeader from "../components/organisms/AppPageHeader.vue";

const route = useRoute();
const { decode } = useShare();
const { entries, add, remove, update } = useWatchlist();
const { filters, isReadonly, updateFilters } = useFilters();

const sharedData = computed<ShareData | null>(() =>
  isReadonly.value ? decode(route.query.data as string) : null
);

const activeFilters = computed<FilterState>(() =>
  isReadonly.value
    ? sharedData.value?.filters ?? { category: "", country: "", status: "" }
    : filters.value
);

const sourceEntries = computed<Entry[]>(() =>
  isReadonly.value ? sharedData.value?.entries ?? [] : entries.value
);

// --- search + sort ---
const search = ref("");
const sort = ref("最新");

// --- status segmented ---
const statusTab = ref<EntryStatus | "全部">("全部");

// Status counts (before status filter, after other filters)
const preStatusEntries = computed(() =>
  sourceEntries.value.filter((e) => {
    const f = activeFilters.value;
    if (f.category && e.category !== f.category) return false;
    if (f.country && e.country !== f.country) return false;
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.titleEn ?? "").toLowerCase().includes(q) ||
        e.country.includes(q) ||
        e.note.includes(q)
      );
    }
    return true;
  })
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
  let r = preStatusEntries.value.filter(
    (e) => statusTab.value === "全部" || e.status === statusTab.value
  );
  if (sort.value === "最新") r = [...r].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  if (sort.value === "評分")
    r = [...r].sort((a, b) => b.rating - a.rating || (b.year ?? 0) - (a.year ?? 0));
  if (sort.value === "名稱")
    r = [...r].sort((a, b) => a.title.localeCompare(b.title, "zh-Hant"));
  return r;
});

const isFiltered = computed(
  () =>
    !!(
      activeFilters.value.category ||
      activeFilters.value.country ||
      search.value ||
      statusTab.value !== "全部"
    )
);

// Stats (whole library)
const stats = computed(() => ({
  total: sourceEntries.value.length,
  toWatch: sourceEntries.value.filter((e) => e.status === "待看").length,
  done: sourceEntries.value.filter((e) => e.status === "看完").length,
}));

// Category counts for filter chips
const categoryCounts = computed(() => {
  const c: Record<string, number> = { 全部: sourceEntries.value.length };
  sourceEntries.value.forEach((e) => {
    c[e.category] = (c[e.category] ?? 0) + 1;
  });
  return c;
});

const shareData = computed<ShareData>(() => ({
  tab: "watchlist",
  entries: entries.value,
  filters: filters.value,
}));

const showAddForm = ref(false);
const urlCopied = ref(false);

function handleAdd(data: Omit<Entry, "id" | "addedAt">) {
  add(data);
  showAddForm.value = false;
}

async function copyUrl() {
  const { copy } = useShare();
  await copy(shareData.value);
  urlCopied.value = true;
  setTimeout(() => {
    urlCopied.value = false;
  }, 2000);
}
</script>

<template>
  <!-- Readonly banner -->
  <div
    v-if="isReadonly"
    class="mb-4 rounded-md px-4 py-2 text-center text-sm"
    style="
      background: rgba(176, 71, 60, 0.08);
      color: var(--accent);
      border: 1px solid rgba(176, 71, 60, 0.2);
    "
  >
    <Icon icon="mdi:eye-outline" class="mr-1 inline h-4 w-4" />
    這是分享的唯讀片單
  </div>

  <!-- Page header -->
  <AppPageHeader
    kicker="Personal Cinema · 私人放映室"
    title="The Reel List"
    title-cn="片單"
  >
    <p class="pg-sub">
      蒐藏 {{ stats.total }} 部 · 已看完 {{ stats.done }} 部 · 還有
      {{ stats.toWatch }} 部待看
    </p>
  </AppPageHeader>

  <!-- Stat row -->
  <StatRow :total="stats.total" :to-watch="stats.toWatch" :done="stats.done" />

  <!-- Add + Share toolbar -->
  <div v-if="!isReadonly" class="mb-1 mt-3 flex items-center gap-3">
    <button
      class="add-btn"
      style="width: auto; padding: 10px 20px; flex: none"
      type="button"
      @click="showAddForm = true"
    >
      <Icon icon="mdi:plus" class="h-4 w-4" />
      新增影片
    </button>
    <button
      class="chip"
      style="font-size: 12px; padding-bottom: 4px"
      type="button"
      @click="copyUrl"
    >
      <Icon
        :icon="urlCopied ? 'mdi:check' : 'mdi:share-variant-outline'"
        class="mr-0.5 h-3.5 w-3.5"
      />
      {{ urlCopied ? "已複製" : "分享連結" }}
    </button>
  </div>

  <!-- Filters -->
  <div class="mt-3">
    <FilterBar
      :filters="activeFilters"
      :counts="categoryCounts"
      :disabled="isReadonly"
      :show-search="true"
      :search="search"
      :show-sort="true"
      :sort="sort"
      @update:filters="updateFilters"
      @update:search="search = $event"
      @update:sort="sort = $event"
    />
  </div>

  <!-- Status segmented tabs -->
  <div class="mt-3">
    <SegmentedControl
      v-model="statusTab"
      :options="['全部', ...STATUSES]"
      :counts="statusCounts"
    />
  </div>

  <!-- Results bar -->
  <div class="resbar">─── {{ displayEntries.length }} 部結果 ───</div>

  <!-- Hint when filtered -->
  <p
    v-if="isFiltered && !isReadonly"
    class="text-ink-faint mb-2 font-sans text-[10px] tracking-[.12em]"
  >
    篩選中，拖曳排序已暫停
  </p>

  <!-- Empty state -->
  <EmptyState
    v-if="displayEntries.length === 0"
    message="沒有符合的影片"
    hint="調整篩選或清除搜尋"
  />

  <!-- Draggable list -->
  <VueDraggable
    v-else-if="!isFiltered && !isReadonly"
    v-model="entries"
    :animation="200"
    handle=".drag-handle"
    class="flex flex-col"
  >
    <EntryCard
      v-for="(entry, idx) in entries"
      :key="entry.id"
      :entry="entry"
      :rank="idx + 1"
      @remove="remove"
      @update="update"
    />
  </VueDraggable>

  <!-- Static list (filtered / readonly) -->
  <div v-else class="flex flex-col">
    <EntryCard
      v-for="(entry, idx) in displayEntries"
      :key="entry.id"
      :entry="entry"
      :rank="idx + 1"
      :readonly="isReadonly"
      @remove="remove"
      @update="update"
    />
  </div>

  <!-- Add form sheet -->
  <Teleport to="body">
    <AddEntryForm
      v-if="showAddForm && !isReadonly"
      default-status="待看"
      @add="handleAdd"
      @cancel="showAddForm = false"
    />
  </Teleport>
</template>
