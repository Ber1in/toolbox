<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const file = ref<File | null>(null)
const sourceUrl = ref('')
const resultUrl = ref('')
const resultSize = ref(0)
const format = ref<'image/png' | 'image/jpeg' | 'image/webp'>('image/png')
const quality = ref(0.92)
const error = ref('')
const loading = ref(false)

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
    image.onerror = () => reject(new Error('图片加载失败'))
    image.src = src
  })
}

async function convert() {
  if (!sourceUrl.value) return

  loading.value = true
  error.value = ''

  try {
    const image = await loadImage(sourceUrl.value)
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext('2d')
    if (!context) throw new Error('当前浏览器不支持 Canvas')

    if (format.value === 'image/jpeg') {
      // JPEG 无透明通道，先铺白底
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    context.drawImage(image, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format.value, quality.value),
    )
    if (!blob) throw new Error('转换失败，当前浏览器可能不支持该格式')

    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  } finally {
    loading.value = false
  }
}

function onFileChange(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0]
  if (!selected) return

  if (!selected.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }

  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)

  file.value = selected
  sourceUrl.value = URL.createObjectURL(selected)
  resultUrl.value = ''
  resultSize.value = 0
  void convert()
}

const extension = computed(() =>
  format.value === 'image/png' ? 'png' : format.value === 'image/webp' ? 'webp' : 'jpg',
)

const downloadName = computed(() => {
  const base = file.value?.name.replace(/\.[^.]+$/, '') ?? 'image'
  return `${base}.${extension.value}`
})

onBeforeUnmount(() => {
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">选择图片</span>
        <input class="input" type="file" accept="image/*" @change="onFileChange" />
      </label>

      <div class="cols">
        <label class="field">
          <span class="label">目标格式</span>
          <select v-model="format" class="select" @change="convert">
            <option value="image/png">PNG（支持透明）</option>
            <option value="image/jpeg">JPEG（有损，体积小）</option>
            <option value="image/webp">WebP（现代浏览器）</option>
          </select>
        </label>

        <label v-if="format !== 'image/png'" class="field">
          <span class="label">质量 {{ Math.round(quality * 100) }}%</span>
          <input v-model.number="quality" type="range" min="0.1" max="1" step="0.05" />
        </label>
      </div>

      <div class="row">
        <button class="btn btn--primary" type="button" :disabled="!file || loading" @click="convert">
          {{ loading ? '转换中…' : '转换' }}
        </button>
        <a v-if="resultUrl" class="btn" :href="resultUrl" :download="downloadName">下载</a>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section v-if="resultUrl" class="panel">
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__label">原始大小</span>
          <span class="stat__value">{{ formatBytes(file?.size ?? 0) }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">转换后大小</span>
          <span class="stat__value">{{ formatBytes(resultSize) }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">输出格式</span>
          <span class="stat__value">{{ extension.toUpperCase() }}</span>
        </div>
      </div>

      <img class="result" :src="resultUrl" alt="转换结果预览" />
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: 10px;
  background: var(--color-chip);
}
</style>
