import { createRouter, createWebHistory } from 'vue-router'
import Lesson from '../views/lesson/Lesson.vue'
import Word from '../views/word/Word.vue'
import JlptWord from '../views/word/JlptWord.vue'
import Tool from '../views/tool/Tool.vue'
import Setting from '../views/setting/Setting.vue'
import Grammar from '../views/grammar/Grammar.vue'
import JlptGrammar from '../views/grammar/JlptGrammar.vue'
import VerbConju from '../views/verbConju/VerbConju.vue'

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
