<template>
  <div class="tab-pane" v-loading="loading">
    <div class="row">
      <el-input
        type="textarea"
        v-model="text"
        :autosize="{ minRows: 5, maxRows: 10 }"
        placeholder="请输入日文汉字词、句子或假名"
        resize="none"
        show-word-limit
        maxlength="500"
        clearable
      />
      <div class="input-hint">
        <el-text type="info" size="small">
          支持汉字词、假名转换，最大长度500字符
        </el-text>
      </div>
    </div>

    <div class="row button-group">
      <el-button-group>
        <el-button type="primary" :disabled="!text" @click="toFurigana(text)">
          振假名
        </el-button>
        <el-button :disabled="!text" @click="toHiraganaFunc(text)">
          平假名
        </el-button>
        <el-button :disabled="!text" @click="toKatakanaFunc(text)">
          片假名
        </el-button>
        <el-button :disabled="!text" @click="toRomajiFunc(text)">
          罗马音
        </el-button>
      </el-button-group>

      <div class="quick-actions">
        <el-button
          type="info"
          size="small"
          plain
          @click="text = ''"
          :icon="Delete"
        >
          清空
        </el-button>
        <el-button
          type="success"
          size="small"
          plain
          @click="copyAllResults"
          :disabled="!hasResults"
          :icon="CopyDocument"
        >
          复制结果
        </el-button>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div class="results-container" v-if="hasResults">
      <el-tabs v-model="activeTab" class="results-tabs">
        <el-tab-pane
          label="振假名"
          name="furigana"
          v-if="furiganaResult.hiragana"
        >
          <div class="tab-content">
            <div class="result-section">
              <el-text type="primary" size="small" tag="strong"
                >平假名:</el-text
              >
              <div class="result-display">
                <el-text v-html="furiganaResult.hiragana" />
                <el-button
                  size="small"
                  :icon="CopyDocument"
                  @click="copyText(furiganaResult.hiragana)"
                  class="copy-btn"
                />
              </div>
            </div>

            <div class="result-section">
              <el-text type="primary" size="small" tag="strong"
                >送假名:</el-text
              >
              <div class="result-display">
                <el-text v-html="furiganaResult.okurigana" />
                <el-button
                  size="small"
                  :icon="CopyDocument"
                  @click="copyText(furiganaResult.okurigana)"
                  class="copy-btn"
                />
              </div>
            </div>

            <div class="result-section">
              <el-text type="primary" size="small" tag="strong"
                >振假名 (带注音):</el-text
              >
              <div class="result-display ruby-display">
                <el-text v-html="process(furiganaResult.furigana)" />
                <el-button
                  size="small"
                  :icon="CopyDocument"
                  @click="copyText(removeRubyTags(furiganaResult.furigana))"
                  class="copy-btn"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="平假名" name="hiragana" v-if="toHiraganaResult">
          <div class="tab-content">
            <div class="result-display full-width">
              <el-text v-html="toHiraganaResult" />
              <el-button
                type="primary"
                :icon="CopyDocument"
                @click="copyText(toHiraganaResult)"
                class="copy-btn-large"
              />
            </div>
            <div class="result-info">
              <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                平假名主要用于标注日文发音
              </el-text>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="片假名" name="katakana" v-if="toKatakanaResult">
          <div class="tab-content">
            <div class="result-display full-width">
              <el-text v-html="toKatakanaResult" />
              <el-button
                type="primary"
                :icon="CopyDocument"
                @click="copyText(toKatakanaResult)"
                class="copy-btn-large"
              />
            </div>
            <div class="result-info">
              <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                片假名主要用于外来语和强调
              </el-text>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="罗马音" name="romaji" v-if="toRomajiResult">
          <div class="tab-content">
            <div class="result-display full-width">
              <el-text v-html="toRomajiResult" />
              <el-button
                type="primary"
                :icon="CopyDocument"
                @click="copyText(toRomajiResult)"
                class="copy-btn-large"
              />
            </div>
            <div class="result-info">
              <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                罗马音用于标注日文发音的国际音标
              </el-text>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="results-summary">
        <el-text type="info" size="small">
          已生成 {{ activeResultsCount }} 种转换结果
        </el-text>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div class="empty-state" v-else>
      <el-empty description="输入文本后点击上方按钮进行转换">
        <template #image>
          <el-icon :size="80"><EditPen /></el-icon>
        </template>
        <div class="example-texts">
          <el-text type="info" size="small">示例：</el-text>
          <div class="examples">
            <el-tag
              size="small"
              type="info"
              effect="plain"
              @click="text = '日本語'"
              class="example-tag"
            >
              日本語
            </el-tag>
            <el-tag
              size="small"
              type="info"
              effect="plain"
              @click="text = 'おはようございます'"
              class="example-tag"
            >
              おはようございます
            </el-tag>
            <el-tag
              size="small"
              type="info"
              effect="plain"
              @click="text = 'コンピュータ'"
              class="example-tag"
            >
              コンピュータ
            </el-tag>
          </div>
        </div>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref, computed } from 'vue'
