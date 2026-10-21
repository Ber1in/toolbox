/**
 * 站点外部链接配置。
 *
 * 本项目不加载任何外部资源（字体、图标、脚本、样式全部打包进 dist），
 * 唯一的外链是导航栏的 GitHub 按钮，默认留空 → 不跳转、不发起任何网络请求。
 *
 * 内网部署时可设置环境变量指向内网代码仓库：
 *   VITE_REPO_URL=http://git.example.internal/toolbox
 */
export const repoUrl = (import.meta.env.VITE_REPO_URL ?? '').trim()
