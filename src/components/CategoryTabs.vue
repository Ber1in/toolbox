<script setup lang="ts">
import type { CategoryKey, ToolCategory } from '../data/toolbox'

defineProps<{
  categories: ToolCategory[]
  active: CategoryKey | null
}>()

const emit = defineEmits<{ (e: 'select', key: CategoryKey): void }>()
</script>

<template>
  <div class="tabs" role="tablist" aria-label="工具分类">
    <button
      v-for="category in categories"
      :key="category.key"
      class="tab"
      :class="{ 'is-active': category.key === active }"
      type="button"
      role="tab"
      :aria-selected="category.key === active"
      @click="emit('select', category.key)"
    >
      {{ category.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab {
  height: 44px;
  padding: 0 18px;
  /* 同卡片：用内阴影画 1px 描边，保证宽度与设计稿一致（96px 而非 98px） */
  box-shadow: inset 0 0 0 1px var(--color-border);
  border-radius: var(--radius-tab);
  background: var(--color-card);
  color: var(--color-ink);
  font-size: var(--fs-tab);
  line-height: var(--lh-nav);
  font-weight: var(--fw-medium);
  white-space: nowrap;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
}

.tab:hover {
  box-shadow: inset 0 0 0 1px var(--color-ink-subtle);
}

.tab.is-active {
  box-shadow: inset 0 0 0 1px var(--color-invert-bg);
  background: var(--color-invert-bg);
  color: var(--color-invert-fg);
  font-weight: var(--fw-semibold);
}
</style>
