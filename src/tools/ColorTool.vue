<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const hex = ref('#5046e5')

function normalizeHex(value: string) {
  let text = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(text)) {
    text = text.split('').map((char) => char + char).join('')
  }
  return /^[0-9a-f]{6}$/i.test(text) ? `#${text.toLowerCase()}` : null
}

const rgb = computed(() => {
  const normalized = normalizeHex(hex.value)
  if (!normalized) return null
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  }
})

const hsl = computed(() => {
  if (!rgb.value) return null
  const r = rgb.value.r / 255
  const g = rgb.value.g / 255
  const b = rgb.value.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0

  if (max !== min) {
    const delta = max - min
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    if (max === r) hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6
    else if (max === g) hue = ((b - r) / delta + 2) / 6
    else hue = ((r - g) / delta + 4) / 6
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  }
})

const rgbText = computed(() =>
  rgb.value ? `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` : '',
)
const hslText = computed(() =>
  hsl.value ? `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)` : '',
)
const normalizedHex = computed(() => normalizeHex(hex.value) ?? '')
const isValid = computed(() => Boolean(normalizedHex.value))

function onPick(event: Event) {
  hex.value = (event.target as HTMLInputElement).value
}

function onHexInput(event: Event) {
  hex.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="cols">
        <label class="field">
          <span class="label">取色</span>
          <input
            class="color-input"
            type="color"
            :value="normalizedHex || '#000000'"
            @input="onPick"
          />
        </label>

        <label class="field">
          <span class="label">HEX</span>
          <input
            class="input mono"
            type="text"
            :value="hex"
            placeholder="#5046e5"
            spellcheck="false"
            @input="onHexInput"
          />
        </label>
      </div>

      <p v-if="!isValid" class="error">请输入 3 位或 6 位十六进制颜色值，例如 #5046e5</p>

      <div v-if="rgb && hsl" class="stat-grid">
        <div class="stat">
          <span class="stat__label">HEX</span>
          <span class="stat__value">{{ normalizedHex }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">RGB</span>
          <span class="stat__value">{{ rgbText }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">HSL</span>
          <span class="stat__value">{{ hslText }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">亮度</span>
          <span class="stat__value">{{ Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000) }}</span>
        </div>
      </div>

      <div class="row">
        <CopyButton :text="normalizedHex" label="复制 HEX" />
        <CopyButton :text="rgbText" label="复制 RGB" />
        <CopyButton :text="hslText" label="复制 HSL" />
      </div>
    </section>

    <section v-if="isValid" class="panel">
      <div class="swatch" :style="{ background: normalizedHex }" />
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-input {
  width: 100%;
  height: 42px;
  padding: 4px;
  border-radius: 10px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 1px var(--color-border);
  cursor: pointer;
}

.swatch {
  height: 160px;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px var(--color-border);
}
</style>
