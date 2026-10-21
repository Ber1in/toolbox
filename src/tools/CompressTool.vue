<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const file = ref<File | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')
const originalSize = ref(0)
const resultSize = ref(0)
const quality = ref(0.8)
const maxWidth = ref(0)
const format = ref<'image/jpeg' | 'image/webp'>('image/jpeg')
const loading = ref(false)
const error = ref('')

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(t('图片加载失败')))
    image.src = src
  })
}

async function process() {
  if (!file.value || !originalUrl.value) return

  loading.value = true
  error.value = ''

  try {
    const image = await loadImage(originalUrl.value)
    let width = image.naturalWidth
    let height = image.naturalHeight

    if (maxWidth.value > 0 && width > maxWidth.value) {
      height = Math.round((height * maxWidth.value) / width)
      width = maxWidth.value
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) throw new Error(t('当前浏览器不支持 Canvas'))

    context.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format.value, quality.value),
    )

    if (!blob) throw new Error(t('压缩失败'))

    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  } finally {
    loading.value = false
  }
}

async function onFileChange(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0]
  if (!selected) return

  if (!selected.type.startsWith('image/')) {
    error.value = t('请选择图片文件')
    return
  }

  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)

  file.value = selected
  originalSize.value = selected.size
  originalUrl.value = URL.createObjectURL(selected)
  resultUrl.value = ''
  resultSize.value = 0
  await process()
}

const downloadName = computed(() => {
  const base = file.value?.name.replace(/\.[^.]+$/, '') ?? 'image'
  return `${base}-compressed.${format.value === 'image/webp' ? 'webp' : 'jpg'}`
})

const savedPercent = computed(() => {
  if (!originalSize.value || !resultSize.value) return 0
  return Math.round((1 - resultSize.value / originalSize.value) * 100)
})

onBeforeUnmount(() => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('选择图片') }}</span>
        <input class="input" type="file" accept="image/*" @change="onFileChange" />
      </label>

      <div class="cols">
        <label class="field">
          <span class="label">{{ t('质量 {n}%', { n: Math.round(quality * 100) }) }}</span>
          <input v-model.number="quality" type="range" min="0.1" max="1" step="0.05" />
        </label>

        <label class="field">
          <span class="label">{{ t('最大宽度（px，0 表示原始尺寸）') }}</span>
          <input v-model.number="maxWidth" class="input" type="number" min="0" step="10" />
        </label>
      </div>

      <div class="row">
        <div class="segmented">
          <button
            :class="{ 'is-active': format === 'image/jpeg' }"
            type="button"
            @click="format = 'image/jpeg'"
          >
            JPEG
          </button>
          <button
            :class="{ 'is-active': format === 'image/webp' }"
            type="button"
            @click="format = 'image/webp'"
          >
            WebP
          </button>
        </div>

        <button class="btn btn--primary" type="button" :disabled="!file || loading" @click="process">
          {{ t(loading ? '处理中…' : '开始压缩') }}
        </button>

        <a v-if="resultUrl" class="btn" :href="resultUrl" :download="downloadName">{{ t('下载') }}</a>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p class="hint">{{ t('图片只在浏览器本地处理，不会上传到服务器。') }}</p>
    </section>

    <section v-if="resultUrl" class="panel">
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__label">{{ t('原始大小') }}</span>
          <span class="stat__value">{{ formatBytes(originalSize) }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('压缩后大小') }}</span>
          <span class="stat__value">{{ formatBytes(resultSize) }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('体积变化') }}</span>
          <span class="stat__value">{{ savedPercent > 0 ? `-${savedPercent}%` : t('未减小') }}</span>
        </div>
      </div>

      <div class="previews">
        <figure class="preview">
          <img :src="originalUrl" :alt="t('原图预览')" />
          <figcaption class="hint">{{ t('原图') }}</figcaption>
        </figure>
        <figure class="preview">
          <img :src="resultUrl" :alt="t('压缩结果预览')" />
          <figcaption class="hint">{{ t('压缩后') }}</figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.previews {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.preview {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 10px;
  background: var(--color-chip);
}

@media (max-width: 560px) {
  .previews {
    grid-template-columns: 1fr;
  }
}
</style>
