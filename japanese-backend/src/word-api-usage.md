# 日语单词API使用文档

本API提供了对日语单词CSV文件的查询和管理功能。

## 基础信息

- 基础URL: `http://localhost:5173` (开发环境)
- 所有API端点前缀: `/api`
- 响应格式: JSON

## API端点

### 1. 健康检查

**GET** `/api/index`

检查API是否正常运行。

**响应示例:**
```
OK
```

### 2. 查询单词列表（分页查询）

**GET** `/api/words`

获取单词列表，支持分页和多条件筛选。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认50 |
| keyword | string | 否 | 关键词搜索（匹配单词、假名、释义） |
| lesson | number | 否 | 课程编号筛选 |
| group | number | 否 | 分组编号筛选 |
| pos | string | 否 | 词性筛选（如：名、代、疑） |

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "textId": "i_c618f65eab9f",
      "word": "中国人",
      "kana": "ちゅうごくじん",
      "pos": "名",
      "desc": "中国人",
      "group": 1,
      "lesson": 101
    }
  ],
  "total": 5753,
  "page": 1,
  "limit": 50,
  "totalPages": 116
}
```

### 3. 获取单个单词详情

**GET** `/api/words/:textId`

根据textId获取单个单词的详细信息。

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| textId | string | 是 | 单词的唯一标识符 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "textId": "i_c618f65eab9f",
    "word": "中国人",
    "kana": "ちゅうごくじん",
    "pos": "名",
    "desc": "中国人",
    "group": 1,
    "lesson": 101
  }
}
```

### 4. 搜索单词（全文搜索）

**GET** `/api/search`

根据关键词搜索单词（搜索单词、假名和释义）。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |

**响应示例:**
```json
{
  "success": true,
  "query": "日本人",
  "total": 2,
  "data": [
    {
      "textId": "i_10269f77250a",
      "word": "日本人",
      "kana": "にほんじん",
      "pos": "名",
      "desc": "日本人",
      "group": 1,
      "lesson": 101
    }
  ]
}
```

### 5. 获取课程列表

**GET** `/api/lessons`

获取所有课程编号列表。

**响应示例:**
```json
{
  "success": true,
  "total": 24,
  "data": [101, 102, 103, 104, 105, 106, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218]
}
```

### 6. 获取分组列表

**GET** `/api/groups`

获取所有分组编号列表。

**响应示例:**
```json
{
  "success": true,
  "total": 1,
  "data": [1]
}
```

### 7. 获取词性列表

**GET** `/api/poses`

获取所有词性列表。

**响应示例:**
```json
{
  "success": true,
  "total": 11,
  "data": ["副", "助", "动", "叹", "形", "名", "熟语", "疑", "代", "连", "专"]
}
```

## 词性说明

| 词性代码 | 中文说明 |
|---------|---------|
| 名 | 名词 |
| 代 | 代词 |
| 动 | 动词 |
| 副 | 副词 |
| 叹 | 感叹词 |
| 形 | 形容词 |
| 连 | 连体词 |
| 疑 | 疑问词 |
| 助 | 助词 |
| 熟语 | 惯用语 |
| 专 | 专有名词 |

## 使用示例

### 示例1：分页查询单词列表（不使用筛选条件）

```bash
curl "http://localhost:5173/api/words?page=1&limit=10"
```

### 示例2：根据课程编号筛选单词

```bash
# 查询lesson为101的所有单词
curl "http://localhost:5173/api/words?lesson=101"
```

### 示例3：根据词性筛选单词

```bash
# 查询所有名词（词性为"名"）
curl "http://localhost:5173/api/words?pos=名"
```

### 示例4：关键词搜索

```bash
# 搜索包含"学生"的单词
curl "http://localhost:5173/api/search?q=学生"
```

### 示例5：复合筛选条件

```bash
# 查询lesson为101且词性为名词的所有单词，每页显示20条，查看第2页
curl "http://localhost:5173/api/words?lesson=101&pos=名&page=2&limit=20"
```

### 示例6：获取单个单词详情

```bash
curl "http://localhost:5173/api/words/i_c618f65eab9f"
```

## 错误处理

所有API端点在出错时都会返回包含错误信息的JSON响应：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

HTTP状态码说明：
- 200: 请求成功
- 400: 请求参数错误（如缺少必填参数）
- 404: 资源未找到
- 500: 服务器内部错误

## 性能优化建议

1. **使用分页**：对于大量数据查询，务必使用分页参数（page和limit），避免一次性返回过多数据。

2. **合理使用筛选**：尽可能使用lesson、group等筛选条件缩小查询范围，提高查询效率。

3. **缓存频繁查询的数据**：对于课程列表、分组列表等不经常变化的数据，客户端可以进行缓存。

## 数据文件说明

数据文件位于 `public/words.csv`，包含以下字段：

- **textId**: 唯一标识符
- **word**: 日语单词（汉字）
- **kana**: 假名读音
- **pos**: 词性
- **desc**: 中文释义
- **group**: 分组编号
- **lesson**: 课程编号

## 技术实现

- 使用Hono Web框架搭建REST API服务器
- CSV解析模块：`src/csv-parser.ts`
- 单词查询服务：`src/word-service.ts`
- 主应用文件：`src/index.tsx`
- 总数据量：5754条日语单词记录
