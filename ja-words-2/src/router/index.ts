import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/directories',
            children: [
                {
                    name: 'Words',
                    path: '/directories/:dir/lessons/:lesson/words',
                    component: () => import('../components/WordList.vue'),
                },
                {
                    name: 'Lesson',
                    path: '/directories/:dir/lessons',
                    component: () => import('../components/DirectoryList.vue'),
                    children: []
                },
                {
                    name: 'Dir',
                    path: '/directories',
                    component: () => import('../components/DirectoryList.vue'),
                    children: [],
                },
            ]
        },
    ]
})

export default router