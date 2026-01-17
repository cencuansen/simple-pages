<template>
  <div class="grammar">
    <Row v-if="functionGroup">
      <LessonSelect v-model="lessonIndex" fit-input-width v-if="lessonSelect" />
      <SimpleSelect
        v-if="levelSelect"
        multiple
        :data="levels"
        v-model="selectedLevels"
        placeholder="选等级"
      />
      <SimpleInput v-model.trim="keyword" v-if="keywordFilter" />
    </Row>

    <div class="grammar-main" ref="container" @scroll="onScroll">
      <div class="main">
        <el-collapse v-model="expands" :expand-icon-position="'left'">
          <el-collapse-item
            v-for="grammar in afterPageView"
            :name="collapseTitle(grammar.title, grammar.idx)"
          >
            <template #title>
              <div class="grammar-title-row">
                <div class="grammar-title" v-html="grammar.title"></div>
                <div class="grammar-lesson" v-if="grammar.lesson && showLesson">
                  <a href="#" @click.stop.prevent="lessonClick(grammar.lesson)">
                    {{ grammar.lesson }}
                  </a>
                </div>
                <div class="grammar-level" v-if="grammar.level">
                  {{ grammar.level }}
                </div>
              </div>
            </template>
            <div class="grammar-content">
              <div v-for="row in grammar.desc" v-html="row"></div>
              <div v-if="grammar.example">{{ grammar.example }}</div>
            </div>
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
import { computed, type ComputedRef, onActivated, ref, withDefaults } from 'vue'
import { type Grammar } from '@/stores/grammar/grammarStore'
import Row from '../Row.vue'
import LessonSelect from '../LessonSelect.vue'
import SimpleInput from '../SimpleInput.vue'
import SimplePagination from '../SimplePagination.vue'
import { collapseTitle } from '../../utils/grammar'
import SimpleSelect from '../SimpleSelect.vue'
import { isNumber } from '@/utils/common'

interface GrammarProps {
  data: Grammar[]
  autoExpand?: boolean
  showLesson?: boolean
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
  autoExpand: false,
  showLesson: false,
  scrollTop: false,
  functionGroup: false,
  lessonIndex: null,
  pagination: false,
  lessonSelect: false,
  levelSelect: false,
  keywordFilter: false,
})

const keyword = ref('')
const lessonIndex = ref<number | undefined>()

const beforePage = computed(() => {
  let list = props.data
  if (isNumber(props.lessonIndex)) {
    list = list.filter((item) => item.lesson === props.lessonIndex)
  }
  if (props.keyword) {
    list = list.filter((item) =>
      `${item.lesson}${item.title}${item.desc}`.includes(props.keyword)
    )
  }
  if (isNumber(lessonIndex.value)) {
    list = list.filter((item) => item.lesson === lessonIndex.value)
  }
  if (keyword.value) {
    list = list.filter((item) =>
      `${item.lesson}${item.title}${item.desc}`.includes(keyword.value)
    )
  }
  if (selectedLevels.value.length) {
    list = list.filter((item) => selectedLevels.value.includes(item.level))
  }
  const regex = new RegExp(`(${keyword.value})`, 'g') // 添加捕获组
  const highlight = (text: string) =>
    text?.replace(
      regex,
      '<span style="color:var(--el-color-primary)">$1</span>'
    )

  list = list.map((item) => {
    const tem = { ...item }
    tem.title = highlight(tem.title)
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
  if (props.autoExpand) {
    expands.value = afterPage.value.map((grammar) =>
      collapseTitle(grammar.title, grammar.idx)
    )
  } else {
    expands.value = []
  }
  container.value.scrollTop = 0
}

const afterPageView = computed(() => {
  if (props.pagination) {
    return afterPage.value
  }
  return beforePage.value
})

const lessonClick = (val: number) => {
  if (isNumber(lessonIndex.value)) {
    lessonIndex.value = void 0
  } else {
    lessonIndex.value = val
  }
}

const container = ref()
const scrollPosition = ref<number>(0)
const onScroll = async () => {
  if (props.scrollTop) {
    scrollPosition.value = container.value.scrollTop
  }
}
onActivated(async () => {
  if (props.scrollTop) {
    setTimeout(() => {
      if (container && container.value) {
        container.value.scrollTop = scrollPosition.value
      }
    })
  }
})
</script>

<style scoped>
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

.grammar-main {
  padding-top: 5px;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

.grammar-content {
  padding: 10px;
  height: 100%;
  background-color: var(--el-color-info-light-9);
}

.grammar-title-row,
.grammar-content {
  font-size: 1.5rem;
}
</style>
