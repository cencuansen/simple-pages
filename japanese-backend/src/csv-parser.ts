export interface Word {
  textId: string;
  word: string;
  kana: string;
  pos: string;
  desc: string;
  group: number;
  lesson: number;
}

/**
 * 解析CSV文件内容为单词数组
 */
export async function parseCSV(csvContent: string): Promise<Word[]> {
  const lines = csvContent.trim().split('\n');

  // 跳过标题行
  const dataLines = lines.slice(1);

  const words: Word[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue; // 跳过空行

    const fields = line.split(',');

    // 确保有足够字段
    if (fields.length >= 7) {
      words.push({
        textId: fields[0]?.trim() || '',
        word: fields[1]?.trim() || '',
        kana: fields[2]?.trim() || '',
        pos: fields[3]?.trim() || '',
        desc: fields[4]?.trim() || '',
        group: parseInt(fields[5]?.trim() || '0'),
        lesson: parseInt(fields[6]?.trim() || '0')
      });
    }
  }

  return words;
}
