#!/usr/bin/env node

/**
 * 读取CSV文件并生成可直接导入的数据模块
 */

import fs from 'fs'
import path from 'path'

async function generateDataModule() {
  try {
    const csvPath = './public/words.csv'
    const csvContent = fs.readFileSync(csvPath, 'utf-8')

    const moduleContent = `/**
 * Auto-generated CSV data module
 * Generated at: ${new Date().toISOString()}
 */

export const WORDS_CSV_CONTENT = \`${csvContent.replace(/`/g, '\\`')}\`
`

    const outputPath = './src/words-data-auto.ts'
    fs.writeFileSync(outputPath, moduleContent)

    console.log(`✓ Generated data module at ${outputPath}`)
    console.log(`✓ Loaded ${csvContent.split('\n').length - 1} records from CSV`)

    return outputPath
  } catch (error) {
    console.error('Failed to generate data module:', error)
    throw error
  }
}

await generateDataModule()
