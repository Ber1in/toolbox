import { onBeforeUnmount, ref } from 'vue'

/** Copy to clipboard and expose a "copied" state that resets after 1.5s. */
export function useCopy() {
  const copied = ref(false)
  let timer: number | undefined

  async function copy(text: string) {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for insecure contexts or missing permissions.
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
