<script setup lang="ts">
import LogoMark from './LogoMark.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const groups = [
  {
    title: '产品',
    links: ['全部工具', '快捷键'],
  },
  {
    title: '资源',
    links: ['使用文档', '反馈建议'],
  },
  {
    title: '关于',
    links: ['开源协议', '隐私说明'],
  },
]
</script>

<template>
  <footer id="about" class="footer">
    <div class="footer__top">
      <div class="footer__brand">
        <span class="footer__logo">
          <LogoMark />
        </span>
        <p class="footer__name">{{ t('工具盒 Toolbox') }}</p>
        <p class="footer__desc">{{ t('免费开源、本地运行的开发者工具箱。') }}</p>
      </div>

      <div class="footer__groups">
        <div v-for="group in groups" :key="group.title" class="footer__group">
          <p class="footer__group-title">{{ t(group.title) }}</p>
          <a v-for="link in group.links" :key="link" class="footer__link" href="#">
            {{ t(link) }}
          </a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <p class="footer__legal">{{ t('2025 工具盒 Toolbox. 保留所有权利。') }}</p>
      <p class="footer__legal">{{ t('数据本地处理 · 无需注册') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--footer-padding-top) var(--layout-padding-x) var(--footer-padding-bottom);
  display: flex;
  flex-direction: column;
  gap: var(--footer-gap);
  background: var(--color-footer-bg);
  color: var(--color-footer-heading);
}

.footer__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__logo {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-logo);
  background: var(--color-accent);
  color: var(--color-on-ink);
  display: grid;
  place-items: center;
}

.footer__name {
  font-size: var(--fs-footer-logo);
  line-height: var(--lh-footer-name);
  font-weight: var(--fw-bold);
}

.footer__desc {
  font-size: var(--fs-footer);
  line-height: var(--lh-footer);
  font-weight: var(--fw-regular);
  color: var(--color-footer-muted);
}

.footer__groups {
  display: flex;
  gap: var(--footer-groups-gap);
}

.footer__group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__group-title {
  font-size: var(--fs-footer);
  line-height: var(--lh-footer);
  font-weight: var(--fw-semibold);
  color: var(--color-footer-heading);
}

.footer__link {
  font-size: var(--fs-footer);
  line-height: var(--lh-footer);
  font-weight: var(--fw-regular);
  color: var(--color-footer-muted);
  transition: color 0.15s ease;
}

.footer__link:hover {
  color: var(--color-footer-heading);
}

.footer__bottom {
  padding-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.footer__legal {
  font-size: var(--fs-legal);
  line-height: var(--lh-legal);
  font-weight: var(--fw-regular);
  color: var(--color-footer-legal);
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 20px 32px;
  }

  .footer__top {
    flex-direction: column;
    gap: 32px;
  }

  .footer__groups {
    gap: 40px;
    flex-wrap: wrap;
  }

  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
