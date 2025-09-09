<template>
  <div class="grammar">
    <Row v-if="functionGroup">
      <LessonSelect v-model="lessonIndex" v-if="lessonSelect" />
      <SimpleSelect
        v-if="levelSelect"
        multiple
        :data="levels"
        v-model="selectedLevels"
        placeholder="选等级"
      />
      <SimpleInput v-model.trim="keyword" v-if="keywordFilter" />
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
                <div class="grammar-lesson" v-if="grammar.lesson">
                  {{ grammar.lesson }}
                </div>
                <div class="grammar-level" v-if="grammar.level">
                  {{ grammar.level }}
                </div>
              </div>
            </template>
            <el-form>
              <div v-for="row in grammar.desc" v-html="row"></div>
              <div v-if="grammar.example">{{ grammar.example }}</div>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <SimplePagination
      v-if="pagination"
      :data="beforePage"
      @page-change="pageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref, watch, withDefaults } from 'vue'
import { type Grammar } from '../../stores/grammar/grammarStore.ts'
import Row from '../../components/Row.vue'
import LessonSelect from '../../components/LessonSelect.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import { collapseTitle } from './index.ts'
import SimpleSelect from '../../components/SimpleSelect.vue'

interface GrammarProps {
  data: Grammar[]
  keyword?: string
  scrollTop?: boolean
  functionGroup?: boolean
  lessonIndex?: number | null | undefined
  pagination?: boolean
  lessonSelect?: boolean
  levelSelect?: boolean
  keywordFilter?: boolean
}

const props = withDefaults(defineProps<GrammarProps>(), {
  keyword: '',
  scrollTop: false,
  functionGroup: false,
  lessonIndex: null,
  pagination: false,
  lessonSelect: false,
  levelSelect: false,
  keywordFilter: false,
})

watch(
  () => props.data,
  () => {
    if (props.lessonIndex !== undefined && props.lessonIndex !== null) {
      lessonIndex.value = props.lessonIndex
    }
    if (props.keyword) {
      keyword.value = props.keyword
    }
    if (!props.pagination) {
      afterPage.value = beforePage.value
    }
  }
)

const keyword = ref('')

const lessonIndex = ref<null | number>(null)

const beforePage = computed(() => {
  let list = props.data
  const key = keyword.value
  if (lessonIndex.value) {
    list = list.filter((item) => item.lesson === lessonIndex.value)
  }
  if (key) {
    list = list.filter((item) =>
      `${item.lesson}${item.title}${item.desc}`.includes(key)
    )
  }
  if (selectedLevels.value.length) {
    list = list.filter((item) => selectedLevels.value.includes(item.level))
  }
  list.forEach((item) => {
    item.displayTitle = item.title
  })
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
  const highlight = (text: string) =>
    text?.replace(regex, '<span class="match">$1</span>')

  list = list.map((item) => {
    const tem = { ...item }
    tem.displayTitle = highlight(tem.displayTitle)
    tem.desc = tem.desc.map(highlight)
    return tem
  })
  return list
})

const expands = ref<string[]>([])

const selectedLevels = ref<string[]>([])

const levels: ComputedRef<string[]> = computed(() => {
  return [...new Set(props.data.map((x) => x.level))].sort()
})

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
/*
.grammar {
  width: 100%;
  height: 100%;
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
*/

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
