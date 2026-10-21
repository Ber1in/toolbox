<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const input = ref('192.168.1.0/24')

function toIp(value: number) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.')
}

function toBinary(value: number) {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, '0'))
    .join('.')
}

const parsed = computed(() => {
  const match = input.value.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})$/)
  if (!match) return { error: '格式应为 192.168.1.0/24' }

  const octets = match[1].split('.').map(Number)
  const prefix = Number(match[2])

  if (octets.some((octet) => octet < 0 || octet > 255)) return { error: 'IP 每段必须在 0-255 之间' }
  if (prefix < 0 || prefix > 32) return { error: '前缀长度必须在 0-32 之间' }

  const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const network = (ipInt & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = 2 ** (32 - prefix)
  const usable = prefix >= 31 ? total : Math.max(total - 2, 0)

  return {
    prefix,
    mask: toIp(mask),
    wildcard: toIp(~mask >>> 0),
    network: toIp(network),
    broadcast: toIp(broadcast),
    first: toIp(prefix >= 31 ? network : network + 1),
    last: toIp(prefix >= 31 ? broadcast : broadcast - 1),
    total,
    usable,
    networkBinary: toBinary(network),
    ipBinary: toBinary(ipInt),
  }
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">CIDR 网段</span>
        <input v-model="input" class="input mono" type="text" placeholder="192.168.1.0/24" spellcheck="false" />
      </label>

      <p v-if="'error' in parsed" class="error">{{ parsed.error }}</p>
    </section>

    <section v-if="!('error' in parsed)" class="panel">
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__label">网络地址</span>
          <span class="stat__value">{{ parsed.network }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">广播地址</span>
          <span class="stat__value">{{ parsed.broadcast }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">子网掩码</span>
          <span class="stat__value">{{ parsed.mask }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">通配符掩码</span>
          <span class="stat__value">{{ parsed.wildcard }}</span>
        </div>
        <div class="stat stat--wide">
          <span class="stat__label">可用主机范围</span>
          <span class="stat__value">{{ parsed.first }} - {{ parsed.last }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">可用主机数</span>
          <span class="stat__value">{{ parsed.usable.toLocaleString() }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">地址总数</span>
          <span class="stat__value">{{ parsed.total.toLocaleString() }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">前缀长度</span>
          <span class="stat__value">/{{ parsed.prefix }}</span>
        </div>
      </div>

      <div class="field">
        <span class="label">二进制</span>
        <pre class="output">IP    {{ parsed.ipBinary }}
掩码  {{ parsed.networkBinary }}</pre>
      </div>

      <div class="row">
        <CopyButton :text="`${parsed.network}/${parsed.prefix}`" label="复制网段" />
        <CopyButton :text="parsed.mask" label="复制掩码" />
        <CopyButton :text="`${parsed.first} - ${parsed.last}`" label="复制主机范围" />
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
</style>
