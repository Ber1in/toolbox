<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Check,
  Copy,
  Link2,
  PanelRight,
  Sigma,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import MarkdownEditor from '../components/tool/markdown/MarkdownEditor.vue'
import MarkdownPreview from '../components/tool/markdown/MarkdownPreview.vue'
import MarkdownToc from '../components/tool/markdown/MarkdownToc.vue'
import { useCopy } from '../composables/useCopy'
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../i18n'
import { copyHtmlToClipboard, exportPreviewHtml } from '../utils/markdown/export'
import { prepareMarkdown } from '../utils/markdown/pipeline'
import {
  clearContent,
  loadContent,
  loadSettings,
  saveContent,
  saveSettings,
  type MarkdownSettings,
} from '../utils/markdown/storage'
import type { PreparedMarkdown, ScrollPayload } from '../utils/markdown/types'

type MobileTab = 'editor' | 'preview'

const { t } = useI18n()
const { theme } = useTheme()
const { copy } = useCopy()

const source = ref(loadContent())
const settings = ref<MarkdownSettings>(loadSettings())
const prepared = ref<PreparedMarkdown>(prepareMarkdown(source.value))

const editorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const previewRef = ref<InstanceType<typeof MarkdownPreview> | null>(null)
const mainRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const importButton = ref<HTMLButtonElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)
const confirmButton = ref<HTMLButtonElement | null>(null)

const confirmTitleId = `md-confirm-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`

const activeHeading = ref('')
const mobileTab = ref<MobileTab>('editor')
const tocDrawerOpen = ref(false)
const isDragging = ref(false)
const dragging = ref(false)
const confirmOpen = ref(false)
const pendingFile = ref<File | null>(null)
const importError = ref('')
const copyError = ref('')
const htmlCopied = ref(false)
let importToken = 0

const mediaQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 900px)')
    : null
const narrow = ref(mediaQuery?.matches ?? false)

const tocAvailable = computed(() => prepared.value.headings.length >= 2)
const showToc = computed(() => !narrow.value && tocAvailable.value && !settings.value.tocCollapsed)

let renderTimer: number | undefined
let saveTimer: number | undefined
let settingsTimer: number | undefined
let copiedTimer: number | undefined
let contentDirty = false
let skipNextSave = false
let syncing = false
let dragStartX = 0
let dragStartRatio = 0.5
let dragWidth = 1

watch(
  source,
  (value) => {
    window.clearTimeout(renderTimer)
    renderTimer = window.setTimeout(() => {
      prepared.value = prepareMarkdown(value)
    }, 120)

    if (skipNextSave) {
      skipNextSave = false
      return
    }

    window.clearTimeout(saveTimer)
    contentDirty = true
    saveTimer = window.setTimeout(() => {
      saveContent(value)
      contentDirty = false
    }, 300)
  },
  { flush: 'post' },
)

watch(
  settings,
  (value) => {
    window.clearTimeout(settingsTimer)
    settingsTimer = window.setTimeout(() => saveSettings(value), 150)
  },
  { deep: true },
)

watch(confirmOpen, async (open) => {
  if (!open) return
  await nextTick()
  confirmButton.value?.focus()
})

watch(tocAvailable, (available) => {
  if (!available) {
    tocDrawerOpen.value = false
  }
})

function onMediaChange(event: MediaQueryListEvent) {
  narrow.value = event.matches
  if (!event.matches) {
    tocDrawerOpen.value = false
  }
}

function toggleScrollSync() {
  settings.value.scrollSync = !settings.value.scrollSync
}

function toggleInlineMath() {
  settings.value.inlineMath = !settings.value.inlineMath
}

function syncScroll(ratio: number, target: 'editor' | 'preview') {
  syncing = true

  if (target === 'preview') {
    previewRef.value?.scrollToRatio(ratio)
  } else {
    editorRef.value?.scrollToRatio(ratio)
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      syncing = false
    })
  })
}

function onEditorScroll(payload: ScrollPayload) {
  if (!settings.value.scrollSync || syncing) return
  syncScroll(payload.ratio, 'preview')
}

function onPreviewScroll(payload: ScrollPayload) {
  if (!settings.value.scrollSync || syncing) return
  syncScroll(payload.ratio, 'editor')
}

