<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { Tool } from '../data/toolbox'

defineProps<{
  tool: Tool
  favorite: boolean
}>()

const emit = defineEmits<{ (e: 'toggle-favorite', id: string): void }>()
</script>

<template>
  <article class="card">
    <RouterLink class="card__link" :to="`/tool/${tool.id}`">
      <span class="card__icon">
        <component :is="tool.icon" :size="24" :stroke-width="2" aria-hidden="true" />
      </span>

      <h3 class="card__title">{{ tool.name }}</h3>
      <p class="card__desc">{{ tool.description }}</p>
    </RouterLink>

    <button
      class="card__star"
      :class="{ 'is-on': favorite }"
      type="button"
      :aria-label="favorite ? `取消收藏 ${tool.name}` : `收藏 ${tool.name}`"
      :aria-pressed="favorite"
      @click="emit('toggle-favorite', tool.id)"
    >
      <Star :size="16" :stroke-width="2" :fill="favorite ? 'currentColor' : 'none'" />
    </button>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  width: var(--card-width);
  min-height: var(--card-height);
  /* 用内阴影画描边：设计稿的 stroke 不占布局，用 border 会让卡片高 152 而不是 150 */
  box-shadow: inset 0 0 0 1px var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-card);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.card:hover {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-ink) 18%, var(--color-border));
  transform: translateY(-1px);
}

.card__link {
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: inherit;
}

.card__icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--radius-icon);
  background: var(--cat-bg);
  color: var(--cat-fg);
}

.card__title {
  font-size: var(--fs-card-title);
  line-height: var(--lh-card-title);
  font-weight: var(--fw-semibold);
  color: var(--color-ink);
}

.card__desc {
  font-size: var(--fs-card-desc);
  line-height: var(--lh-card-desc);
  font-weight: var(--fw-regular);
  color: var(--color-ink-muted);
}

/* 收藏按钮：设计稿无此控件，默认隐藏，hover / 键盘聚焦时才出现，避免改变卡片视觉 */
.card__star {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-chip);
  color: var(--color-ink-subtle);
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.card:hover .card__star,
.card:focus-within .card__star,
.card__star:focus-visible {
  opacity: 1;
}

.card__star:hover {
  background: var(--color-chip);
  color: var(--color-ink);
}

.card__star.is-on {
  opacity: 1;
  color: var(--color-accent);
}

@media (max-width: 860px) {
  .card {
    width: 100%;
    min-height: 0;
  }
}
</style>