import ky from 'ky'
import { toHiragana, toKatakana, toRomaji } from '@/utils/tool'
import {
  Delete,
  CopyDocument,
  InfoFilled,
  EditPen,
} from '@element-plus/icons-vue'

const loading = ref(false)
const text = ref('')
const activeTab = ref('furigana')
const furiganaResult = ref({
  hiragana: '',
  okurigana: '',
  furigana: '',
})
const toHiraganaResult = ref('')
const toKatakanaResult = ref('')
const toRomajiResult = ref('')

// 计算属性
const hasResults = computed(() => {
  return (
    furiganaResult.value.hiragana ||
    toHiraganaResult.value ||
    toKatakanaResult.value ||
    toRomajiResult.value
  )
})

const activeResultsCount = computed(() => {
  let count = 0
  if (furiganaResult.value.hiragana) count++
  if (toHiraganaResult.value) count++
  if (toKatakanaResult.value) count++
  if (toRomajiResult.value) count++
  return count
})

// const hiraganaUrl = "https://kuroshiro-vercel.vercel.app/hiragana";
const hiraganaUrl = 'https://kuroshiro.chengshen.me/hiragana'

const toFurigana = async (text: string) => {
  if (!text) {
    return
  }
  loading.value = true
  try {
    const response = await ky.post(hiraganaUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
      }),
      timeout: 15000,
    })
    const data: any = await response.json()

    furiganaResult.value.hiragana = data.hiragana
    furiganaResult.value.furigana = data.furigana
    furiganaResult.value.okurigana = data.okurigana

    // 切换到振假名标签页
    activeTab.value = 'furigana'

    ElMessage.success('振假名转换完成')
  } catch (err: any) {
    if (err.message.includes('timed out')) {
      ElMessage.error('请求超时')
    } else {
      ElMessage.error(err.message)
    }
  } finally {
    loading.value = false
  }
}

const process = (text: string): string => {
  return text?.replace(/<rt>(.*?)<\/rt>/g, '<rt d="$1"></rt>')
}

const removeRubyTags = (text: string): string => {
  // 移除ruby标签，只保留文本内容
  return text
    .replace(/<ruby>/g, '')
    .replace(/<\/ruby>/g, '')
    .replace(/<rp>.*?<\/rp>/g, '')
    .replace(/<rt>.*?<\/rt>/g, '')
}

const toHiraganaFunc = (text: string) => {
  toHiraganaResult.value = toHiragana(text)
  activeTab.value = 'hiragana'
}

const toKatakanaFunc = (text: string) => {
  toKatakanaResult.value = toKatakana(text)
  activeTab.value = 'katakana'
}

const toRomajiFunc = (text: string) => {
  toRomajiResult.value = toRomaji(text)
  activeTab.value = 'romaji'
}

const copyText = (text: string) => {
  if (!text) return

  // 移除HTML标签，只复制纯文本
  const plainText = text.replace(/<[^>]*>/g, '')

  navigator.clipboard
    .writeText(plainText)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const copyAllResults = () => {
  let allText = ''

  if (furiganaResult.value.hiragana) {
    allText += `振假名（平假名）:\n${furiganaResult.value.hiragana}\n\n`
    allText += `振假名（送假名）:\n${furiganaResult.value.okurigana}\n\n`
    allText += `振假名（带注音）:\n${removeRubyTags(furiganaResult.value.furigana)}\n\n`
  }

  if (toHiraganaResult.value) {
    allText += `平假名:\n${toHiraganaResult.value}\n\n`
  }

  if (toKatakanaResult.value) {
    allText += `片假名:\n${toKatakanaResult.value}\n\n`
  }

  if (toRomajiResult.value) {
    allText += `罗马音:\n${toRomajiResult.value}\n`
  }

  copyText(allText)
}
</script>

<style scoped>
.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-container {
  margin-top: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  background-color: var(--el-bg-color-page);
}

.results-tabs {
  min-height: 200px;
}

.tab-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  min-height: 60px;
}

.ruby-display {
  font-size: 1.4em;
  line-height: 1.8;
}

.full-width {
  min-height: 100px;
  align-items: flex-start;
}

.copy-btn {
  flex-shrink: 0;
  margin-left: 12px;
}

.copy-btn-large {
  align-self: flex-end;
  margin-top: 12px;
}

.result-info {
  padding: 8px 12px;
  background-color: var(--el-color-info-light-9);
  border-radius: 4px;
  border-left: 4px solid var(--el-color-info);
}

.results-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
  text-align: center;
}

.empty-state {
  margin-top: 40px;
  text-align: center;
}

.example-texts {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.examples {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.example-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.example-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-pane {
    padding: 12px;
    gap: 16px;
  }

  .button-group :deep(.el-button-group) {
    display: flex;
    flex-wrap: wrap;
  }

  .result-display {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .copy-btn {
    align-self: flex-end;
    margin-left: 0;
  }
}
</style>
