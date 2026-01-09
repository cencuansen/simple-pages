import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { parseCSV } from './csv-parser'
import { WordService } from './word-service'
import { WORDS_CSV_CONTENT } from './words-data-auto'

// 存储单词数据服务实例
let wordService: WordService | null = null

/**
 * 初始化数据源（在生产环境中应为单次初始化）
 */
async function getWordService(): Promise<WordService> {
  if (!wordService) {
    try {
      const words = await parseCSV(WORDS_CSV_CONTENT)
      wordService = new WordService(words)

    } catch (error) {
      throw error
    }
  }
  return wordService
}

const app = new Hono<{ Bindings: {} }>()

app.use('/api/*', cors())

// 健康检查
app.get('/api/index', async (c) => {
  return c.text('OK')
})

// 获取所有单词（支持分页）
app.get('/api/words', async (c) => {
  try {
    const service = await getWordService()

    const page = Number.parseInt(c.req.query('page') || '1')
    const limit = Number.parseInt(c.req.query('limit') || '50')

    const lesson = c.req.query('lesson')
      ? Number.parseInt(c.req.query('lesson')!)
      : undefined

    const group = c.req.query('group')
      ? Number.parseInt(c.req.query('group')!)
      : undefined

    const pos = c.req.query('pos') || undefined
    const keyword = c.req.query('keyword') || undefined

    // 查询单词
    const words = service.queryWords({
      keyword,
      lesson,
      group,
      pos
    })

    // 分页
    const paginatedResult = service.paginate(words, page, limit)

    return c.json({
      success: true,
      ...paginatedResult
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch words'
      },
      500
    )
  }
})

// 获取单个单词详情
app.get('/api/words/:textId', async (c) => {
  try {
    const service = await getWordService()
    const textId = c.req.param('textId')

    const word = service.getWordById(textId)

    if (!word) {
      return c.json(
        {
          success: false,
          error: 'Word not found'
        },
        404
      )
    }

    return c.json({
      success: true,
      data: word
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch word'
      },
      500
    )
  }
})

// 搜索单词（全文搜索）
app.get('/api/search', async (c) => {
  try {
    const service = await getWordService()
    const query = c.req.query('q')

    if (!query) {
      return c.json(
        {
          success: false,
          error: 'Search query is required'
        },
        400
      )
    }

    const words = service.searchWords(query)

    return c.json({
      success: true,
      query,
      total: words.length,
      data: words
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to search words'
      },
      500
    )
  }
})

// 获取课程列表
app.get('/api/lessons', async (c) => {
  try {
    const service = await getWordService()

    const lessons = service.getLessonList()

    return c.json({
      success: true,
      total: lessons.length,
      data: lessons
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch lessons'
      },
      500
    )
  }
})

// 获取分组列表
app.get('/api/groups', async (c) => {
  try {
    const service = await getWordService()

    const groups = service.getGroupList()

    return c.json({
      success: true,
      total: groups.length,
      data: groups
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch groups'
      },
      500
    )
  }
})

// 获取词性列表
app.get('/api/poses', async (c) => {
  try {
    const service = await getWordService()

    const poses = service.getPOSList()

    return c.json({
      success: true,
      total: poses.length,
      data: poses
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch poses'
      },
      500
    )
  }
})

export default app
