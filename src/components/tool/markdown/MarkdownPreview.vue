<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCopy } from '../../../composables/useCopy'
import { useI18n } from '../../../i18n'
import type { Heading, ScrollPayload } from '../../../utils/markdown/types'

const props = defineProps<{
  html: string
  mermaidSources: string[]
  headings: Heading[]
  theme: 'light' | 'dark'
  inlineMath: boolean
  emptyLabel: string
}>()

const emit = defineEmits<{
  scroll: [payload: ScrollPayload]
  'active-heading': [id: string]
}>()

const { t, locale } = useI18n()
const { copy } = useCopy()

const scroller = ref<HTMLDivElement | null>(null)
const bodyRef = ref<HTMLDivElement | null>(null)

let enhanceToken = 0
let preservedScroll = 0
let scrollFrame = 0
let activeId = ''
let pinnedHeadingId = ''
let pinSettleAt = 0
let mermaidPromise: Promise<typeof import('mermaid')> | null = null
let katexPromise: Promise<typeof import('katex/contrib/auto-render')> | null = null
let katexCssPromise: Promise<unknown> | null = null
const boundImages = new WeakSet<HTMLImageElement>()

function loadMermaid() {
  mermaidPromise ??= import('mermaid').catch((error) => {
    mermaidPromise = null
    throw error
  })
  return mermaidPromise
}

function loadKatex() {
  katexPromise ??= import('katex/contrib/auto-render').catch((error) => {
    katexPromise = null
    throw error
  })
  katexCssPromise ??= import('katex/dist/katex.min.css').catch((error) => {
    katexCssPromise = null
    throw error
  })
  return Promise.all([katexPromise, katexCssPromise])
}

function createButton(label: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'btn btn--sm'
  button.dataset.mdUi = ''
  button.textContent = label
  return button
}

function createMermaidBlock(index: number, source: string): HTMLElement {
  const block = document.createElement('div')
  block.className = 'md-mermaid-block'
  block.dataset.mermaidIndex = String(index)

  const toolbar = document.createElement('div')
  toolbar.className = 'md-mermaid-block__toolbar'
  toolbar.dataset.mdUi = ''

  const diagramButton = createButton(t('图表'))
  const sourceButton = createButton(t('源码'))
  diagramButton.classList.add('is-active')
  diagramButton.setAttribute('aria-pressed', 'true')
  sourceButton.setAttribute('aria-pressed', 'false')

  const diagram = document.createElement('div')
  diagram.className = 'md-mermaid-block__diagram'

  const sourceView = document.createElement('pre')
  sourceView.className = 'md-mermaid-block__source'
  sourceView.dataset.mdUi = ''
  sourceView.textContent = source
  sourceView.hidden = true

  function showDiagram() {
    diagram.hidden = false
    sourceView.hidden = true
    diagramButton.classList.add('is-active')
    sourceButton.classList.remove('is-active')
    diagramButton.setAttribute('aria-pressed', 'true')
    sourceButton.setAttribute('aria-pressed', 'false')
  }

  function showSource() {
    diagram.hidden = true
    sourceView.hidden = false
    sourceButton.classList.add('is-active')
    diagramButton.classList.remove('is-active')
    sourceButton.setAttribute('aria-pressed', 'true')
    diagramButton.setAttribute('aria-pressed', 'false')
  }

  diagramButton.addEventListener('click', showDiagram)
  sourceButton.addEventListener('click', showSource)

  const copyButton = createButton(t('复制代码'))
  copyButton.addEventListener('click', async () => {
    const copied = await copy(source)
    copyButton.textContent = copied ? t('已复制') : t('复制失败')
    window.setTimeout(() => {
      copyButton.textContent = t('复制代码')
    }, 1500)
  })

  toolbar.append(diagramButton, sourceButton, copyButton)
  block.append(toolbar, diagram, sourceView)
  return block
}

function enhanceCodeBlocks(): void {
  const root = bodyRef.value
  if (!root) return

  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.closest('.md-mermaid-block')) return
    if (pre.parentElement?.classList.contains('md-code')) return

    const code = pre.querySelector('code')
    if (!code) return

    const raw = code.textContent ?? ''
    const languageClass = Array.from(code.classList).find((name) => name.startsWith('language-'))
    const language = languageClass ? languageClass.slice('language-'.length) : ''

    const wrapper = document.createElement('div')
    wrapper.className = 'md-code'

    const header = document.createElement('div')
    header.className = 'md-code__header'
    header.dataset.mdUi = ''

    const label = document.createElement('span')
    label.className = 'md-code__lang'
    label.textContent = language || t('代码')

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'btn btn--sm md-code__copy'
    button.dataset.mdUi = ''
    button.textContent = t('复制代码')
    button.addEventListener('click', async () => {
      if (!raw) return

      const copied = await copy(raw)
      button.textContent = copied ? t('已复制') : t('复制失败')
      window.setTimeout(() => {
        button.textContent = t('复制代码')
      }, 1500)
    })

    header.append(label, button)
    pre.replaceWith(wrapper)
    wrapper.append(header, pre)
  })
}

