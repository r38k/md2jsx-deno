import { reactRenderer } from '@hono/react-renderer'
import { Link, Script } from 'honox/server'

export default reactRenderer(({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        {/* Tailwind */}
        <Link href="/app/style.css" rel="stylesheet" />
        <Script src="/app/client.ts" async />
      </head>
      <body className='bg-gray-700 text-white'>{children}</body>
    </html>
  )
})
