<script setup lang="ts">
import ToolCard from './ToolCard.vue'
import type { Tool, ToolCategory } from '../data/toolbox'
import { useI18n } from '../i18n'

const { t } = useI18n()

defineProps<{
  category: ToolCategory
  tools: Tool[]
  favorites: string[]
}>()

const emit = defineEmits<{ (e: 'toggle-favorite', id: string): void }>()
</script>

<template>
  <section
    :id="`category-${category.key}`"
    class="section"
    :class="`cat-${category.key}`"
    :aria-labelledby="`heading-${category.key}`"
  >
    <h2 :id="`heading-${category.key}`" class="section__title">
      {{ t(category.label) }}
    </h2>

    <div class="grid">
      <ToolCard
        v-for="tool in tools"
        :key="tool.id"
        :tool="tool"
        :favorite="favorites.includes(tool.id)"
        @toggle-favorite="emit('toggle-favorite', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: var(--content-gap);
  scroll-margin-top: 24px;
}

.section__title {
  font-size: var(--fs-section-title);
  line-height: var(--lh-section-title);
  font-weight: var(--fw-bold);
  color: var(--color-ink);
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--grid-gap);
}

</style>