function attachImageErrors(): void {
  const root = bodyRef.value
  if (!root) return

  root.querySelectorAll('img').forEach((image) => {
    if (boundImages.has(image)) return
    boundImages.add(image)

    const replace = () => {
      const placeholder = document.createElement('div')
      placeholder.className = 'md-image-error'

      const alt = image.alt.trim() || t('图片')
      const title = document.createElement('span')
      title.textContent = `${t('图片加载失败')}: ${alt}`

      const url = document.createElement('span')
      url.className = 'md-image-error__url'
      url.textContent = image.currentSrc || image.src

      placeholder.append(title, url)
      image.replaceWith(placeholder)
    }

    image.addEventListener('error', replace, { once: true })
    if (image.complete && image.naturalWidth === 0) {
      replace()
    }
  })
}

function prepareMermaidBlocks(): void {
  const root = bodyRef.value
  if (!root) return

  root.querySelectorAll<HTMLElement>('.md-mermaid[data-mermaid-index]').forEach((placeholder) => {
    const index = Number(placeholder.dataset.mermaidIndex)
    const source = props.mermaidSources[index]

    if (!Number.isInteger(index) || source === undefined) {
      placeholder.remove()
      return
    }

    placeholder.replaceWith(createMermaidBlock(index, source))
  })
}

async function enhanceMermaid(token: number): Promise<void> {
  const root = bodyRef.value
  if (!root) return

  const blocks = Array.from(root.querySelectorAll<HTMLElement>('.md-mermaid-block[data-mermaid-index]'))
  if (blocks.length === 0) return

  const mermaid = (await loadMermaid()).default
  if (token !== enhanceToken) return

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: props.theme === 'dark' ? 'dark' : 'default',
  })

  for (const block of blocks) {
    if (token !== enhanceToken || !block.isConnected) return

    const index = Number(block.dataset.mermaidIndex)
    const source = props.mermaidSources[index]
    const diagram = block.querySelector<HTMLElement>('.md-mermaid-block__diagram')
    if (!diagram || source === undefined) continue

    try {
      const id = `md-mermaid-${token}-${index}`
      const result = await mermaid.render(id, source)
      if (token !== enhanceToken || !block.isConnected) return

      diagram.innerHTML = result.svg
      result.bindFunctions?.(diagram)
    } catch (error) {
      if (token !== enhanceToken || !block.isConnected) return

      diagram.innerHTML = ''
      const message = document.createElement('div')
      message.className = 'md-mermaid-block__error'
      message.dataset.mdUi = ''
      const detail = error instanceof Error ? error.message : String(error)
      message.textContent = `${t('Mermaid 渲染失败')}: ${detail}`
      diagram.appendChild(message)
    }
  }
}

async function enhanceMath(token: number): Promise<void> {
  const root = bodyRef.value
  if (!root) return

  const hasBlockMath = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]/.test(props.html)
  const hasInlineMath =
    props.inlineMath &&
    (/(^|[^$])\$[^$\n]+\$/.test(props.html) || /\\\([\s\S]*?\\\)/.test(props.html))
  if (!hasBlockMath && !hasInlineMath) return

  const [module] = await loadKatex()
  if (token !== enhanceToken) return

  const renderMathInElement = module.default
  renderMathInElement(root, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      ...(props.inlineMath
        ? [
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
          ]
        : []),
      { left: '\\[', right: '\\]', display: true },
    ],
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    throwOnError: false,
  })
}

function clearPinnedHeading(): void {
  if (!pinnedHeadingId) return

  pinnedHeadingId = ''
  updateActiveHeading()
}

function updateActiveHeading(): void {
  // Keep the heading the user explicitly clicked active until they scroll or
  // interact with the preview. Without this, a heading near the end of a short
  // document can never reach the top threshold, so the outline would jump back
  // to the previous heading immediately after the click.
  if (pinnedHeadingId) return

  const root = bodyRef.value
  const scrollerEl = scroller.value
  if (!root || !scrollerEl) return

  const threshold = scrollerEl.getBoundingClientRect().top + 32
  let nextActive = ''

  root.querySelectorAll<HTMLElement>('h1,h2,h3,h4').forEach((heading) => {
    if (heading.getBoundingClientRect().top <= threshold) {
      nextActive = heading.id
    }
  })

  if (!nextActive && props.headings.length > 0) {
    nextActive = props.headings[0].id
  }

  if (nextActive !== activeId) {
    activeId = nextActive
    emit('active-heading', nextActive)
  }
}

