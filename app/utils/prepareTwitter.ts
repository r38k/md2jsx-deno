/**
 * Markdownテキストから Twitter/X リンクを抽出して、oEmbed データを取得する
 */

import { isTwitterUrl, fetchTwitterEmbed, type TwitterEmbedData } from './twitter.ts';

/**
 * MarkdownからTwitter/X URLを抽出
 */
function extractTwitterUrls(markdown: string): string[] {
  // URLパターンを抽出（シンプルなリンクとインラインリンクの両方に対応）
  const linkPattern = /(?:\[([^\]]*)\]\((https?:\/\/[^)]+)\))|(?:^|\s)(https?:\/\/[^\s]+)(?:\s|$)/gm;
  const urls: string[] = [];
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = match[2] || match[3];
    if (url && isTwitterUrl(url)) {
      urls.push(url);
    }
  }

  return [...new Set(urls)]; // 重複を削除
}

/**
 * Twitter/X データをサーバーサイドで事前に取得
 */
export async function prepareTwitterData(markdown: string): Promise<Map<string, TwitterEmbedData>> {
  const twitterUrls = extractTwitterUrls(markdown);
  const twitterData = new Map<string, TwitterEmbedData>();

  // 並列でTwitter埋め込みデータを取得
  const promises = twitterUrls.map(async (url) => {
    const embedData = await fetchTwitterEmbed(url);
    if (embedData) {
      twitterData.set(url, embedData);
    }
  });

  await Promise.all(promises);
  return twitterData;
}