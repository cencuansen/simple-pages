import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 暗黑模式CSS
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // Import all icons
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)

// Register all icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')