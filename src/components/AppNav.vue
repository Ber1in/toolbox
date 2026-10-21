<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { repoUrl } from '../config'
import { localeOptions, setLocale, useI18n, type Locale } from '../i18n'
import LogoMark from './LogoMark.vue'

const { t, locale } = useI18n()

defineProps<{
  theme: 'light' | 'dark'
  view: 'all' | 'favorites'
}>()

const emit = defineEmits<{
  (e: 'toggle-theme'): void
  (e: 'navigate', target: 'all' | 'favorites' | 'about'): void
}>()

function onRepoClick(event: MouseEvent) {
  if (!repoUrl) event.preventDefault()
}

function onLocaleChange(event: Event) {
  setLocale((event.target as HTMLSelectElement).value as Locale)
}
</script>

<template>
  <header class="nav">
    <button class="nav__brand" type="button" @click="emit('navigate', 'all')">
      <span class="nav__logo">
        <LogoMark />
      </span>
      <span class="nav__title">{{ t('工具盒 Toolbox') }}</span>
    </button>

    <nav class="nav__links" :aria-label="t('主导航')">
      <button
        class="nav__link"
        :class="{ 'is-active': view === 'all' }"
        type="button"
        @click="emit('navigate', 'all')"
      >
        {{ t('全部工具') }}
      </button>
      <button
        class="nav__link"
        :class="{ 'is-active': view === 'favorites' }"
        type="button"
        @click="emit('navigate', 'favorites')"
      >
        {{ t('收藏') }}
      </button>
      <button class="nav__link" type="button" @click="emit('navigate', 'about')">
        {{ t('关于') }}
      </button>
    </nav>

    <div class="nav__actions">
      <label class="lang">
        <span class="sr-only">{{ t('语言') }}</span>
        <select class="lang__select" :value="locale" @change="onLocaleChange">
          <option v-for="option in localeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <button
        class="theme-toggle"
        type="button"
        :aria-label="t(theme === 'dark' ? '切换到浅色主题' : '切换到深色主题')"
        :aria-pressed="theme === 'dark'"
        @click="emit('toggle-theme')"
      >
        <Moon v-if="theme === 'dark'" :size="22" :stroke-width="2" />
        <Sun v-else :size="32" :stroke-width="2" />
      </button>

      <!-- 默认不指向任何外部地址；内网部署可通过 VITE_REPO_URL 配置仓库链接 -->
      <a
        class="github"
        :href="repoUrl || '#'"
        :target="repoUrl ? '_blank' : undefined"
        :rel="repoUrl ? 'noreferrer noopener' : undefined"
        :aria-disabled="repoUrl ? undefined : 'true'"
        :title="t(repoUrl ? '打开代码仓库' : '未配置代码仓库地址（VITE_REPO_URL）')"
        @click="onRepoClick"
      >
        GitHub
      </a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  height: var(--nav-height);
  padding: 0 var(--layout-padding-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg);
}

.nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav__logo {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-logo);
  background: var(--color-accent);
  color: var(--color-on-ink);
  display: grid;
  place-items: center;
}

.nav__title {
  font-size: var(--fs-logo);
  line-height: var(--lh-logo);
  font-weight: var(--fw-bold);
  color: var(--color-ink);
  white-space: nowrap;
}

.nav__links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav__link {
  font-size: var(--fs-nav);
  line-height: var(--lh-nav);
  font-weight: var(--fw-medium);
  color: var(--color-ink-muted);
  transition: color 0.15s ease;
}

.nav__link:hover {
  color: var(--color-ink);
}

.nav__link.is-active {
  color: var(--color-ink);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: var(--color-chip);
  color: var(--color-ink);
  display: grid;
  place-items: center;
  transition: background-color 0.15s ease;
}

.theme-toggle:hover {
  background: var(--color-border);
}

.lang {
  position: relative;
  display: inline-flex;
}

.lang__select {
  height: 40px;
  padding: 0 28px 0 12px;
  border-radius: var(--radius-button);
  background: var(--color-chip);
  color: var(--color-ink);
  font-size: 14px;
  font-weight: var(--fw-medium);
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 15px) 17px, calc(100% - 10px) 17px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  transition: background-color 0.15s ease;
}

.lang__select:hover {
  background-color: var(--color-border);
}

.lang__select:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.github {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-button);
  background: var(--color-invert-bg);
  color: var(--color-invert-fg);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .nav {
    padding: 0 20px;
  }

  .nav__links {
    display: none;
  }
}
</style>
