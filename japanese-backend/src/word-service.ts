import type { Word } from './csv-parser';

/**
 * 单词数据服务类，提供查询功能
 */
export class WordService {
  private words: Word[];

  constructor(words: Word[]) {
    this.words = words;
  }

  /**
   * 获取所有单词
   */
  getAllWords(): Word[] {
    return [...this.words];
  }

  /**
   * 根据textId获取单个单词
   */
  getWordById(textId: string): Word | undefined {
    return this.words.find(word => word.textId === textId);
  }

  /**
   * 搜索单词（支持单词、假名、释义模糊查询）
   */
  searchWords(query: string): Word[] {
    const lowerQuery = query.toLowerCase();
    return this.words.filter(word =>
      word.word.includes(query) ||
      word.kana.includes(query) ||
      word.desc.includes(query) ||
      word.word.toLowerCase().includes(lowerQuery) ||
      word.kana.toLowerCase().includes(lowerQuery) ||
      word.desc.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 根据课程编号筛选单词
   */
  getWordsByLesson(lesson: number): Word[] {
    return this.words.filter(word => word.lesson === lesson);
  }

  /**
   * 根据分组编号筛选单词
   */
  getWordsByGroup(group: number): Word[] {
    return this.words.filter(word => word.group === group);
  }

  /**
   * 根据词性筛选单词
   */
  getWordsByPOS(pos: string): Word[] {
    return this.words.filter(word => word.pos === pos);
  }

  /**
   * 复合查询（支持多个筛选条件）
   */
  queryWords(filters: {
    keyword?: string;
    lesson?: number;
    group?: number;
    pos?: string;
  }): Word[] {
    let results = [...this.words];

    if (filters.keyword) {
      results = results.filter(word =>
        word.word.includes(filters.keyword!) ||
        word.kana.includes(filters.keyword!) ||
        word.desc.includes(filters.keyword!)
      );
    }

    if (filters.lesson !== undefined && filters.lesson !== null) {
      results = results.filter(word => word.lesson === filters.lesson);
    }

    if (filters.group !== undefined && filters.group !== null) {
      results = results.filter(word => word.group === filters.group);
    }

    if (filters.pos) {
      results = results.filter(word => word.pos === filters.pos);
    }

    return results;
  }

  /**
   * 分页查询
   */
  paginate(words: Word[], page: number = 1, limit: number = 20): {
    data: Word[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    const total = words.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: words.slice(startIndex, endIndex),
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * 获取所有课程编号列表
   */
  getLessonList(): number[] {
    const lessons = new Set(this.words.map(word => word.lesson));
    return Array.from(lessons).sort((a, b) => a - b);
  }

  /**
   * 获取所有分组编号列表
   */
  getGroupList(): number[] {
    const groups = new Set(this.words.map(word => word.group));
    return Array.from(groups).sort((a, b) => a - b);
  }

  /**
   * 获取所有词性列表
   */
  getPOSList(): string[] {
    const poses = new Set(this.words.map(word => word.pos));
    return Array.from(poses).sort();
  }
}
