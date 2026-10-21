<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Star } from 'lucide-vue-next'
import { useFavorites } from '../composables/useFavorites'
import { findTool } from '../tools/registry'

const props = defineProps<{ id: string }>()

const { isFavorite, toggleFavorite } = useFavorites()

const entry = computed(() => findTool(props.id))
</script>

<template>
  <main v-if="entry" class="tool-page" :class="`cat-${entry.category}`">
    <div class="tool-page__inner">
      <RouterLink class="tool-back" to="/">
        <ArrowLeft :size="16" :stroke-width="2" />
        全部工具
      </RouterLink>

      <header class="tool-head">
        <span class="tool-head__icon">
          <component :is="entry.icon" :size="24" :stroke-width="2" aria-hidden="true" />
        </span>

        <div class="tool-head__text">
          <h1 class="tool-head__title">{{ entry.name }}</h1>
          <p class="tool-head__desc">{{ entry.description }}</p>
        </div>

        <button
          class="tool-head__fav"
          :class="{ 'is-on': isFavorite(entry.id) }"
          type="button"
          :aria-label="isFavorite(entry.id) ? `取消收藏 ${entry.name}` : `收藏 ${entry.name}`"
          :aria-pressed="isFavorite(entry.id)"
          @click="toggleFavorite(entry.id)"
        >
          <Star
            :size="18"
            :stroke-width="2"
            :fill="isFavorite(entry.id) ? 'currentColor' : 'none'"
          />
        </button>
      </header>

      <component :is="entry.component" />
    </div>
  </main>

  <main v-else class="tool-page">
    <div class="tool-page__inner">
      <RouterLink class="tool-back" to="/">
        <ArrowLeft :size="16" :stroke-width="2" />
        全部工具
      </RouterLink>
      <div class="panel">
        <p class="panel__title">工具不存在</p>
        <p class="panel__hint">这个工具可能已经改名或下线，回到首页看看其它工具吧。</p>
      </div>
    </div>
  </main>
</template>
