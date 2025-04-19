<template>
  <div class="lesson-header-container">
    <div class="lesson-header navigation-buttons">
      <el-select size="small" class="navigation-item" v-model="lessonIndex" fit-input-width clearable
                 placeholder="选课程">
        <el-option
            v-for="index in wordStore.lessonCount"
            :key="index"
            :label="`第 ${index} 课`"
            :value="index"
        />
      </el-select>
      <el-input v-model="keyword" size="small" placeholder="搜单词" clearable></el-input>
      <el-button
          size="small"
          class="previous-button navigation-item"
          :disabled="lessonIndex === 1 || (!lessonIndex && pageIndex === 1)"
          @click="goPrevious"
      >
        上一页
      </el-button>
      <el-button
          size="small"
          class="next-button navigation-item"
          :disabled="lessonIndex === maxPage || (!lessonIndex && pageIndex === maxPage)"
          @click="goNext"
      >
        下一页
      </el-button>
    </div>
  </div>

  <div ref="container" class="lesson-container">
    <div ref="top"></div>
    <!-- 单词 -->
    <section class="section words-section">
      <el-table :data="words">
        <el-table-column label="单词" show-overflow-tooltip>
          <template #default="scope">
            <div :id="`word-${scope.row.word}`" class="column-word"
                 :class="{'speaking-active': speechStore.isTextSpeaking(scope.row.kana)}">{{ scope.row.word }}
            </div>
            <div :id="`word-${scope.row.kana}`" class="column-kana"
                 :class="{'speaking-active': speechStore.isTextSpeaking(scope.row.kana)}">{{ scope.row.kana }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义" width="200" show-overflow-tooltip/>
        <el-table-column label="" width="40" v-if="!lessonIndex" show-overflow-tooltip>
          <template #default="scope">
            {{ wordStore.realLessonNumber(scope.row.lesson) }}
          </template>
        </el-table-column>
        <el-table-column label="" width="50" v-if="baseSettingStore.speak">
          <template #header>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="baseSettingStore.speak && lessonIndex"
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speakList(getSpeechTextList(words.map(w => w.kana)))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </template>
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                circle
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(scope.row.kana)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>

  <a class="go-top" href="#" @click="goTop">↑</a>
</template>

<script setup lang="ts">
import {VideoPlay} from '@element-plus/icons-vue'
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {useSpeechStore} from "../stores/speechStore"
import {useBaseSettingStore} from "../stores/baseSettingStore"
import {useWordStore, type WordItem} from "../stores/wordStore"

const speechStore = useSpeechStore()
const wordStore = useWordStore()
const baseSettingStore = useBaseSettingStore()

const lessonIndex = ref()
const pageIndex = ref(1)
const keyword = ref("")

const maxPageSize = 20

const container = ref()
const top = ref()

watch(() => speechStore.speakingText, (value) => {
  let id = `#word-${value}`
  if (kanaWordMap.value.has(value)) {
    id = `#word-${kanaWordMap.value.get(value)}`
  }
  container.value.querySelector(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  });
});

const goPrevious = async () => {
  if (lessonIndex.value) {
    lessonIndex.value--
  } else {
    pageIndex.value--
  }
}

const goNext = async () => {
  if (lessonIndex.value) {
    lessonIndex.value++
  } else {
    pageIndex.value++
  }
}

const maxPage = computed(() => {
  if (lessonIndex.value) {
    pageIndex.value = 1
    return wordStore.lessonCount
  }
  return Math.ceil(wordStore.wordList.length / maxPageSize)
})

const words = computed(() => {
  let list: WordItem[]
  let index
  let size
  if (lessonIndex.value) {
    list = wordStore.getByLesson(lessonIndex.value)
    index = 1
    size = list.length
  } else {
    list = wordStore.wordList
    index = pageIndex.value
    size = maxPageSize
  }
  if (keyword.value) {
    list = list.filter(item => item.kana.indexOf(keyword.value) > -1
        || item.kanji.indexOf(keyword.value) > -1
        || item.desc.indexOf(keyword.value) > -1
        || item.word.indexOf(keyword.value) > -1
    )
  }
  let skip = (index - 1) * size
  return list.slice(skip, index * size)
})

const kanaWordMap = computed(() => {
  const map = new Map()
  words.value.forEach(item => {
    map.set(item.kana, item.word)
  })
  return map
})

const getSpeechText = (text: string | undefined = "") => text.replace(/![^(]+\(([^)]+)\)/g, '$1')
const getSpeechTextList = (arr: string[] = []) => arr.map(getSpeechText)

const goTop = () => {
  top.value.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}

onBeforeUnmount(() => {
  speechStore.stop()
})

</script>

<style scoped>
.lesson-header-container {
  overflow-y: scroll;
}

.lesson-header {
  display: flex;
  margin: 10px auto;
  padding: 0 5px;
  max-width: var(--content-max-width);
}

.lesson-header > * {
  margin-right: 10px;
}

.lesson-header > *:last-child {
  margin-right: 0;
}

.lesson-container {
  width: 100vw;
  overflow-y: scroll;
  margin: 0 auto;
  position: fixed;
  padding-bottom: 120px;
  height: calc(100vh - 85px);
}

.lesson-container > * {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.speaking-active {
  color: var(--el-color-success);
}

.go-top {
  position: absolute;
  bottom: 15%;
  right: 15%;
  width: 30px;
  height: 30px;
  border: 1px solid #aaa;
  border-radius: 50%;
  line-height: 25px;
  text-align: center;
  user-select: none;
  z-index: 999;
  color-scheme: inherit;
  font-weight: bolder;
  font-size: 1.5rem;
  color: inherit;
  background-color: inherit;
}
</style>