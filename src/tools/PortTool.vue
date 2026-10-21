<script setup lang="ts">
import { computed, ref } from 'vue'

const search = ref('')

const ports = [
  { port: 20, service: 'FTP-Data', protocol: 'TCP', note: 'FTP 数据传输' },
  { port: 21, service: 'FTP', protocol: 'TCP', note: 'FTP 控制连接' },
  { port: 22, service: 'SSH', protocol: 'TCP', note: '安全 shell / SFTP' },
  { port: 23, service: 'Telnet', protocol: 'TCP', note: '明文远程登录（不推荐）' },
  { port: 25, service: 'SMTP', protocol: 'TCP', note: '邮件发送' },
  { port: 53, service: 'DNS', protocol: 'TCP/UDP', note: '域名解析' },
  { port: 67, service: 'DHCP-Server', protocol: 'UDP', note: 'DHCP 服务端' },
  { port: 68, service: 'DHCP-Client', protocol: 'UDP', note: 'DHCP 客户端' },
  { port: 69, service: 'TFTP', protocol: 'UDP', note: '简单文件传输' },
  { port: 80, service: 'HTTP', protocol: 'TCP', note: '明文 Web' },
  { port: 110, service: 'POP3', protocol: 'TCP', note: '邮件接收' },
  { port: 123, service: 'NTP', protocol: 'UDP', note: '时间同步' },
  { port: 135, service: 'MSRPC', protocol: 'TCP', note: 'Windows RPC' },
  { port: 137, service: 'NetBIOS-NS', protocol: 'UDP', note: 'NetBIOS 名称服务' },
  { port: 139, service: 'NetBIOS-SSN', protocol: 'TCP', note: 'NetBIOS 会话服务' },
  { port: 143, service: 'IMAP', protocol: 'TCP', note: '邮件接收' },
  { port: 161, service: 'SNMP', protocol: 'UDP', note: '网络管理' },
  { port: 162, service: 'SNMP-Trap', protocol: 'UDP', note: 'SNMP 告警' },
  { port: 389, service: 'LDAP', protocol: 'TCP', note: '目录服务' },
  { port: 443, service: 'HTTPS', protocol: 'TCP', note: 'TLS Web' },
  { port: 445, service: 'SMB', protocol: 'TCP', note: 'Windows 文件共享' },
  { port: 465, service: 'SMTPS', protocol: 'TCP', note: '加密邮件发送' },
  { port: 514, service: 'Syslog', protocol: 'UDP', note: '系统日志' },
  { port: 587, service: 'SMTP-Submission', protocol: 'TCP', note: '邮件提交' },
  { port: 636, service: 'LDAPS', protocol: 'TCP', note: '加密目录服务' },
  { port: 873, service: 'Rsync', protocol: 'TCP', note: '文件同步' },
  { port: 993, service: 'IMAPS', protocol: 'TCP', note: '加密 IMAP' },
  { port: 995, service: 'POP3S', protocol: 'TCP', note: '加密 POP3' },
  { port: 1080, service: 'SOCKS', protocol: 'TCP', note: 'SOCKS 代理' },
  { port: 1433, service: 'MSSQL', protocol: 'TCP', note: 'SQL Server' },
  { port: 1521, service: 'Oracle', protocol: 'TCP', note: 'Oracle 数据库' },
  { port: 1723, service: 'PPTP', protocol: 'TCP', note: 'VPN（已过时）' },
  { port: 1883, service: 'MQTT', protocol: 'TCP', note: '物联网消息' },
  { port: 2049, service: 'NFS', protocol: 'TCP/UDP', note: '网络文件系统' },
  { port: 2375, service: 'Docker', protocol: 'TCP', note: 'Docker API（未加密）' },
  { port: 2376, service: 'Docker-TLS', protocol: 'TCP', note: 'Docker API（TLS）' },
  { port: 3000, service: 'Dev Server', protocol: 'TCP', note: '常见前端开发端口' },
  { port: 3306, service: 'MySQL', protocol: 'TCP', note: 'MySQL / MariaDB' },
  { port: 3389, service: 'RDP', protocol: 'TCP', note: 'Windows 远程桌面' },
  { port: 5432, service: 'PostgreSQL', protocol: 'TCP', note: 'PostgreSQL 数据库' },
  { port: 5601, service: 'Kibana', protocol: 'TCP', note: 'Kibana 面板' },
  { port: 5672, service: 'AMQP', protocol: 'TCP', note: 'RabbitMQ' },
  { port: 6379, service: 'Redis', protocol: 'TCP', note: 'Redis 数据库' },
  { port: 8080, service: 'HTTP-Alt', protocol: 'TCP', note: '常用 HTTP 备用端口' },
  { port: 8443, service: 'HTTPS-Alt', protocol: 'TCP', note: '常用 HTTPS 备用端口' },
  { port: 9000, service: 'PHP-FPM / MinIO', protocol: 'TCP', note: '应用服务端口' },
  { port: 9092, service: 'Kafka', protocol: 'TCP', note: 'Kafka Broker' },
  { port: 9200, service: 'Elasticsearch', protocol: 'TCP', note: 'ES HTTP API' },
  { port: 11211, service: 'Memcached', protocol: 'TCP/UDP', note: '内存缓存' },
  { port: 27017, service: 'MongoDB', protocol: 'TCP', note: 'MongoDB 数据库' },
]

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return ports
  return ports.filter((item) =>
    [String(item.port), item.service, item.protocol, item.note]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})
</script>

<template>
  <section class="panel">
    <label class="field">
      <span class="label">搜索端口 / 服务</span>
      <input v-model="search" class="input" type="search" placeholder="例如 443、redis、数据库" />
    </label>

    <p class="hint">共 {{ filtered.length }} 条记录</p>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>端口</th>
            <th>服务</th>
            <th>协议</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="`${item.port}-${item.service}`">
            <td class="mono">{{ item.port }}</td>
            <td>{{ item.service }}</td>
            <td class="muted">{{ item.protocol }}</td>
            <td class="muted">{{ item.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
