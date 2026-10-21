<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useI18n } from '../i18n'

const { t } = useI18n()

const search = defineModel<string>({ required: true })
const inputRef = ref<HTMLInputElement | null>(null)

function focusSearch() {
  inputRef.value?.focus()
  inputRef.value?.select()
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    focusSearch()
  }

  if (event.key === 'Escape' && document.activeElement === inputRef.value) {
    search.value = ''
    inputRef.value?.blur()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="hero">
    <span class="hero__badge">
      <span class="hero__badge-dot" aria-hidden="true" />
      {{ t('免费 · 开源 · 本地运行') }}
    </span>

    <h1 class="hero__title">{{ t('开发者工具箱，一站搞定') }}</h1>

    <p class="hero__subtitle">
      {{ t('编码、格式化、时间、网络、文本、图像、离线生成 —— 7 大类 40+ 实用工具，无需登录，打开即用。') }}
    </p>

    <div class="search">
      <Search class="search__icon" :size="20" :stroke-width="2" aria-hidden="true" />
      <input
        ref="inputRef"
        v-model="search"
        class="search__input"
        type="search"
        :placeholder="t('搜索工具，如 Base64、时间戳、二维码…')"
        :aria-label="t('搜索工具')"
        autocomplete="off"
      />
      <kbd class="search__kbd">⌘ K</kbd>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: var(--hero-padding-top) var(--layout-padding-x) var(--hero-padding-bottom);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--hero-gap);
  background: var(--color-bg);
}

.hero__badge {
  height: 32px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--fs-badge);
  line-height: var(--lh-badge);
  font-weight: var(--fw-semibold);
  white-space: nowrap;
}

.hero__badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.hero__title {
  max-width: 900px;
  font-size: var(--fs-hero-title);
  line-height: var(--lh-hero-title);
  font-weight: var(--fw-bold);
  color: var(--color-ink);
  text-align: center;
  text-wrap: balance;
}

.hero__subtitle {
  max-width: 720px;
  font-size: var(--fs-subtitle);
  line-height: var(--lh-subtitle);
  font-weight: var(--fw-regular);
  color: var(--color-ink-muted);
  text-align: center;
}

.search {
  width: var(--search-width);
  max-width: 100%;
  height: var(--search-height);
  padding: 0 8px 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-search);
  background: var(--color-card);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.search__icon {
  flex: none;
  color: var(--color-ink-muted);
}

.search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  font-size: var(--fs-search);
  line-height: var(--lh-subtitle);
  color: var(--color-ink);
  outline: none;
  appearance: none;
}

.search__input::-webkit-search-cancel-button {
  display: none;
}

.search__kbd {
  flex: none;
  height: 32px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-chip);
  background: var(--color-chip);
  color: var(--color-ink-muted);
  font-family: inherit;
  font-size: var(--fs-badge);
  font-weight: var(--fw-medium);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .hero {
    padding: 56px 20px 48px;
    gap: 20px;
  }

  .hero__title {
    font-size: 40px;
  }

  .hero__subtitle {
    font-size: 17px;
    line-height: 28px;
  }
}

@media (max-width: 480px) {
  .search {
    padding-left: 16px;
  }

  .search__kbd {
    display: none;
  }
}
</style>
