/**
 * Site external-link configuration.
 *
 * This project loads no external resources: fonts, icons, scripts and styles are
 * all bundled into dist. The only outbound link is the GitHub button in the nav,
 * which is empty by default, so it neither navigates nor makes any network request.
 *
 * For intranet deployments, point the environment variable at an internal repository:
 *   VITE_REPO_URL=http://git.example.internal/toolbox
 */
export const repoUrl = (import.meta.env.VITE_REPO_URL ?? '').trim()
