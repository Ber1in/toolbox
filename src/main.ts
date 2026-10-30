import { createApp } from 'vue'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/tool.css'
import './styles/markdown.css'

import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
