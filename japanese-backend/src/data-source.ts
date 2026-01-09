import { parseCSV } from './csv-parser';
import { WordService } from './word-service';

/**
 * 初始化数据源
 */
export async function initializeData(): Promise<WordService> {
  try {
    // 读取CSV文件内容（兼容多种运行环境）
    let csvContent: string;

    // 尝试使用fetch读取（适用于浏览器和Cloudflare Workers环境）
    try {
      const response = await fetch('/words.csv');
      csvContent = await response.text();
    } catch {
      // 如果fetch失败，尝试使用Node.js文件系统
      const fs = await import('fs');
      const path = await import('path');
      const __dirname = path.dirname(new URL(import.meta.url).pathname);
      const csvPath = path.join(__dirname, '../public/words.csv');
      csvContent = fs.readFileSync(csvPath, 'utf-8');
    }

    const words = await parseCSV(csvContent);

    console.log(`Loaded ${words.length} words from CSV file`);

    return new WordService(words);
  } catch (error) {
    console.error('Failed to initialize word database:', error);
    throw error;
  }
}

