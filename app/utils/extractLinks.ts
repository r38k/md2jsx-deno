/**
 * Markdownからスタンドアロンリンクを抽出する
 */

export interface LinkInfo {
  lineIndex: number;
  url: string;
  text: string;
}

/**
 * Markdownテキストからスタンドアロンリンクを抽出
 * @param markdown Markdownテキスト
 * @returns スタンドアロンリンクの情報配列
 */
export function extractStandaloneLinks(markdown: string): LinkInfo[] {
  const lines = markdown.split('\n');
  const links: LinkInfo[] = [];
  const linkRegex = /^\[([^\]]+?)\]\(([^)]+?)\)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(linkRegex);
    
    if (match && match[2].match(/^https?:\/\//)) {
      links.push({
        lineIndex: i,
        url: match[2],
        text: match[1]
      });
    }
  }
  
  return links;
}