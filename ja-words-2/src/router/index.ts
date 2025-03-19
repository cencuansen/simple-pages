import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/dirs',
            children: [
                {
                    name: 'Words',
                    path: '/dirs/:dir/lessons/:lesson/words',
                    component: () => import('../components/WordList.vue'),
                },
                {
                    name: 'Lesson',
                    path: '/dirs/:dir/lessons',
                    component: () => import('../components/DirectoryList.vue'),
                    children: []
                },
                {
                    name: 'Dir',
                    path: '/dirs',
                    component: () => import('../components/DirectoryList.vue'),
                    children: [],
                },
            ]
        },
    ]
})

export default router