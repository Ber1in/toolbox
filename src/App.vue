<script setup lang="ts">
import { computed, nextTick, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppNav from './components/AppNav.vue'
import { useTheme } from './composables/useTheme'
import { useI18n } from './i18n'

const { theme, toggleTheme } = useTheme()
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const view = computed<'all' | 'favorites'>(() =>
  route.query.view === 'favorites' ? 'favorites' : 'all',
)

watchEffect(() => {
  document.title = locale.value === 'zh' ? '开发者工具箱 · 工具盒 Toolbox' : 'Toolbox · Developer Utilities'
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      'content',
      t('开发者工具箱：编码、格式化、时间、网络、文本、图像、离线生成 7 大类 40+ 实用工具，无需登录，打开即用。'),
    )
})

async function onNavigate(target: 'all' | 'favorites' | 'about') {
  if (target === 'about') {
    if (route.path !== '/') {
      await router.push('/')
      await nextTick()
    }
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  await router.push(
    target === 'favorites' ? { path: '/', query: { view: 'favorites' } } : { path: '/' },
  )
  await nextTick()
  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="app">
    <AppNav
      :theme="theme"
      :view="view"
      @toggle-theme="toggleTheme"
      @navigate="onNavigate"
    />

    <RouterView />

    <AppFooter />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  background: var(--color-bg);
}
</style>
