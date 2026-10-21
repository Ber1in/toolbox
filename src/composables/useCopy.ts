import { onBeforeUnmount, ref } from 'vue'

/** 复制到剪贴板，附带「已复制」状态（1.5s 后复位） */
export function useCopy() {
  const copied = ref(false)
  let timer: number | undefined

  async function copy(text: string) {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // 非安全上下文 / 无权限时的兜底
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }

    copied.value = true
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      copied.value = false
    }, 1500)
  }

  onBeforeUnmount(() => window.clearTimeout(timer))

  return { copied, copy }
}
