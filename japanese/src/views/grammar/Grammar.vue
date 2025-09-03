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
              <div v-html="grammar.displayTitle"></div>
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
  list = list.map((item) => {
    const highlighted = { ...item }
    const highlight = (text: string) =>
      text?.replace(regex, '<span class="match">$1</span>')
    if (highlighted.displayTitle)
      highlighted.displayTitle = highlight(highlighted.displayTitle)
    if (highlighted.desc) highlighted.desc = highlighted.desc.map(highlight)
    return highlighted
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

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

.pagination {
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  height: var(--pagination-height);
}

.el-pagination {
  margin: 0 auto;
  width: var(--content-max-width);
}
</style>
