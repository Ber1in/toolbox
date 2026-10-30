<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useI18n } from '../../../i18n'
import type { TocNode } from '../../../utils/markdown/types'

const props = defineProps<{
  toc: TocNode[]
  activeId: string
  drawer?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  close: []
}>()

const { t } = useI18n()
const listRef = ref<HTMLUListElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let previousFocus: HTMLElement | null = null

function onFocusOut(event: FocusEvent) {
  if (!props.drawer) return

  const next = event.relatedTarget as Node | null
  if (next && navRef.value?.contains(next)) return

  void nextTick().then(() => {
    if (props.drawer) {
      closeButton.value?.focus()
    }
  })
}

function onKeydown(event: KeyboardEvent) {
  if (!props.drawer) return

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab') return

  const focusable = navRef.value?.querySelectorAll<HTMLElement>('button, a[href]')
  if (!focusable || focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  if (!props.drawer) return
  previousFocus = document.activeElement as HTMLElement | null
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  if (!props.drawer) return
  previousFocus?.focus()
})

const items = computed(() => {
  const flattened: TocNode[] = []
  const walk = (nodes: TocNode[]) => {
    for (const node of nodes) {
      flattened.push(node)
      walk(node.children)
    }
  }
  walk(props.toc)
  return flattened
})

function select(id: string) {
  emit('select', id)
}

watch(
  () => props.activeId,
  async (id) => {
    if (!id) return
    await nextTick()

    const links = listRef.value?.querySelectorAll<HTMLElement>('[data-toc-id]')
    links?.forEach((link) => {
      if (link.dataset.tocId === id) {
        link.scrollIntoView({ block: 'nearest' })
      }
    })
  },
)
</script>

<template>
  <nav
    ref="navRef"
    class="md-toc"
    :class="{ 'md-toc--drawer': drawer }"
    :data-md-chrome="drawer ? 'toc-drawer' : undefined"
    :role="drawer ? 'dialog' : undefined"
    :aria-modal="drawer ? 'true' : undefined"
    :aria-label="t('目录导航')"
    @keydown="onKeydown"
    @focusout="onFocusOut"
  >
    <div class="md-toc__header">
      <span class="md-toc__title">{{ t('目录') }}</span>
      <button
        ref="closeButton"
        class="md-toc__close"
        type="button"
        :aria-label="t('关闭目录')"
        @click="emit('close')"
      >
        <X :size="16" :stroke-width="2" />
      </button>
    </div>

    <ul v-if="items.length" ref="listRef" class="md-toc__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="md-toc__item"
        :class="`md-toc__item--level-${item.level}`"
      >
        <a
          class="md-toc__link"
          :class="{ 'is-active': item.id === activeId }"
          :href="`#${item.id}`"
          :data-toc-id="item.id"
          :title="item.text"
          :aria-current="item.id === activeId ? 'location' : undefined"
          @click.prevent="select(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>

    <p v-else class="md-toc__empty">{{ t('没有可显示的标题') }}</p>
  </nav>
</template>