function toggleToc() {
  if (!tocAvailable.value) return

  if (narrow.value) {
    tocDrawerOpen.value = !tocDrawerOpen.value
    return
  }

  settings.value.tocCollapsed = !settings.value.tocCollapsed
}

function closeToc() {
  if (narrow.value) {
    tocDrawerOpen.value = false
  } else {
    settings.value.tocCollapsed = true
  }
}

function onTocSelect(id: string) {
  if (narrow.value) {
    mobileTab.value = 'preview'
    tocDrawerOpen.value = false
    void nextTick().then(() => previewRef.value?.scrollToHeading(id))
    return
  }

  previewRef.value?.scrollToHeading(id)
}

function onSplitterPointerDown(event: PointerEvent) {
  if (event.button !== 0 || narrow.value) return

  const target = event.currentTarget as HTMLElement
  target.focus()
  dragging.value = true
  dragStartX = event.clientX
  dragStartRatio = settings.value.splitRatio
  dragWidth = Math.max(
    1,
    (mainRef.value?.getBoundingClientRect().width ?? 1) -
      target.getBoundingClientRect().width,
  )

  window.addEventListener('pointermove', onSplitterPointerMove)
  window.addEventListener('pointerup', onSplitterPointerUp)
  window.addEventListener('pointercancel', onSplitterPointerUp)
  window.addEventListener('blur', onSplitterPointerUp)
}

function onSplitterPointerMove(event: PointerEvent) {
  if (!dragging.value) return

  if (event.buttons === 0) {
    onSplitterPointerUp()
    return
  }

  const ratio = dragStartRatio + (event.clientX - dragStartX) / dragWidth
  settings.value.splitRatio = Math.min(0.8, Math.max(0.2, ratio))
}

function onSplitterPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onSplitterPointerMove)
  window.removeEventListener('pointerup', onSplitterPointerUp)
  window.removeEventListener('pointercancel', onSplitterPointerUp)
  window.removeEventListener('blur', onSplitterPointerUp)
}

function resetSplitter() {
  settings.value.splitRatio = 0.5
}

function onSplitterKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    settings.value.splitRatio = Math.max(0.2, settings.value.splitRatio - 0.02)
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    settings.value.splitRatio = Math.min(0.8, settings.value.splitRatio + 0.02)
  } else if (event.key === 'Home') {
    event.preventDefault()
    settings.value.splitRatio = 0.2
  } else if (event.key === 'End') {
    event.preventDefault()
    settings.value.splitRatio = 0.8
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function isSupportedFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ['.md', '.markdown', '.txt'].some((extension) => name.endsWith(extension))
}

async function loadFile(file: File) {
  const token = ++importToken
  const startedWith = source.value
  pendingFile.value = null
  confirmOpen.value = false
  void nextTick().then(() => importButton.value?.focus())

  try {
    const text = await file.text()
    if (token !== importToken || source.value !== startedWith) return

    source.value = text
    importError.value = ''
    copyError.value = ''

    if (narrow.value) {
      mobileTab.value = 'preview'
    }
  } catch {
    if (token !== importToken) return
    importError.value = t('读取文件失败')
  }
}

async function handleFiles(files: FileList | null) {
  const file = files?.[0]
  if (!file) return

  if (!isSupportedFile(file)) {
    importError.value = t('仅支持 .md、.markdown 和 .txt 文件')
    return
  }

  importToken += 1
  importError.value = ''

  if (source.value.length > 0) {
    pendingFile.value = file
    confirmOpen.value = true
    return
  }

  await loadFile(file)
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  void handleFiles(input.files)
  input.value = ''
}

function confirmImport() {
  if (pendingFile.value) {
    void loadFile(pendingFile.value)
  }
}

function cancelImport() {
  pendingFile.value = null
  confirmOpen.value = false
  void nextTick().then(() => importButton.value?.focus())
}

function onConfirmKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelImport()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = [cancelButton.value, confirmButton.value].filter(
    (element): element is HTMLButtonElement => Boolean(element),
  )
  if (focusable.length === 0) return

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

