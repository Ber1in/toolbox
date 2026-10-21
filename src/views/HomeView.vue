<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoryTabs from '../components/CategoryTabs.vue'
import HeroSection from '../components/HeroSection.vue'
import ToolSection from '../components/ToolSection.vue'
import { useFavorites } from '../composables/useFavorites'
import { toolCategories, type CategoryKey, type Tool } from '../data/toolbox'
import { useI18n } from '../i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { favorites, toggleFavorite } = useFavorites()

const search = ref('')
const active = ref<CategoryKey | null>(toolCategories[0].key)

/** 视图由 URL 决定：/?view=favorites 即「收藏」 */
const view = computed<'all' | 'favorites'>(() =>
  route.query.view === 'favorites' ? 'favorites' : 'all',
)

const query = computed(() => search.value.trim().toLowerCase())

function matches(tool: Tool, categoryLabel: string) {
  if (view.value === 'favorites' && !favorites.value.includes(tool.id)) return false
  if (!query.value) return true

  return (
    t(tool.name).toLowerCase().includes(query.value) ||
    t(tool.description).toLowerCase().includes(query.value) ||
    t(categoryLabel).toLowerCase().includes(query.value)
  )
}

const visibleCategories = computed(() =>
  toolCategories
    .map((category) => ({
      category,
      tools: category.tools.filter((tool) => matches(tool, category.label)),
    }))
    .filter((entry) => entry.tools.length > 0),
)

const resultCount = computed(() =>
  visibleCategories.value.reduce((total, entry) => total + entry.tools.length, 0),
)

const emptyMessage = computed(() => {
  if (view.value === 'favorites') {
    return query.value
      ? t('收藏里没有匹配的工具，换个关键词试试。')
      : t('还没有收藏任何工具 —— 把鼠标移到工具卡上，点右上角星标即可收藏。')
  }
  return t('没有找到匹配的工具，换个关键词试试。')
})

function scrollToCategory(key: CategoryKey) {
  active.value = key
  document
    .getElementById(`category-${key}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function onSelectTab(key: CategoryKey) {
  if (view.value !== 'all') {
    await router.replace({ path: '/', query: {} })
    await nextTick()
  }
  scrollToCategory(key)
}

let frame = 0

function updateActive() {
  frame = 0
  if (view.value !== 'all' || query.value) return

  const offset = 140
  let current = visibleCategories.value[0]?.category.key ?? null

  for (const { category } of visibleCategories.value) {
    const element = document.getElementById(`category-${category.key}`)
    if (!element) continue
    if (element.getBoundingClientRect().top - offset <= 0) current = category.key
  }

  active.value = current
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(updateActive)
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <main>
    <HeroSection v-model="search" />

    <div id="tools" class="content">
      <CategoryTabs :categories="toolCategories" :active="active" @select="onSelectTab" />

      <p class="sr-only" role="status" aria-live="polite">{{ t('共 {n} 个工具', { n: resultCount }) }}</p>

      <ToolSection
        v-for="entry in visibleCategories"
        :key="entry.category.key"
        :category="entry.category"
        :tools="entry.tools"
        :favorites="favorites"
        @toggle-favorite="toggleFavorite"
      />

      <p v-if="!visibleCategories.length" class="empty">{{ emptyMessage }}</p>
    </div>
  </main>
</template>

<style scoped>
.content {
  padding: var(--content-padding-top) var(--layout-padding-x) var(--content-padding-bottom);
  display: flex;
  flex-direction: column;
  gap: var(--content-gap);
  background: var(--color-surface);
  scroll-margin-top: 24px;
}

.empty {
  padding: 48px 0;
  font-size: var(--fs-card-desc);
  line-height: var(--lh-card-desc);
  color: var(--color-ink-muted);
  text-align: center;
}

@media (max-width: 1080px) {
  .content {
    padding-left: 32px;
    padding-right: 32px;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 32px 20px 64px;
  }
}
</style>
