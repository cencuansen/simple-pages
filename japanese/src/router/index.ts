import { createRouter, createWebHistory } from 'vue-router'
import Lesson from '../components/Lesson.vue'
import Word from '../components/Word.vue'
import JlptWord from '../components/JlptWord.vue'
import Tool from '../components/Tool.vue'
import Setting from '../components/Setting.vue'
import Grammar from '../components/Grammar.vue'
import JlptGrammar from '../components/JlptGrammar.vue'
import VerbConju from '../components/VerbConju.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/lesson',
    },
    {
      path: '/lesson/:index?',
      component: Lesson,
      name: 'lesson',
      props: true,
    },
    {
      path: '/word',
      component: Word,
    },
    {
      path: '/jlpt-word',
      component: JlptWord,
    },
    {
      path: '/grammar',
      component: Grammar,
    },
    {
      path: '/jlpt-grammar',
      component: JlptGrammar,
    },
    {
      path: '/verb-conju',
      component: VerbConju,
    },
    {
      path: '/tool',
      component: Tool,
    },
    {
      path: '/setting',
      component: Setting,
    },
  ],
})

export default router