function onConfirmFocusOut(event: FocusEvent) {
  if (!confirmOpen.value) return

  const modal = event.currentTarget as HTMLElement
  const next = event.relatedTarget as Node | null
  if (next && modal.contains(next)) return

  void nextTick().then(() => {
    if (confirmOpen.value) {
      confirmButton.value?.focus()
    }
  })
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  if (!target.contains(event.relatedTarget as Node | null)) {
    isDragging.value = false
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  void handleFiles(event.dataTransfer?.files ?? null)
}

async function copyHtml() {
  const content = previewRef.value?.getContentElement()
  if (!content) return

  const html = exportPreviewHtml(content)
  if (!html) return

  window.clearTimeout(copiedTimer)
  const copiedRich = await copyHtmlToClipboard(html)
  const copied = copiedRich || (await copy(html))

  if (!copied) {
    htmlCopied.value = false
    copyError.value = t('复制 HTML 失败')
    return
  }

  copyError.value = ''
  htmlCopied.value = true
  copiedTimer = window.setTimeout(() => {
    htmlCopied.value = false
  }, 1500)
}

function clearAll() {
  importToken += 1
  window.clearTimeout(saveTimer)
  window.clearTimeout(renderTimer)
  skipNextSave = source.value.length > 0
  contentDirty = false

  source.value = ''
  prepared.value = prepareMarkdown('')
  clearContent()
  importError.value = ''
  copyError.value = ''
  pendingFile.value = null
  confirmOpen.value = false
  activeHeading.value = ''

  if (narrow.value) {
    mobileTab.value = 'editor'
  }

  void nextTick(() => editorRef.value?.focus())
}

onMounted(() => {
  if (!mediaQuery) return
  narrow.value = mediaQuery.matches
  mediaQuery.addEventListener('change', onMediaChange)
})

onBeforeUnmount(() => {
  importToken += 1
  window.clearTimeout(renderTimer)
  window.clearTimeout(saveTimer)
  window.clearTimeout(settingsTimer)
  window.clearTimeout(copiedTimer)
  window.removeEventListener('pointermove', onSplitterPointerMove)
  window.removeEventListener('pointerup', onSplitterPointerUp)
  window.removeEventListener('pointercancel', onSplitterPointerUp)
  window.removeEventListener('blur', onSplitterPointerUp)

  if (contentDirty) {
    saveContent(source.value)
  }
  saveSettings(settings.value)

  mediaQuery?.removeEventListener('change', onMediaChange)
})
</script>

<template>
  <section
    class="md-tool"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="md-tool__toolbar">
      <div class="md-tool__toolbar-group">
        <button ref="importButton" class="btn btn--sm" type="button" @click="openFilePicker">
          <Upload :size="14" :stroke-width="2" />
          {{ t('导入') }}
        </button>
        <input
          ref="fileInput"
          class="md-tool__file-input"
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          tabindex="-1"
          @change="onFileInputChange"
        />
        <button
          class="btn btn--sm"
          type="button"
          :disabled="!prepared.html.trim()"
          @click="copyHtml"
        >
          <Check v-if="htmlCopied" :size="14" :stroke-width="2" />
          <Copy v-else :size="14" :stroke-width="2" />
          {{ htmlCopied ? t('已复制 HTML') : t('复制 HTML') }}
        </button>
        <button class="btn btn--sm" type="button" @click="clearAll">
          <Trash2 :size="14" :stroke-width="2" />
          {{ t('清空') }}
        </button>
      </div>

      <div class="md-tool__toolbar-group">
        <div class="md-tool__tabs segmented" role="tablist" :aria-label="t('切换视图')">
          <button
            type="button"
            role="tab"
            :class="{ 'is-active': mobileTab === 'editor' }"
            :aria-selected="mobileTab === 'editor'"
            @click="mobileTab = 'editor'"
          >
            {{ t('编辑器') }}
          </button>
          <button
            type="button"
            role="tab"
            :class="{ 'is-active': mobileTab === 'preview' }"
            :aria-selected="mobileTab === 'preview'"
            @click="mobileTab = 'preview'"
          >
            {{ t('预览') }}
          </button>
        </div>

        <button
          class="btn btn--sm md-tool__toggle"
          type="button"
          :aria-pressed="settings.scrollSync"
          @click="toggleScrollSync"
        >
          <Link2 :size="14" :stroke-width="2" />
          {{ t('滚动同步') }}
        </button>
        <button
          class="btn btn--sm md-tool__toggle"
          type="button"
          :aria-pressed="settings.inlineMath"
          @click="toggleInlineMath"
        >
          <Sigma :size="14" :stroke-width="2" />
          {{ t('行内公式') }}
        </button>
        <button
          class="btn btn--sm md-tool__toggle"
          type="button"
          :disabled="!tocAvailable"
          :aria-pressed="showToc || (narrow && tocDrawerOpen)"
          @click="toggleToc"
        >
          <PanelRight :size="14" :stroke-width="2" />
          {{ t('目录') }}
        </button>
      </div>
    </div>

    <p v-if="importError" class="md-tool__error" role="alert">{{ importError }}</p>
    <p v-if="copyError" class="md-tool__error" role="alert">{{ copyError }}</p>

    <div class="md-workspace" :class="{ 'is-toc-open': showToc, 'is-dragging': dragging }">
      <div
        ref="mainRef"
        class="md-main"
        :style="{ '--md-editor-ratio': `${settings.splitRatio * 100}%` }"
      >
        <div v-show="!narrow || mobileTab === 'editor'" class="md-pane md-pane--editor">
          <MarkdownEditor
            ref="editorRef"
            v-model="source"
            :theme="theme"
            :placeholder="t('在这里输入 Markdown…')"
            :aria-label="t('Markdown 编辑器')"
            @scroll="onEditorScroll"
          />
        </div>

        <div
          v-show="!narrow"
          class="md-splitter"
          :class="{ 'is-dragging': dragging }"
          role="separator"
          aria-orientation="vertical"
          :aria-label="t('调整编辑器和预览的比例')"
          :aria-valuemin="20"
          :aria-valuemax="80"
          :aria-valuenow="Math.round(settings.splitRatio * 100)"
          tabindex="0"
          @pointerdown="onSplitterPointerDown"
          @dblclick="resetSplitter"
          @keydown="onSplitterKeydown"
        />

        <div v-show="!narrow || mobileTab === 'preview'" class="md-pane md-pane--preview">
          <MarkdownPreview
            ref="previewRef"
            :html="prepared.html"
            :mermaid-sources="prepared.mermaidSources"
            :headings="prepared.headings"
            :theme="theme"
            :inline-math="settings.inlineMath"
            :empty-label="t('预览为空')"
            @scroll="onPreviewScroll"
            @active-heading="activeHeading = $event"
          />
        </div>
      </div>

      <MarkdownToc
        v-if="showToc"
        :toc="prepared.toc"
        :active-id="activeHeading"
        @select="onTocSelect"
        @close="closeToc"
      />

      <div v-if="isDragging" class="md-drop-overlay" data-md-chrome="drop-overlay">
        {{ t('拖拽文件到此处导入') }}
      </div>
    </div>

    <div
      v-if="narrow && tocDrawerOpen && tocAvailable"
      class="md-toc-backdrop"
      data-md-chrome="toc-backdrop"
      @click="tocDrawerOpen = false"
    />
    <MarkdownToc
      v-if="narrow && tocDrawerOpen && tocAvailable"
      drawer
      :toc="prepared.toc"
      :active-id="activeHeading"
      @select="onTocSelect"
      @close="closeToc"
    />

    <div
      v-if="confirmOpen"
      class="md-confirm"
      data-md-chrome="confirm"
      role="presentation"
      @click.self="cancelImport"
      @keydown="onConfirmKeydown"
      @focusout="onConfirmFocusOut"
    >
      <div
        class="md-confirm__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="confirmTitleId"
      >
        <h2 :id="confirmTitleId" class="md-confirm__title">{{ t('覆盖现有内容？') }}</h2>
        <p class="md-confirm__text">{{ t('导入会替换编辑器中的现有内容。') }}</p>
        <div class="md-confirm__actions">
          <button
            ref="cancelButton"
            class="btn btn--sm btn--ghost"
            type="button"
            @click="cancelImport"
          >
            {{ t('取消') }}
          </button>
          <button
            ref="confirmButton"
            class="btn btn--sm btn--primary"
            type="button"
            @click="confirmImport"
          >
            {{ t('覆盖') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
