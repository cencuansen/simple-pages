<template>
  <div class="grammar">
    <Row>
      <LessonSelect v-model="lessonIndex" />
      <SimpleInput v-model.trim="keyword" />
    </Row>

    <div class="grammar-main">
      <div class="main">
        <el-collapse v-model="expands" :expand-icon-position="'left'">
          <el-collapse-item
            v-for="grammar in afterPage"
            :name="collapseTitle(grammar.title, grammar.idx)"
          >
            <template #title>
              <div class="grammar-title-row">
                <div class="grammar-title" v-html="grammar.displayTitle"></div>
                <div class="grammar-lesson">{{ grammar.lesson }}</div>
              </div>
            </template>
            <div v-for="row in grammar.desc" v-html="row"></div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Grammar, useGrammarStore } from '../../stores/grammarStore.ts'
import Row from '../../components/Row.vue'
import LessonSelect from '../../components/LessonSelect.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import { collapseTitle } from './index.ts'

const grammarStore = useGrammarStore()
const keyword = ref('')

const lessonIndex = ref<null | number>(null)

const beforePage = computed(() => {
  let list = grammarStore.grammars
  const key = keyword.value
  if (lessonIndex.value) {
    list = list.filter((item) => item.lesson === lessonIndex.value)
  }
  if (key) {
    list = list.filter((item) =>
      `${item.lesson}${item.title}${item.desc}`.includes(key)
    )
  }
  list.forEach((item) => {
    item.displayTitle = item.title
  })
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
  const highlight = (text: string) =>
    text?.replace(regex, '<span class="match">$1</span>')

  list = list.map((item) => {
    const tem = {...item}
    tem.displayTitle = highlight(tem.displayTitle)
    tem.desc = tem.desc.map(highlight)
    return tem
  })
  return list
})

const expands = ref<string[]>([])

// 当前页数据
const afterPage = ref<Grammar[]>([])
const pageChange = (data: Grammar[]) => {
  afterPage.value = data
  expands.value = afterPage.value.map((grammar) =>
    collapseTitle(grammar.title, grammar.idx)
  )
}
</script>

<style scoped>
.grammar {
  width: 100%;
  height: 100%;
  position: fixed;
}

.grammar-main {
  overflow-y: scroll;
  height: calc(
    100vh - var(--root-header-height) - var(--single-row-header-height) -
      var(--pagination-height) - var(--root-footer-height)
  );
}

.main {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.grammar-title-row {
  display: flex;
}

.grammar-title {
  flex: 9;
}

.grammar-lesson {
  flex: 1;
  text-align: right;
}
</style>
