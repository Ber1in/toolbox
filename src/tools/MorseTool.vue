<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')

const morseMap: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', $: '...-..-', '@': '.--.-.',
}

const reverseMap = Object.fromEntries(
  Object.entries(morseMap).map(([char, code]) => [code, char]),
)

const result = computed(() => {
  if (!input.value.trim()) return { value: '', error: '' }

  if (mode.value === 'encode') {
    const unknown: string[] = []
    const words = input.value.trim().toUpperCase().split(/\s+/).map((word) =>
      Array.from(word)
        .map((char) => {
          const code = morseMap[char]
          if (!code) unknown.push(char)
          return code ?? ''
        })
        .filter(Boolean)
        .join(' '),
    )
    return {
      value: words.join(' / '),
      error: unknown.length
        ? t('以下字符没有摩尔斯编码，已跳过：{chars}', {
            chars: [...new Set(unknown)].join(' '),
          })
        : '',
    }
  }

  const decoded = input.value
    .trim()
    .split(/\s*\/\s*/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((code) => reverseMap[code] ?? '')
        .join(''),
    )
    .join(' ')
  return { value: decoded, error: '' }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button :class="{ 'is-active': mode === 'encode' }" type="button" @click="mode = 'encode'">
          {{ t('文本 → 摩尔斯') }}
        </button>
        <button :class="{ 'is-active': mode === 'decode' }" type="button" @click="mode = 'decode'">
          {{ t('摩尔斯 → 文本') }}
        </button>
      </div>
      <span class="hint">{{ t('字母之间用空格，单词之间用 / 分隔') }}</span>
    </div>

    <label class="field">
      <span class="label">{{ t('输入') }}</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="t(mode === 'encode' ? '输入文本，例如：SOS HELLO' : '输入摩尔斯码，例如：... --- ... / .... . .-.. .-.. ---')"
        spellcheck="false"
      />
    </label>

    <div class="field">
      <div class="row row--end">
        <CopyButton :text="result.value" />
        <button class="btn btn--sm" type="button" :disabled="!input" @click="input = ''">
          {{ t('清空') }}
        </button>
      </div>
      <pre class="output output--tall">{{ result.value }}</pre>
      <p v-if="result.error" class="error">{{ result.error }}</p>
    </div>

    <details class="details">
      <summary class="hint">{{ t('查看摩尔斯码对照表') }}</summary>
      <div class="table-wrap">
        <table class="table">
          <tbody>
            <tr v-for="(code, char) in morseMap" :key="char">
              <td class="mono">{{ char }}</td>
              <td class="mono">{{ code }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </section>
</template>

<style scoped>
.details summary {
  cursor: pointer;
}

.table {
  margin-top: 12px;
}
</style>
