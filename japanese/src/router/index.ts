import { createRouter, createWebHistory } from 'vue-router'
import Lesson from '../components/Lesson.vue'
import Word from '../components/Word.vue'
import Tool from '../components/Tool.vue'
import Setting from '../components/Setting.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/lesson'
        },
        {
            path: '/lesson',
            component: Lesson
        },
        {
            path: '/word',
            component: Word
        },
        {
            path: '/tool',
            component: Tool
        },
        {
            path: '/setting',
            component: Setting
        }
    ]
})

export default router
