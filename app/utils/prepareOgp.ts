/**
 * Markdownテキストに含まれるOGP情報を事前に取得する
 */

import { extractStandaloneLinks } from './extractLinks.ts';
import { fetchOGPInfo, type OGPInfo } from './ogp.ts';

/**
 * Markdownテキストに含まれるスタンドアロンリンクのOGP情報を事前に取得
 * @param markdown Markdownテキスト
 * @returns OGP情報のマップ
 */
export async function prepareOGPData(markdown: string): Promise<Map<string, OGPInfo>> {
  const links = extractStandaloneLinks(markdown);
  const ogpData = new Map<string, OGPInfo>();
  
  // 並列でOGP情報を取得
  const promises = links.map(async (link) => {
    try {
      const ogpInfo = await fetchOGPInfo(link.url);
      if (ogpInfo && (ogpInfo.title || ogpInfo.description)) {
        ogpData.set(link.url, ogpInfo);
      }
    } catch (error) {
      console.error(`Failed to fetch OGP for ${link.url}:`, error);
    }
  });
  
  await Promise.all(promises);
  
  return ogpData;
}