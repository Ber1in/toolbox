/**
 * Site external-link configuration.
 *
 * This project loads no external resources: fonts, icons, scripts and styles are
 * all bundled into dist. The only outbound link is the GitHub button in the nav,
 * and no request is made until it is clicked.
 *
 * The button opens the public repository by default. For intranet mirrors,
 * override it with the VITE_REPO_URL environment variable:
 *   VITE_REPO_URL=http://git.example.internal/toolbox
 */
const DEFAULT_REPO_URL = 'https://github.com/Ber1in/toolbox'

export const repoUrl = (import.meta.env.VITE_REPO_URL || DEFAULT_REPO_URL).trim()
