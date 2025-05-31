/**
 * OGP情報を取得するユーティリティ
 */

export interface OGPInfo {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url?: string;
}

// OGP情報のキャッシュ
const ogpCache = new Map<string, OGPInfo>();

/**
 * URLからOGP情報を取得する
 * @param url 対象のURL
 * @returns OGP情報
 */
export async function fetchOGPInfo(url: string): Promise<OGPInfo | null> {
  // キャッシュチェック
  if (ogpCache.has(url)) {
    return ogpCache.get(url)!;
  }

  try {
    // URLが相対パスや無効な場合はスキップ
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    // ブラウザ環境かサーバー環境かを判定
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // ブラウザ環境ではAPIエンドポイントを使用（CORS回避）
      const apiUrl = `/api/ogp?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error('Failed to fetch OGP via API:', response.status);
        return null;
      }
      
      const ogpInfo = await response.json() as OGPInfo;
      
      // キャッシュに保存
      if (ogpInfo && (ogpInfo.title || ogpInfo.description)) {
        ogpCache.set(url, ogpInfo);
      }
      
      return ogpInfo;
    } else {
      // サーバー環境では直接取得
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; md2jsx-deno/1.0)',
        },
        signal: AbortSignal.timeout(5000), // 5秒のタイムアウト
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      
      // OGP情報を抽出
      const ogpInfo: OGPInfo = {};

      // og:title
      const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (titleMatch) {
        ogpInfo.title = titleMatch[1];
      } else {
        // fallback to title tag
        const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleTagMatch) {
          ogpInfo.title = titleTagMatch[1];
        }
      }

      // og:description
      const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatch) {
        ogpInfo.description = descMatch[1];
      } else {
        // fallback to meta description
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (metaDescMatch) {
          ogpInfo.description = metaDescMatch[1];
        }
      }

      // og:image
      const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (imageMatch) {
        // 相対URLを絶対URLに変換
        try {
          const imageUrl = new URL(imageMatch[1], url);
          ogpInfo.image = imageUrl.toString();
        } catch {
          ogpInfo.image = imageMatch[1];
        }
      }

      // og:site_name
      const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
      if (siteNameMatch) {
        ogpInfo.siteName = siteNameMatch[1];
      }

      // og:url
      const urlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
      if (urlMatch) {
        ogpInfo.url = urlMatch[1];
      } else {
        ogpInfo.url = url;
      }

      // キャッシュに保存
      ogpCache.set(url, ogpInfo);

      return ogpInfo;
    }
  } catch (error) {
    console.error(`Failed to fetch OGP info for ${url}:`, error);
    return null;
  }
}

/**
 * キャッシュをクリアする
 */
export function clearOGPCache(): void {
  ogpCache.clear();
}