<template>
  <el-form>
    <el-form>
      <el-form-item label="课程">
        <div class="sub-form-item">
          <el-form-item label="显示注音">
            <el-switch v-model="settingStore.furigana" inline-prompt />
          </el-form-item>
          <el-form-item label="单词跳转">
            <el-switch v-model="settingStore.wordLink" inline-prompt />
          </el-form-item>
          <el-form-item label="翻译功能">
            <el-switch v-model="settingStore.translate" inline-prompt />
          </el-form-item>
          <el-form-item label="显示单词">
            <el-switch v-model="settingStore.word" inline-prompt />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="单词">
        <div class="sub-form-item">
          <el-form-item label="单词假名">
            <el-switch v-model="settingStore.kana" inline-prompt />
          </el-form-item>
          <el-form-item label="单词释义">
            <el-switch v-model="settingStore.wordDesc" inline-prompt />
          </el-form-item>
          <el-form-item label="默认词典">
            <el-select
              class="dict-selector"
              fit-input-width
              v-model="selectedDictionary"
              default-first-option
            >
              <el-option
                v-for="dict in dictionaries"
                :key="dict.name"
                :label="[dict.name, dict.desc].join(' - ')"
                :value="dict.name"
                class="option"
              >
                <img :src="dict.logo" :alt="dict.label" />
                <span>{{ [dict.name, dict.desc].join(' - ') }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="其他">
        <div class="sub-form-item">
          <el-form-item label="切换主题">
            <el-switch
              v-model="darkMode"
              inline-prompt
              :active-icon="Moon"
              :inactive-icon="Sunny"
            />
          </el-form-item>
        </div>
      </el-form-item>
    </el-form>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useSettingStore } from '@/stores/settingStore.ts'
import { useDictionaryStore } from '@/stores/dictionaryStore.ts'
import { storeToRefs } from 'pinia'

const settingStore = useSettingStore()
const { isDark } = storeToRefs(settingStore)
const toggleDark = settingStore.toggleDark

const dictionaryStore = useDictionaryStore()
const { dictionary, dictionaries } = storeToRefs(dictionaryStore)
const { setOne } = dictionaryStore

const darkMode = computed({
  get: () => isDark.value,
  set: (val) => toggleDark(val),
})

const selectedDictionary = computed({
  get: () => dictionary.value.name,
  set: (val) => setOne(val),
})
</script>

<style scoped>
.sub-form-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
}

.dict-selector {
  width: 100%;
  max-width: 300px;
}

.option {
  display: flex;
  gap: var(--gap12);
  align-items: center;
}

.option img {
  width: 19px;
  height: 19px;
  object-fit: cover;
  border-radius: 5px;
}
</style>
