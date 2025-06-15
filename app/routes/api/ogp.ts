import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const url = c.req.query('url')
  
  if (!url) {
    return c.json({ error: 'URL parameter is required' }, 400)
  }
  
  try {
    // URLバリデーション
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return c.json({ error: 'Invalid URL protocol' }, 400)
    }
    
    // OGP情報を取得
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; md2jsx-deno/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5秒のタイムアウト
    })
    
    if (!response.ok) {
      return c.json({ error: `Failed to fetch URL: ${response.status}` }, 502)
    }
    
    const html = await response.text()
    
    // OGP情報を抽出
    const ogpInfo: Record<string, string> = {}
    
    // og:title
    const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    if (titleMatch) {
      ogpInfo.title = titleMatch[1]
    } else {
      // fallback to title tag
      const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleTagMatch) {
        ogpInfo.title = titleTagMatch[1]
      }
    }
    
    // og:description
    const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (descMatch) {
      ogpInfo.description = descMatch[1]
    } else {
      // fallback to meta description
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      if (metaDescMatch) {
        ogpInfo.description = metaDescMatch[1]
      }
    }
    
    // og:image
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    if (imageMatch) {
      // 相対URLを絶対URLに変換
      try {
        const imageUrl = new URL(imageMatch[1], url)
        ogpInfo.image = imageUrl.toString()
      } catch {
        ogpInfo.image = imageMatch[1]
      }
    }
    
    // og:site_name
    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
    if (siteNameMatch) {
      ogpInfo.siteName = siteNameMatch[1]
    }
    
    // og:url
    const urlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)
    if (urlMatch) {
      ogpInfo.url = urlMatch[1]
    } else {
      ogpInfo.url = url
    }
    
    return c.json(ogpInfo)
  } catch (error) {
    console.error(`Failed to fetch OGP info for ${url}:`, error)
    return c.json({ error: 'Failed to fetch OGP information' }, 500)
  }
})