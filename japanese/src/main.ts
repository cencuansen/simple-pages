import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/icons/iconfont.css'
import piniaPersist from 'pinia-plugin-persistedstate'
import {createPinia} from 'pinia'
import vFocus from './directives/focus'

const pinia = createPinia()
pinia.use(piniaPersist)

createApp(App)
    .use(ElementPlus)
    .use(pinia)
    .use(router)
    .directive('focus', vFocus)
    .mount('#app')
