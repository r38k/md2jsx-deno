/**
 * Twitter/X oEmbed API utilities
 */

export interface TwitterEmbedData {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height: number | null;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}

/**
 * Twitter/X投稿のURLかどうかを判定
 */
export function isTwitterUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // twitter.com または x.com のドメインをチェック
    if (hostname === 'twitter.com' || hostname === 'x.com' || 
        hostname === 'www.twitter.com' || hostname === 'www.x.com') {
      // /ユーザー名/status/ツイートID のパターンをチェック
      const pathMatch = urlObj.pathname.match(/^\/[^\/]+\/status\/\d+/);
      return pathMatch !== null;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Twitter/X oEmbed APIからツイート情報を取得
 */
export async function fetchTwitterEmbed(url: string): Promise<TwitterEmbedData | null> {
  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      console.error(`Failed to fetch Twitter embed: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as TwitterEmbedData;
    return data;
  } catch (error) {
    console.error('Error fetching Twitter embed:', error);
    return null;
  }
}

/**
 * TwitterのHTMLからテキストコンテンツを抽出
 * (インラインスタイル表示用)
 */
export function extractTwitterContent(html: string): {
  text: string;
  author: string;
  date: string;
} {
  // HTMLをパースして主要な情報を抽出
  // ツイート本文を取得
  const textMatch = html.match(/<p[^>]*>([^<]+)<\/p>/);
  const text = textMatch ? textMatch[1] : '';
  
  // 作者名を取得（&mdash;の後）
  const authorMatch = html.match(/&mdash;\s*([^(@]+)/);
  const author = authorMatch ? authorMatch[1].trim() : '';
  
  // 日付を取得
  const dateMatch = html.match(/<a[^>]*>([^<]*\d{4})<\/a>/);
  const date = dateMatch ? dateMatch[1] : '';
  
  return { text, author, date };
}