async function enhance(): Promise<void> {
  const token = ++enhanceToken
  await nextTick()

  const root = bodyRef.value
  if (!root) return

  enhanceCodeBlocks()
  attachImageErrors()
  prepareMermaidBlocks()

  try {
    await enhanceMath(token)
  } catch (error) {
    console.warn('KaTeX enhancement failed', error)
  }
  if (token !== enhanceToken) return

  try {
    await enhanceMermaid(token)
  } catch (error) {
    console.warn('Mermaid enhancement failed', error)
  }
  if (token !== enhanceToken) return

  updateActiveHeading()
}

async function rebuild(): Promise<void> {
  const root = bodyRef.value
  if (!root) return

  pinnedHeadingId = ''
  const top = scroller.value?.scrollTop ?? 0
  root.innerHTML = props.html
  if (scroller.value) {
    scroller.value.scrollTop = top
  }
  await enhance()
}

function handleScroll(): void {
  const scrollerEl = scroller.value
  if (!scrollerEl) return

  if (pinnedHeadingId && performance.now() >= pinSettleAt) {
    pinnedHeadingId = ''
  }

  const max = scrollerEl.scrollHeight - scrollerEl.clientHeight
  emit('scroll', {
    ratio: max > 0 ? scrollerEl.scrollTop / max : 0,
    scrollTop: scrollerEl.scrollTop,
    scrollHeight: scrollerEl.scrollHeight,
    clientHeight: scrollerEl.clientHeight,
  })

  window.cancelAnimationFrame(scrollFrame)
  scrollFrame = window.requestAnimationFrame(updateActiveHeading)
}

function scrollToRatio(ratio: number): void {
  const scrollerEl = scroller.value
  if (!scrollerEl) return

  const max = Math.max(0, scrollerEl.scrollHeight - scrollerEl.clientHeight)
  scrollerEl.scrollTop = Math.min(1, Math.max(0, ratio)) * max
}

function scrollToHeading(id: string): void {
  const root = bodyRef.value
  const scrollerEl = scroller.value
  if (!root || !scrollerEl) return

  const target = Array.from(root.querySelectorAll<HTMLElement>('h1,h2,h3,h4')).find(
    (heading) => heading.id === id,
  )
  if (!target) return

  pinnedHeadingId = id
  pinSettleAt = performance.now() + 700
  if (activeId !== id) {
    activeId = id
    emit('active-heading', id)
  }

  const top =
    target.getBoundingClientRect().top -
    scrollerEl.getBoundingClientRect().top +
    scrollerEl.scrollTop -
    16
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  scrollerEl.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
}

function getContentElement(): HTMLElement | null {
  return bodyRef.value
}

watch(
  () => props.html,
  () => {
    pinnedHeadingId = ''
    preservedScroll = scroller.value?.scrollTop ?? 0
  },
  { flush: 'pre' },
)

watch(
  () => props.html,
  async () => {
    await nextTick()
    if (scroller.value) {
      scroller.value.scrollTop = preservedScroll
    }
    await enhance()
  },
)

watch(
  () => props.theme,
  () => {
    void enhance()
  },
)

watch(
  () => props.inlineMath,
  () => {
    void rebuild()
  },
)

watch(locale, () => {
  void rebuild()
})

watch(
  () => props.headings,
  () => {
    if (pinnedHeadingId && !props.headings.some((heading) => heading.id === pinnedHeadingId)) {
      pinnedHeadingId = ''
    }
    void nextTick().then(updateActiveHeading)
  },
)

onMounted(() => {
  void enhance()

  const scrollerEl = scroller.value
  scrollerEl?.addEventListener('wheel', clearPinnedHeading, { passive: true })
  scrollerEl?.addEventListener('touchstart', clearPinnedHeading, { passive: true })
  scrollerEl?.addEventListener('pointerdown', clearPinnedHeading)
  scrollerEl?.addEventListener('keydown', clearPinnedHeading)
})

onBeforeUnmount(() => {
  enhanceToken += 1
  window.cancelAnimationFrame(scrollFrame)

  const scrollerEl = scroller.value
  scrollerEl?.removeEventListener('wheel', clearPinnedHeading)
  scrollerEl?.removeEventListener('touchstart', clearPinnedHeading)
  scrollerEl?.removeEventListener('pointerdown', clearPinnedHeading)
  scrollerEl?.removeEventListener('keydown', clearPinnedHeading)
})

defineExpose({ getContentElement, scrollToHeading, scrollToRatio })
</script>

<template>
  <div
    ref="scroller"
    class="md-preview"
    tabindex="0"
    :aria-label="t('Markdown 预览区')"
    @scroll.passive="handleScroll"
  >
    <div v-if="!html.trim()" class="md-preview__empty">{{ emptyLabel }}</div>
    <div v-else ref="bodyRef" class="md-preview__body" v-html="html" />
  </div>
</template>
