<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppNav from './components/AppNav.vue'
import { useTheme } from './composables/useTheme'

const { theme, toggleTheme } = useTheme()
const route = useRoute()
const router = useRouter()

const view = computed<'all' | 'favorites'>(() =>
  route.query.view === 'favorites' ? 'favorites' : 'all',
)

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
  max-width: var(--layout-max);
  margin: 0 auto;
  background: var(--color-bg);
}
</style>
