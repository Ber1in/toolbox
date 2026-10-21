<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const search = ref('')

const codes = [
  { code: 100, name: 'Continue', group: '1xx 信息', note: '已收到请求头，继续发送请求体' },
  { code: 101, name: 'Switching Protocols', group: '1xx 信息', note: '切换协议（如 WebSocket）' },
  { code: 103, name: 'Early Hints', group: '1xx 信息', note: '提前返回资源提示' },
  { code: 200, name: 'OK', group: '2xx 成功', note: '请求成功' },
  { code: 201, name: 'Created', group: '2xx 成功', note: '资源创建成功' },
  { code: 202, name: 'Accepted', group: '2xx 成功', note: '请求已接受，异步处理中' },
  { code: 204, name: 'No Content', group: '2xx 成功', note: '成功但无响应体' },
  { code: 206, name: 'Partial Content', group: '2xx 成功', note: '范围请求成功' },
  { code: 301, name: 'Moved Permanently', group: '3xx 重定向', note: '永久重定向' },
  { code: 302, name: 'Found', group: '3xx 重定向', note: '临时重定向' },
  { code: 303, name: 'See Other', group: '3xx 重定向', note: '用 GET 访问新地址' },
  { code: 304, name: 'Not Modified', group: '3xx 重定向', note: '缓存仍然有效' },
  { code: 307, name: 'Temporary Redirect', group: '3xx 重定向', note: '临时重定向，保持原方法' },
  { code: 308, name: 'Permanent Redirect', group: '3xx 重定向', note: '永久重定向，保持原方法' },
  { code: 400, name: 'Bad Request', group: '4xx 客户端错误', note: '请求语法或参数有误' },
  { code: 401, name: 'Unauthorized', group: '4xx 客户端错误', note: '未认证或凭证无效' },
  { code: 402, name: 'Payment Required', group: '4xx 客户端错误', note: '需要付费（预留）' },
  { code: 403, name: 'Forbidden', group: '4xx 客户端错误', note: '已认证但无权限' },
  { code: 404, name: 'Not Found', group: '4xx 客户端错误', note: '资源不存在' },
  { code: 405, name: 'Method Not Allowed', group: '4xx 客户端错误', note: '请求方法不被允许' },
  { code: 406, name: 'Not Acceptable', group: '4xx 客户端错误', note: '无法满足 Accept 要求' },
  { code: 408, name: 'Request Timeout', group: '4xx 客户端错误', note: '请求超时' },
  { code: 409, name: 'Conflict', group: '4xx 客户端错误', note: '请求与资源当前状态冲突' },
  { code: 410, name: 'Gone', group: '4xx 客户端错误', note: '资源已永久删除' },
  { code: 411, name: 'Length Required', group: '4xx 客户端错误', note: '缺少 Content-Length' },
  { code: 412, name: 'Precondition Failed', group: '4xx 客户端错误', note: '前置条件不满足' },
  { code: 413, name: 'Payload Too Large', group: '4xx 客户端错误', note: '请求体过大' },
  { code: 414, name: 'URI Too Long', group: '4xx 客户端错误', note: 'URI 过长' },
  { code: 415, name: 'Unsupported Media Type', group: '4xx 客户端错误', note: '不支持的媒体类型' },
  { code: 416, name: 'Range Not Satisfiable', group: '4xx 客户端错误', note: '范围请求无法满足' },
  { code: 418, name: "I'm a teapot", group: '4xx 客户端错误', note: '彩蛋状态码' },
  { code: 422, name: 'Unprocessable Entity', group: '4xx 客户端错误', note: '语义校验失败' },
  { code: 425, name: 'Too Early', group: '4xx 客户端错误', note: '请求过早，防止重放' },
  { code: 426, name: 'Upgrade Required', group: '4xx 客户端错误', note: '需要升级协议' },
  { code: 428, name: 'Precondition Required', group: '4xx 客户端错误', note: '要求条件请求' },
  { code: 429, name: 'Too Many Requests', group: '4xx 客户端错误', note: '触发限流' },
  { code: 431, name: 'Request Header Fields Too Large', group: '4xx 客户端错误', note: '请求头过大' },
  { code: 451, name: 'Unavailable For Legal Reasons', group: '4xx 客户端错误', note: '因法律原因不可用' },
  { code: 500, name: 'Internal Server Error', group: '5xx 服务端错误', note: '服务器内部错误' },
  { code: 501, name: 'Not Implemented', group: '5xx 服务端错误', note: '不支持该功能' },
  { code: 502, name: 'Bad Gateway', group: '5xx 服务端错误', note: '网关收到上游无效响应' },
  { code: 503, name: 'Service Unavailable', group: '5xx 服务端错误', note: '服务暂时不可用' },
  { code: 504, name: 'Gateway Timeout', group: '5xx 服务端错误', note: '网关等待上游超时' },
  { code: 505, name: 'HTTP Version Not Supported', group: '5xx 服务端错误', note: 'HTTP 版本不支持' },
  { code: 507, name: 'Insufficient Storage', group: '5xx 服务端错误', note: '存储空间不足' },
  { code: 508, name: 'Loop Detected', group: '5xx 服务端错误', note: '检测到循环' },
  { code: 511, name: 'Network Authentication Required', group: '5xx 服务端错误', note: '需要网络认证（如 WiFi 门户）' },
]

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return codes
  return codes.filter((item) =>
    [String(item.code), item.name, t(item.group), t(item.note)]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})
</script>

<template>
  <section class="panel">
    <label class="field">
      <span class="label">{{ t('搜索状态码 / 关键字') }}</span>
      <input v-model="search" class="input" type="search" :placeholder="t('例如 404、timeout、限流')" />
    </label>

    <p class="hint">{{ t('共 {n} 条记录', { n: filtered.length }) }}</p>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>{{ t('状态码') }}</th>
            <th>{{ t('名称') }}</th>
            <th>{{ t('分类') }}</th>
            <th>{{ t('说明') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.code">
            <td class="mono">{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td class="muted">{{ t(item.group) }}</td>
            <td class="muted">{{ t(item.note) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
