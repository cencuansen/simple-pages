<template>
  <el-form>
    <el-form-item label="切换主题">
      <el-switch
        v-model="darkMode"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
      />
    </el-form-item>
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
    <el-form-item label="单词假名">
      <el-switch v-model="settingStore.kana" inline-prompt />
    </el-form-item>
    <el-form-item label="单词释义">
      <el-switch v-model="settingStore.wordDesc" inline-prompt />
    </el-form-item>
    <el-form-item label="默认词典">
      <el-select fit-input-width v-model="dictionary">
        <el-option
          v-for="dict in dictionaries"
          :label="[dict.name, dict.desc].join(' - ')"
          :value="dict.name"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useSettingStore } from '../../stores/settingStore.ts'
import { useDictionaryStore } from '../../stores/dictionaryStore.ts'
import { storeToRefs } from 'pinia'

const settingStore = useSettingStore()
const { isDark } = storeToRefs(settingStore)
const toggleDark = settingStore.toggleDark

const dictionaryStore = useDictionaryStore()
const { dictionary, dictionaries } = storeToRefs(dictionaryStore)

const darkMode = computed({
  get: () => isDark.value,
  set: (val) => toggleDark(val),
})
</script>

<style scoped></style>
