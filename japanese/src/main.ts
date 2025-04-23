import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/icons/iconfont.css'
import piniaPersist from 'pinia-plugin-persistedstate'

import {createPinia} from 'pinia'

const pinia = createPinia()
pinia.use(piniaPersist)

createApp(App)
    .use(ElementPlus)
    .use(pinia)
    .mount('#app')
