<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState } from '@codemirror/state'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder,
  rectangularSelection,
} from '@codemirror/view'
import { useI18n } from '../../../i18n'
import type { ScrollPayload } from '../../../utils/markdown/types'

const props = defineProps<{
  modelValue: string
  theme: 'light' | 'dark'
  placeholder?: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  scroll: [payload: ScrollPayload]
}>()

const { t, locale } = useI18n()

const host = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null
let scrollFrame = 0

const themeCompartment = new Compartment()
const placeholderCompartment = new Compartment()
const phrasesCompartment = new Compartment()
const attributesCompartment = new Compartment()

function createPhrases(): Record<string, string> {
  return {
    Find: t('查找'),
    Replace: t('替换'),
    next: t('下一个'),
    previous: t('上一个'),
    all: t('全部'),
    'match case': t('区分大小写'),
    regexp: t('正则'),
    'by word': t('全词匹配'),
    replace: t('替换'),
    'replace all': t('全部替换'),
    close: t('关闭'),
  }
}

function contentAttributes() {
  return EditorView.contentAttributes.of({
    'aria-label': props.ariaLabel ?? 'Markdown editor',
    spellcheck: 'false',
  })
}

function createTheme(dark: boolean) {
  return EditorView.theme(
    {
      '&': {
        height: '100%',
        color: 'var(--md-editor-fg)',
        backgroundColor: 'var(--md-editor-bg)',
        fontSize: 'var(--md-editor-font-size)',
      },
      '&.cm-focused': { outline: 'none' },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'var(--font-mono)',
        lineHeight: 'var(--md-editor-line-height)',
      },
      '.cm-content': {
        caretColor: 'var(--md-editor-cursor)',
        padding: '16px 0',
      },
      '.cm-line': { padding: '0 16px' },
      '.cm-gutters': {
        backgroundColor: 'var(--md-editor-gutter-bg)',
        color: 'var(--md-editor-gutter-fg)',
        border: 'none',
        borderRight: '1px solid var(--md-pane-border)',
      },
      '.cm-lineNumbers .cm-gutterElement': { padding: '0 12px 0 16px' },
      '.cm-activeLine': { backgroundColor: 'var(--md-editor-active-line)' },
      '.cm-activeLineGutter': {
        backgroundColor: 'var(--md-editor-active-line)',
        color: 'var(--md-editor-fg)',
      },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--md-editor-cursor)' },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        { backgroundColor: 'var(--md-editor-selection)' },
      '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
        backgroundColor: 'var(--md-editor-selection)',
        outline: '1px solid var(--color-accent)',
      },
      '.cm-searchMatch': { backgroundColor: 'var(--md-search-match)' },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: 'var(--md-search-match-selected)',
      },
      '.cm-selectionMatch': { backgroundColor: 'var(--md-search-match)' },
      '.cm-panels': {
        backgroundColor: 'var(--md-editor-panel-bg)',
        color: 'var(--md-editor-fg)',
        borderColor: 'var(--md-pane-border)',
      },
      '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--md-pane-border)' },
      '.cm-panel.cm-search': { padding: '8px 10px' },
      '.cm-textfield': {
        backgroundColor: 'var(--color-card)',
        color: 'var(--md-editor-fg)',
        border: '1px solid var(--md-pane-border)',
        borderRadius: 'var(--radius-chip)',
        padding: '4px 8px',
      },
      '.cm-button': {
        backgroundColor: 'var(--color-chip)',
        color: 'var(--md-editor-fg)',
        border: '1px solid var(--md-pane-border)',
        borderRadius: 'var(--radius-chip)',
        backgroundImage: 'none',
      },
      '.cm-tooltip': {
        backgroundColor: 'var(--color-card)',
        color: 'var(--md-editor-fg)',
        border: '1px solid var(--md-pane-border)',
      },
      '.cm-placeholder': { color: 'var(--color-ink-subtle)' },
    },
    { dark },
  )
}

function buildExtensions() {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    highlightActiveLine(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),
    search({ top: true }),
    EditorState.tabSize.of(2),
    markdown(),
    EditorView.lineWrapping,
    keymap.of([...defaultKeymap, ...searchKeymap, ...historyKeymap, indentWithTab]),
    themeCompartment.of(createTheme(props.theme === 'dark')),
    placeholderCompartment.of(placeholder(props.placeholder ?? '')),
    phrasesCompartment.of(EditorState.phrases.of(createPhrases())),
    attributesCompartment.of(contentAttributes()),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit('update:modelValue', update.state.doc.toString())
      }
    }),
  ]
}

function handleScroll() {
  if (!view) return

  window.cancelAnimationFrame(scrollFrame)
  scrollFrame = window.requestAnimationFrame(() => {
    const scroller = view?.scrollDOM
    if (!scroller) return

    const max = scroller.scrollHeight - scroller.clientHeight
    emit('scroll', {
      ratio: max > 0 ? scroller.scrollTop / max : 0,
      scrollTop: scroller.scrollTop,
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
    })
  })
}

function scrollToRatio(ratio: number) {
  const scroller = view?.scrollDOM
  if (!scroller) return

  const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight)
  scroller.scrollTop = Math.min(1, Math.max(0, ratio)) * max
}

function focus() {
  view?.focus()
}

onMounted(() => {
  if (!host.value) return

  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: buildExtensions(),
    }),
    parent: host.value,
  })

  view.scrollDOM.addEventListener('scroll', handleScroll, { passive: true })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!view) return
    const current = view.state.doc.toString()
    if (current === value) return

    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    })
  },
)

watch(
  () => props.theme,
  (theme) => {
    view?.dispatch({
      effects: themeCompartment.reconfigure(createTheme(theme === 'dark')),
    })
  },
)

watch(
  () => props.placeholder,
  (value) => {
    view?.dispatch({
      effects: placeholderCompartment.reconfigure(placeholder(value ?? '')),
    })
  },
)

watch(
  () => props.ariaLabel,
  () => {
    view?.dispatch({
      effects: attributesCompartment.reconfigure(contentAttributes()),
    })
  },
)

watch(locale, () => {
  view?.dispatch({
    effects: phrasesCompartment.reconfigure(EditorState.phrases.of(createPhrases())),
  })
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(scrollFrame)
  view?.scrollDOM.removeEventListener('scroll', handleScroll)
  view?.destroy()
  view = null
})

defineExpose({ scrollToRatio, focus })
</script>

<template>
  <div ref="host" class="md-editor" />
</template>
