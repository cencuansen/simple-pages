import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './style.css'
import './styles/element/index.scss'

import ElementPlus from 'element-plus'

import piniaPersist from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'
import vFocus from './directives/focus'
import { selectContextMenuEnhanced as selectContextMenu } from './directives/selectContextMenu'

const pinia = createPinia()
pinia.use(piniaPersist)

createApp(App)
  .use(ElementPlus, {})
  .use(pinia)
  .use(router)
  .directive('focus', vFocus)
  .directive('select-context-menu', selectContextMenu)
  .mount('#app')
